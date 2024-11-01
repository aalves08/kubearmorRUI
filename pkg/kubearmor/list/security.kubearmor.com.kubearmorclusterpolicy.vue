<script>
import { Banner } from '@components/Banner';
import Loading from '@shell/components/Loading';
import ResourceTable from '@shell/components/ResourceTable.vue'
import { AGE } from '@shell/config/table-headers';

export default {
  components: {
    Banner, Loading, ResourceTable
  },

  props: {
    resource: {
      type:     String,
      required: true,
    },
    schema: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    await this.$store.dispatch('cluster/findAll', { type: this.resource });
  },

  computed: {
    rows() {
      return this.$store.getters['cluster/all'](this.resource);
    },
    headers() {
      return [
      {
          name: 'name',
          label: 'Name',
          value: 'metadata.name',
          sort: ['metadata.name'],
          formatter: 'LinkDetail',
        },
        AGE,
        {
          name: 'action',
          label: 'Action',
          value: 'spec.action',
          sort: ['spec.action'],
        },
        {
          name: 'selector',
          label: 'Selector',
          value: 'spec.selector.matchExpressions',
          formatter: 'matchExpressions',
          sort: (a, b) => {
            const aSelector = JSON.stringify(a.spec.selector?.matchExpressions || {});
            const bSelector = JSON.stringify(b.spec.selector?.matchExpressions || {});
            return aSelector.localeCompare(bSelector);
          },
        },
      ];
    },
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <Banner
      data-testid="kw-ap-list-banner"
      class="type-banner mb-20 mt-0"
      color="info"
      :label="t('kubewarden.admissionPolicy.description')"
    
    /> 
    <ResourceTable :schema="schema" :rows="rows" :headers="headers" />
  </div>
</template>
