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
      return this.row.description;
    }
  }
};
</script>

<template>
  <div>
    {{ features }}
  </div>
</template>