<script>
export default {
  props: {
    row: {
      type:     Object,
      required: true
    }
  },

  computed: {
    features() {
      return this.row.repository.organization_name;
    }
  }
};
</script>

<template>
  <div>
    {{ features }}
  </div>
</template>