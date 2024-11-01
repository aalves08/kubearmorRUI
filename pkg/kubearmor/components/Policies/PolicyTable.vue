<script>
import semver from 'semver';
import { SCHEMA } from '@shell/config/types';
import { _CREATE, CATEGORY, SEARCH_QUERY } from '@shell/config/query-params';
import { SHOW_PRE_RELEASE } from '@shell/store/prefs';
import { ensureRegex } from '@shell/utils/string';
import { sortBy } from '@shell/utils/sort';

import LabeledSelect from '@shell/components/form/LabeledSelect';
import { LabeledInput } from '@components/Form/LabeledInput';
import { Checkbox } from '@components/Form/Checkbox';

import { KUBEARMOR_PRODUCT_NAME } from '../../types'; // Replace with Kubearmor constants
import { POLICY_TABLE_HEADERS } from '../../config/table-headers'; // Adjust table headers to fit Kubearmor policies

import SortableTableWrapper from '../SortableTableWrapper.vue';

export default {
  props: {
    mode: {
      type:    String,
      default: _CREATE
    },

    value: {
      type:    Array,
      default: () => {
        return [];
      }
    }
  },

  components: {
    Checkbox, LabeledSelect, LabeledInput, SortableTableWrapper
  },

  fetch() {
    const query = this.$route.query;

    this.category = query[CATEGORY] || '';
    this.searchQuery = query[SEARCH_QUERY] || '';
  },

  data() {
    return {
      KUBEARMOR_PRODUCT_NAME,
      POLICY_TABLE_HEADERS,

      attributes:  [this.t('kubearmor.utils.attributes.optionLabels.all')],
      searchQuery: null,

      hidePackages: [], // Removed the `showKubearmorOfficial` attribute
    };
  },

  computed: {
    allSchemas() {
      return this.$store.getters['cluster/all'](SCHEMA);
    },

    filteredPackages() {
      const filteredPackages = this.value?.filter((artifactHubPackage) => {
        const isPreRelease = this.isPrerelease(artifactHubPackage);

        if (!this.showPreRelease && isPreRelease) {
          return false;
        }

        return true;
      });

      return filteredPackages || [];
    },

    filteredSubtypes() {
      const subtypes = (this.filteredPackages || []);

      const out = subtypes.filter((subtype) => {
        // Search query filtering
        if (this.searchQuery) {
          const searchTokens = this.searchQuery.split(/\s*[, ]\s*/).map(x => ensureRegex(x, false));

          const matchesSearch = searchTokens.every(token => (
            subtype.display_name?.match(token) ||
            (subtype.description && subtype.description.match(token)) ||
            subtype.keywords?.some(keyword => keyword.match(token))
          ));

          if (!matchesSearch) {
            return false;
          }
        }

        // Attribute filtering
        if (this.attributes.length) {
          if (this.attributes.includes(this.t('kubearmor.utils.attributes.optionLabels.all'))) {
            return true;
          }

          const matchesAttributes = this.attributes.some((attribute) => {
            const isFeature = this.featureOptions.includes(attribute);

            if (isFeature) {
              const normalizedAttribute = attribute === 'Mutation' ? 'mutation' : 'contextAwareResources';

              return subtype.data?.[`kubearmor/${normalizedAttribute}`];
            }

            // Replace 'kubearmor/resources' with the appropriate field for Kubearmor
            return subtype.data?.['kubearmor/resources']?.includes(attribute);
          });

          if (!matchesAttributes) {
            return false;
          }
        }

        return true;
      });

      return sortBy(out, ['name']);
    },

    attributeOptions() {
      const out = [];

      // Ensure resourceOptions is properly computed for Kubearmor policies
      if (this.resourceOptions.length) {
        out.push({
          kind:  'group',
          label: this.t('kubearmor.utils.attributes.optionLabels.resource'),
        }, ...this.resourceOptions);
      }

      if (this.featureOptions.length) {
        out.push({
          kind:  'group',
          label: this.t('kubearmor.utils.attributes.optionLabels.features'),
        }, ...this.featureOptions);
      }

      if (out.length) {
        out.unshift(
          this.t('kubearmor.utils.attributes.optionLabels.all'),
          { kind: 'divider', label: 'divider' }
        );
      }

      return out;
    },

    featureOptions() {
      const featuresList = [];

      for (const subtype of this.filteredPackages) {
        if (subtype?.data?.['kubearmor/mutation'] === 'true') {
          featuresList.push('Mutation');
        }

        if (subtype?.data?.['kubearmor/contextAwareResources']) {
          featuresList.push('Context Aware');
        }
      }

      if (!featuresList || featuresList.length === 0) {
        return [];
      }

      return [...new Set(featuresList.filter(Boolean))];
    },

    resourceOptions() {
      const resources = this.filteredPackages?.flatMap((subtype) => {
        // Adjust for Kubearmor - check the appropriate fields for resources in Kubearmor
        return subtype?.data?.['kubearmor/resources'] || [];
      });

      if (!resources || resources.length === 0) {
        return [];
      }

      return [...new Set(resources.filter(Boolean))];
    },

    showPreRelease() {
      return this.$store.getters['prefs/get'](SHOW_PRE_RELEASE);
    }
  },

  methods: {
    isPrerelease(artifactHubPackage) {
      return !!semver.prerelease(artifactHubPackage.version);
    },

    refresh() {
      this.category = null;
      this.attributes = [this.t('kubearmor.utils.attributes.optionLabels.all')];
      this.searchQuery = null;
    },

    handleAttributeSelect(selected) {
      const allOption = this.t('kubearmor.utils.attributes.optionLabels.all');

      if (selected.includes(allOption)) {
        if (selected.length === 1 || selected.indexOf(allOption) !== 0) {
          this.attributes = [allOption];
        } else {
          this.attributes = selected.filter(attr => attr !== allOption);
        }
      } else {
        this.attributes = selected.filter(attr => attr !== allOption);
      }
    }
  }
};
</script>

