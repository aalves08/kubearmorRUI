<template>
  <div>
    <span v-if="formattedSelector">
      {{ formattedSelector }}
    </span>
    <span v-else>
      {{ JSON.stringify(value) }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    row: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    formattedSelector() {
      if (this.value && Array.isArray(this.value.matchExpressions)) {
        return JSON.stringify(this.value.matchExpressions);
      }
      return null;
    }
  }
};
</script>