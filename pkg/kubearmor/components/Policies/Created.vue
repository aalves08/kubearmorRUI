<script>
import jsyaml from 'js-yaml';
import merge from 'lodash/merge';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import CreateEditView from '@shell/mixins/create-edit-view';
import { NAMESPACE } from '@shell/config/types';
import { _CREATE } from '@shell/config/query-params';
import { saferDump } from '@shell/utils/create-yaml';
import { set } from '@shell/utils/object';
import { addParams } from '@shell/utils/url';
import { Banner } from '@components/Banner';
import { MANAGEMENT, SERVICE } from '@shell/config/types';
import AsyncButton from '@shell/components/AsyncButton';
import Loading from '@shell/components/Loading';
import Wizard from '@shell/components/Wizard';
import { DATA_ANNOTATIONS } from '../../types/artifacthub';
import PolicyTable from '../../components/Policies/PolicyTable.vue';
import { handleGrowl } from '../../utils/handle-growl';
import { ARTIFACTHUB_ENDPOINT, ARTIFACTHUB_PKG_ANNOTATION, VALUES_STATE, KUBEARMOR_PRODUCT_NAME, KUBEWARDEN, DEFAULT_POLICY } from '../../types';
import PolicyReadmePanel from '../../components/Policies/PolicyReadmePanel.vue';
import Values from '../../components/Policies/Values.vue';
import { removeEmptyAttrs } from '../../utils/object';
export default {
  name: 'Create',

  props: {
    mode: {
      type: String,
      default: _CREATE
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },

  components: {
    AsyncButton,
    Banner,
    Loading,
    Wizard,
    PolicyTable,
    PolicyReadmePanel,
    Values,
  },


  mixins: [CreateEditView],
  created() {
    this.$store.dispatch('management/all', { type: MANAGEMENT.SETTING });
  },
  async fetch() {
    if (this.hasArtifactHub) {
      await this.getPackages();
    }

    this.value.apiVersion = `${this.schema?.attributes?.group}.${this.schema?.attributes?.version}`;
    this.value.kind = this.schema?.attributes?.kind;

  },
  data() {
    return {
      bannerTitle: null,
      shortDescription: null,
      loadingPackages: false,
      packages: null,
      repository: null,
      type: null,
      typeModule: null,
      version: null,
      chartValues: {
        policy: {},
        questions: {}
      },
      yamlValues: '',
      hasCustomPolicy: false,
      yamlOption: 'form',
      finishAttempts: 0,

      stepPolicies: {
        hidden: false,
        name: 'policies',
        label: 'Policies',
        ready: false,
        showSteps: false,
        weight: 99
      },
      stepValues: {
        name: 'values',
        label: 'Values',
        ready: true,
        showSteps: false,
        weight: 98
      },
      hideArtifactHubBanner: false // Initialize this
    };
  },

  computed: {

    isCreate() {
      return this.realMode === _CREATE;
    },

    isSelected() {
      return !!this.type;
    },

    customPolicy() {
      return this.type === 'custom';
    },

    canFinish() {
      if (this.yamlOption === VALUES_STATE.YAML) {
        return true;
      }

      return !!this.chartValues?.policy?.metadata.name && this.hasRequired;
    },
    hasRequired() {
      if (!isEmpty(this.chartValues?.policy) && this.chartValues.policy.spec) {
        const { selector, process, file } = this.chartValues.policy.spec;

        // Check if selector has required fields filled
        const selectorRequiredFields = ['matchLabels'];
        const selectorFilledFields = this.acceptedValues(selector, selectorRequiredFields);

        // Check if process has required fields filled
        const processRequiredFields = ['matchPaths', 'matchDirectories', 'matchPatterns'];
        const processFilledFields = processRequiredFields.some((field) => {
          return !isEmpty(process?.[field]) && process[field].some((item) => item.path || item.dir || item.pattern);
        });

        // Check if file has required fields filled
        const fileRequiredFields = ['matchPaths', 'matchDirectories', 'matchPatterns'];
        const fileFilledFields = fileRequiredFields.some((field) => {
          return !isEmpty(file?.[field]) && file[field].some((item) => item.path || item.dir || item.pattern);
        });

        // If any required fields in selector, process, or file are filled, return true
        if (!isEmpty(selectorFilledFields) && processFilledFields && fileFilledFields) {
          return true;
        }
      }
      return false;
    },

    hasArtifactHub() {
      return this.value.artifactHubWhitelist;
    },
    whitelistSetting() {
      return this.$store.getters['management/all'](MANAGEMENT.SETTING).find(
        s => s.id === 'whitelist-domain'
      );
    },
    packageValues() {
      if (this.type?.name) {
        return this.packages?.find(p => p.name === this.type.name);
      }

      return null;
    },

    steps() {
      return [this.stepPolicies, this.stepValues].sort((a, b) => b.weight - a.weight);
    }
  },
  watch: {
    type(newType) {
      if (newType?.name) {
        // Do something when this.type is updated
        console.log('Type updated, fetching packageValues');
      }
    }
  },

  methods: {
    acceptedValues(requiredProp, requiredKeys) {
      if (isEmpty(requiredKeys)) {
        return null;
      }

      let accepted;

      if (Array.isArray(requiredProp)) {
        accepted = requiredProp.find(prop => this.checkProperties(prop, requiredKeys));
      } else {
        accepted = this.checkProperties(requiredProp, requiredKeys);
      }

      return accepted;
    },
    checkProperties(requiredProp, requiredKeys) {
      const match = [];

      if (!isEmpty(requiredKeys)) {
        for (const key of requiredKeys.values()) {
          if (!isEmpty(requiredProp[key])) {
            match.push(key);
          }
        }
        if (requiredKeys && isEqual(match, requiredKeys)) {
          return requiredProp;
        }
      }

      return null;
    },
    async closeBanner(banner, retry = 0) {
      try {
        const res = await this.$store.dispatch(`kubearmor/${banner}`, true);
        if (retry === 0 && res?.type === 'error' && res?.status === 500) {
          await this.closeBanner(banner, retry + 1);
        }
      } catch (e) {
        console.error('Error closing banner:', e); // eslint-disable-line no-console
      }
    },
    async createNamespace(ns) {
      const allNamespaces = this.$store.getters['cluster/all'](NAMESPACE);
      const nsTemplate = {
        type: NAMESPACE,
        metadata: { name: ns },
        disableOpenApiValidation: false
      };

      const existing = allNamespaces?.find(n => n?.metadata?.name === ns);

      if (!existing) {
        const nsResource = await this.$store.dispatch('cluster/create', nsTemplate);

        try {
          await nsResource.save();
        } catch (e) {
          this.errors.push(e);
        }
      }
    },

    async addArtifactHub() {
      try {
        this.loadingPackages = true;
        await this.updateWhitelist('artifacthub.io');
        await this.getPackages();
        this.loadingPackages = false;
        this.hideArtifactHubBanner = true; // Hide banner after adding ArtifactHub
      } catch (e) {
        handleGrowl({ error: e, store: this.$store });
        this.loadingPackages = false;
      }
    },
    async updateWhitelist(url) {
      const whitelist = this.whitelistSetting;

      if (!whitelist || !whitelist.value) {
        console.warn('Whitelist setting not found or value is undefined');
        return;
      }

      const whitelistValue = whitelist.value.split(',');

      if (!whitelistValue.includes(url)) {
        whitelistValue.push(url);
        whitelist.value = whitelistValue.join();

        try {
          await whitelist.save();
          console.log(`Successfully added ${url} to the whitelist.`);
        } catch (e) {
          const error = e?.data || e;
          console.error('Error saving whitelist:', error);
        }
      } else {
        console.log(`${url} is already in the whitelist.`);
      }
    },

    async artifactHubRepo() {
      let url = '/meta/proxy/';
      const packages = 'packages/search';
      const params = {
        kind: 19,
        limit: 50
      };

      url += `${ARTIFACTHUB_ENDPOINT}/${packages}`;
      url = addParams(url, params);

      try {
        return await this.$store.dispatch(
          'management/request',
          { url, redirectUnauthorized: false },
          { root: true }
        );
      } catch (error) {
        console.error('Error fetching ArtifactHub reposito ReferenceError: chartValues is not definedry:', error);
        throw error;
      }
    },
    parsePackageMetadata(data) {
      if (data) {
        const parsed = JSON.parse(JSON.stringify(data));

        return jsyaml.load(parsed);
      }

      return null;
    },

    artifactHubPackage(pkg) {
      try {
        const url = `/meta/proxy/${ARTIFACTHUB_ENDPOINT}/packages/kubearmor/${pkg.repository.name}/${pkg.name}`;

        return this.$store.dispatch(
          'management/request',
          { url, redirectUnauthorized: false },
          { root: true }
        );
      } catch (e) {
        console.warn(`Error fetching package: ${e}`);
        throw e;
      }
    },
    done() {
      this.$router.replace({
        name: 'c-cluster-product-resource',
        params: {
          cluster: this.$route.params.cluster,
          product: 'kubearmor',
          resource: this.schema?.id
        }
      });
    },
    async finish(event) {
      try {
        let out;

        // Determine if YAML or form-based input
        if (this.yamlOption === 'YAML') {
          out = jsyaml.load(this.yamlValues);
          // Load YAML values
        } else {
          out = this.chartValues?.policy ? this.chartValues.policy : jsyaml.load(this.yamlValues);
        }

        // Clean up empty values from form
        removeEmptyAttrs(out);

        if (this.finishAttempts > 0) {
          // Remove keys that are no longer in the updated spec
          Object.keys(this.value.spec).forEach((key) => {
            if (!(key in out.spec)) {
              this.$delete(this.value.spec, key);
            }
          });

          // Update or add keys in the spec
          Object.keys(out.spec).forEach((key) => {
            this.$set(this.value.spec, key, out.spec[key]);
          });
        } else {
          merge(this.value, out);
        }
        if (this.chartType === KUBEWARDEN.ADMISSION_POLICY && this.chartValues?.isNamespaceNew) {
          await this.createNamespace(this.value?.metadata?.namespace);
        }
        // Attempt to save the policy
        await this.attemptSave(event); // This line triggers the save operation, which likely includes a POST request
      } catch (e) {
        console.error('Error creating Kubearmor policy:', e); // Log any errors that occur during the process
      }
    },
    async attemptSave(event) {
      await this.save(event);

      // Check for errors set by the mixin
      if (this.errors && this.errors.length > 0) {
        const error = new Error('Save operation failed');

        this.finishAttempts++;
        throw error; // Force an error to be caught in the finish method
      }
    },



    async getPackages() {
      try {
        this.repository = await this.artifactHubRepo();
        if (this.repository?.packages.length > 0) {
          const packages = await Promise.all(this.repository.packages.map(this.packageDetails));
          this.packages = packages.filter(pkg => pkg?.data?.['kubearmor/hidden-ui'] !== 'true');
        }
      } catch (e) {
        handleGrowl({ error: e, store: this.$store });
        console.warn('Error fetching packages:', e); // eslint-disable-line no-console
      }
    },

    async packageDetails(pkg) {
      try {
        return await this.artifactHubPackage(pkg);
      } catch (e) {
        console.error('Error fetching package details:', e); // eslint-disable-line no-console
      }
    },
    policyQuestions() {
      const defaultPolicy = structuredClone(DEFAULT_POLICY);

      if (this.customPolicy) {
        const updatedCustomPolicy = { spec: { contextAwareResources: [] } };
        merge(defaultPolicy, updatedCustomPolicy);
        set(this.chartValues, 'policy', defaultPolicy);
        this.yamlValues = saferDump(defaultPolicy);
        return;
      }
      const policyDetails = this.packages.find(pkg => pkg.name === this.type?.name);
      if (!policyDetails) return;

      const packageQuestions = this.parsePackageMetadata(policyDetails?.data?.[DATA_ANNOTATIONS.QUESTIONS]);

      // Handle potential YAML conversion errors
      let updatedPolicy;
      try {
        updatedPolicy = jsyaml.load(Object.values(policyDetails.data.policies)[0]);
      } catch (error) {
        console.error('Error loading policy YAML:', error);
        return;
      }

      const mergedPolicy = merge(defaultPolicy, updatedPolicy);
      set(this.chartValues, 'policy', mergedPolicy);
      this.yamlValues = saferDump(mergedPolicy);

      // Set questions and short description if available
      if (packageQuestions) {
        set(this.chartValues, 'questions', packageQuestions);
      }
      this.shortDescription = policyDetails?.description;
    },

    reset(event) {
      this.$nextTick(() => {
        if (event.step?.name === this.stepPolicies.name) {
          const initialState = ['errors', 'bannerTitle', 'shortDescription', 'type', 'typeModule', 'version', 'hasCustomPolicy'];
          initialState.forEach(i => (this[i] = null));
          this.stepPolicies.ready = false;
          this.stepValues.hidden = false;
          this.chartValues = { policy: {}, questions: {} };
          this.yamlOption = 'form';
          this.yamlValues = '';
        }
      });
    },

    selectType(type) {
      this.type = type;
      if (this.customPolicy) {
        this.$set(this, 'hasCustomPolicy', true);
      } else {
        this.$set(this, 'hasCustomPolicy', false);
      }
      this.policyQuestions();
      this.stepPolicies.ready = true;
      this.$refs.wizard.next();
      this.bannerTitle = this.customPolicy ? 'Custom Policy' : type?.display_name;
      this.typeModule = this.chartValues?.policy?.spec.module;
    },

    showReadme() {
      this.$nextTick(() => {
        if (this.packageValues && this.$refs.readmePanel) {
          this.$refs.readmePanel.show();
        } else {
          console.warn('PolicyReadmePanel is not rendered or packageValues are missing.');
        }
      });
    },

  }

}

</script>

<template>
  <div>
    <template v-if="!hideArtifactHubBanner">
      <Banner data-testid="kw-policy-create-ah-banner" class="type-banner mb-20 mt-0" color="warning" :closable="true"
        @close="closeBanner('updateHideBannerArtifactHub')">
        <div>
          <p v-clean-html="('Official Kubewarden policies are hosted on ArtifactHub. In order to show these, you will need to add to the whitelist-domain setting.')"
            class="mb-10" />
          <AsyncButton mode="artifactHub" @click="addArtifactHub" />
        </div>
      </Banner>
    </template>
    <Wizard v-if="value && !loadingPackages" ref="wizard" v-model="value" data-testid="kw-policy-create-wizard"
      :errors="errors" :steps="steps" :show-banner="false" :edit-first-step="true" class="wizard" @next="reset"
      @cancel="done" @finish="finish">
      <template #policies>
        <PolicyTable data-testid="kw-policy-create-table" :value="packages" @selectType="selectType($event)" />
      </template>
      <template #values>

        <div class="banner__title">
          <h2>{{ bannerTitle }}</h2>
          {{ }}
          <template v-if="!customPolicy">
            <p class="banner__short-description">
              {{ shortDescription }}
            </p>
            <button class="btn btn-sm role-link banner__readme-button" @click="showReadme">
              {{ ('Show Readme') }}
            </button>
          </template>
        </div>
        <Values :value="value" :chart-values="chartValues" :yaml-values="yamlValues" :mode="mode"
          :custom-policy="customPolicy" @editor="$event => yamlOption = $event"
          @updateYamlValues="$event => yamlValues = $event" />

      </template>

      <template #finish>
        <AsyncButton data-testid="kw-policy-create-finish-button" :disabled="!canFinish" mode="finish"
          @click="finish" />
      </template>
    </Wizard>

    <template v-if="packageValues && !customPolicy">
      <PolicyReadmePanel ref="readmePanel" :package-values="packageValues" />
      <template>
      </template>
    </template>
  </div>
</template>


<style lang="scss" scoped>
$padding: 5px;
$height: 110px;
$margin: 10px;
$color: var(--body-text) !important;

::v-deep .header {
  display: none;
}

::v-deep .controls-row {
  position: sticky;
  width: auto;

  .controls-steps {
    display: flex;
  }
}

::v-deep .custom {
  min-height: 110px;
}

::v-deep .subtype {
  height: $height;
  margin: $margin;
  position: relative;
  border-radius: calc(1.5 * var(--border-radius));
  border: 1px solid var(--border);
  text-decoration: none !important;
  color: $color;

  &:hover:not(.disabled) {
    box-shadow: 0 0 30px var(--shadow);
    transition: box-shadow 0.1s ease-in-out;
    cursor: pointer;
    text-decoration: none !important;
  }

  &__metadata {
    padding: $margin;

    &__label,
    &__description {
      padding-right: 20px;
    }
  }

  &__badge {
    position: absolute;
    right: 0;
    top: 0;
    padding: 4px $padding;
    border-bottom-left-radius: var(--border-radius);

    label {
      font-size: 12px;
      line-height: 12px;
      text-align: center;
      display: block;
      white-space: no-wrap;
      text-overflow: ellipsis;
      color: var(--app-rancher-accent-text);
      margin: 0;
    }
  }

  &__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
    line-height: initial;
  }

  &__description {
    margin-right: $margin;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--input-label);
  }
}

::v-deep .footer-error {
  margin-top: 15px;
}

.wizard {
  position: relative;
  height: 100%;
  z-index: 1;
}

.banner {
  &__title {
    padding-top: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--border);
    min-height: 60px;
  }

  &__readme-button {
    padding: 0 7px 0 0;
  }
}
</style>