<template>
  <div class="policy-table-container">
    <div class="filter">
      <LabeledSelect
        v-if="attributeOptions.length"
        v-model="attributes"
        data-testid="kw-table-filter-source"
        :clearable="true"
        :taggable="true"
        :mode="mode"
        :multiple="true"
        class="filter__attributes"
        label-key="kubearmor.utils.attributes.label"
        :options="attributeOptions"
        @selecting="e => handleAttributeSelect(e)"
      />

      <LabeledInput
        ref="searchQuery"
        v-model="searchQuery"
        data-testid="kw-table-filter-search"
        :mode="mode"
        class="input-sm filter__search"
        :label="('Search By Name')"
        :placeholder="('Enter Name')"
      />

      <button
        ref="btn"
        data-testid="kw-table-filter-refresh"
        class="btn role-tertiary filter__reset"
        type="button"
        @click="refresh"
      >
        <p>
          {{ ('Reset Filter') }}
        </p>
      </button>
    </div>

    <div class="policy-table-actions">
      <button
        ref="btn"
        data-testid="kw-table-custom-buttom"
        class="btn role-tertiary"
        type="button"
        @click="$emit('selectType', 'custom')"
      >
        <p>
          {{ ('Create Custom Policy') }}
        </p>
      </button>
    </div>

    <SortableTableWrapper
      :rows="filteredSubtypes"
      :headers="POLICY_TABLE_HEADERS"
      :table-actions="false"
      :row-actions="false"
      key-field="package_id"
      default-sort-by="name"
      :paging="true"
      :search="false"
      @selectRow="(row) => $emit('selectType', row)"
    />
  </div>
</template>

<style lang="scss" scoped>
.policy-table-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.policy-table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter {
  width: 100%;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: repeat(2, 1fr) .25fr;
  grid-template-areas:
    "attributes search reset";

  gap: 1rem;

  & > * {
    margin: 0.5rem 0;
  }

  &__attributes {
    grid-area: attributes;
  }

  &__search {
    grid-area: search;
  }

  &__reset {
    grid-area: reset;

    p {
      line-height: 1.5;
      white-space: wrap;
    }
  }
}

::v-deep tr:hover {
  cursor: pointer;
}
</style>
