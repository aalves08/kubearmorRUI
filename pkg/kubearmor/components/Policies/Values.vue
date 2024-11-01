<script>
import isEmpty from 'lodash/isEmpty';

import { _CREATE, _EDIT, _VIEW } from '@shell/config/query-params';
import { SCHEMA } from '@shell/config/types';
import { createYaml, saferDump } from '@shell/utils/create-yaml';
import { set } from '@shell/utils/object';

import ButtonGroup from '@shell/components/ButtonGroup';
import Loading from '@shell/components/Loading';
import ResourceCancelModal from '@shell/components/ResourceCancelModal';
import Tabbed from '@shell/components/Tabbed';
import YamlEditor, { EDITOR_MODES } from '@shell/components/YamlEditor';

import { ARTIFACTHUB_ENDPOINT, ARTIFACTHUB_PKG_ANNOTATION,KUBEWARDEN_CHARTS, VALUES_STATE, YAML_OPTIONS } from '../../types';

export default {
  name: 'Values',

  props: {
    mode: {
      type:     String,
      default:  _VIEW
    },
    chartValues: {
      type:     Object,
      default:  () => {}
    },
    customPolicy: {
      type:    Boolean,
      default: false
    },
    value: {
      type:     Object,
      required: true
    },
    yamlValues: {
      type:    String,
      default: ''
    }
  },

  components: {
    ButtonGroup, Loading, ResourceCancelModal, Tabbed, YamlEditor
  },

  async fetch() {
    try {
      this.version = this.$store.getters['catalog/version']({
        repoType:      'cluster',
        repoName:      'kubearmor',
        chartName:     KUBEWARDEN_CHARTS.CONTROLLER,
      });
      await this.loadValuesComponent();
    } catch (e) {
      console.warn(`Unable to fetch Version: ${ e }`); // eslint-disable-line no-console
    }

    this.generateYaml();
  },

  data() {
    return {
      YAML_OPTIONS,
      currentYamlValues:   '',
      originalYamlValues:  '',
      showForm:            true,
      valuesComponent:     null,
      preYamlOption:       VALUES_STATE.FORM,
      yamlOption:          VALUES_STATE.FORM
    };
  },

  mounted() {

    // by default, every clusterAdmissionPolicy created will ignore Rancher system namespaces
    // so that policies in PROTECT mode don't crash the system
    // needs to be in this component because MatchExpression component is not automatically updated

    // if (this.mode === _CREATE && this.chartValues?.policy?.kind === 'KubeArmorPolicy') {
    //   if (!this.chartValues?.policy?.spec?.namespaceSelector) {
    //     this.chartValues.policy.spec.namespaceSelector = {};
    //   }

    //   // this.chartValues.policy.spec.namespaceSelector.matchExpressions = [RANCHER_NS_MATCH_EXPRESSION];
    // }
  },

  watch: {
    yamlOption(neu, old) {
      switch (neu) {
      case VALUES_STATE.FORM:
        this.showForm = true;
        this.$emit('editor', neu);

        break;
      case VALUES_STATE.YAML:
        if ( old === VALUES_STATE.FORM ) {
          this.currentYamlValues = saferDump(this.chartValues.policy);
          this.updateYamlValues();
        }

        this.showForm = false;
        this.$emit('editor', neu);

        break;
      }
    },
  },

  computed: {
    editorMode() {
      return EDITOR_MODES.EDIT_CODE;
    },

    isCreate() {
      return this.mode === _CREATE;
    },

    isEdit() {
      return this.mode === _EDIT;
    },  

},

  methods: {
    artifactHubPackageVersion() {
    return () => {
      if ( !this.artifactHubWhitelist ) {
        return { error: 'ArtifactHub.io has not been added to the `management.cattle.io.settings/whitelist-domain` setting' };
      }

      try {
        const pkgAnnotation = this.metadata?.annotations?.[ARTIFACTHUB_PKG_ANNOTATION];

        if ( pkgAnnotation ) {
          const url = `/meta/proxy/${ ARTIFACTHUB_ENDPOINT }/packages/kubearmor/${ pkgAnnotation }`;

          return this.$dispatch('management/request', { url, redirectUnauthorized: false }, { root: true });
        }
      } catch (e) {
        console.warn(`Error fetching pkg version: ${ e }`); // eslint-disable-line no-console
      }
    };
  },
  parsePackageMetadata(data) {
    if ( data ) {
      const parsed = JSON.parse(JSON.stringify(data));

      return jsyaml.load(parsed);
    }

    return null;
  },
    generateYaml() {
      const schemas = this.$store.getters['cluster/all'](SCHEMA);
      const cloned = this.chartValues?.policy ? structuredClone(this.chartValues.policy) : this.value;
      if ( this.yamlValues?.length ) {
        this.currentYamlValues = this.yamlValues;
      } else {
        this.currentYamlValues = createYaml(schemas, this.value?.type, cloned);
      }
    },
  haveComponent(name) {
    try {
      require.resolve(`../../chart/${ name }`);
      return true;
    } catch (e) {
      return false;
    }},
    importComponent(name) {
    if (!name) {
      throw new Error('Name required');
    }

    return () => import(/* webpackChunkName: "chart" */ `../../chart/${ name }`);
  },
    async loadValuesComponent() {
      if ( this?.haveComponent('kubearmor/admission') ) {
        this.valuesComponent = this.importComponent('kubearmor/admission');

        await this.valuesComponent();
      }
    },

    tabChanged() {
      window.scrollTop = 0;
    },

    updateYamlValues() {
      this.$emit('updateYamlValues', this.currentYamlValues);
    }
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending" mode="relative" />
  <div v-else>
    <div v-if="isCreate || isEdit" class="step__values__controls">
      <ButtonGroup
        v-model="yamlOption"
        data-testid="kw-policy-config-yaml-option"
        :options="YAML_OPTIONS"
        inactive-class="bg-disabled btn-sm"
        active-class="bg-primary btn-sm"
      />
    </div>
    <div class="scroll__container">
      <div class="scroll__content">
        <template v-if="showForm">
          <Tabbed
            ref="tabs"
            :side-tabs="true"
            class="step__values__content"
            @changed="tabChanged($event)"
          >
            <template v-if="valuesComponent">
              
              <component
                :is="valuesComponent"
                v-model="chartValues"
                :mode="mode"
                :custom-policy="customPolicy"
              />
            </template>
          </Tabbed>
        </template>
        <template v-else-if="(isCreate || isEdit) && !showForm">
          <YamlEditor
            ref="yaml"
            v-model="currentYamlValues"
            data-testid="kw-policy-config-yaml-editor"
            class="step__values__content"
            :scrolling="true"
            :initial-yaml-values="originalYamlValues"
            :editor-mode="editorMode"
            :rhide-preview-buttons="true"
            @onChanges="updateYamlValues"
          />
        </template>

        <ResourceCancelModal
          ref="cancelModal"
          data-testid="kw-policy-config-yaml-cancel"
          :is-cancel-modal="false"
          :is-form="true"
          @cancel-cancel="preYamlOption = yamlOption"
          @confirm-cancel="yamlOption = preYamlOption"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  $padding: 5px;

  .step {
    &__values {
      &__controls {
        display: flex;
        margin-bottom: 15px;

        & > *:not(:last-of-type) {
          margin-right: $padding * 2;
        }

        &--spacer {
          flex: 1
        }

      }

      &__content {
        flex: 1;

        ::v-deep .tab-container {
          overflow: auto;
        }
      }
    }
  }
</style>
