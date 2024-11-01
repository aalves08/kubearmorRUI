<template>
  <div v-if="showUrl">
    <a :href="`https://artifacthub.io/packages/kubearmor/sample-kubearmor-policies/${resources}`" target="_blank" rel="noopener noreferrer">
      {{ resources }}
    </a>
  </div>
</template>

<script>
export default {
  props: {
    row: {
      type: Object,
      required: true
    }
  },

  computed: {
    resources() {
      return this.row.name;
    },
    showUrl() {
      return this.row?.repository?.organization_name?.toLowerCase() === 'artifacthub';
    }
  }
};
</script>
