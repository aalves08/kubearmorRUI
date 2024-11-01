<script>

export default {
  props: {
    row: {
      type:     Object,
      required: true
    }
  },

  computed: {
    isOfficial() {
      return this.row?.repository?.organization_name?.toLowerCase() === "artifacthub";
    },

    subtypeSignature() {
      return this.row?.signatures?.[0] || 'unknown';
    }
  }
};
</script>

<template>
  <div class="badge">
    <div v-if="row.signed" class="badge__signed">
      <span v-clean-tooltip="t('kubewarden.policyCharts.signedPolicy.tooltip', { signatures: subtypeSignature })">
        <i class="icon icon-lock" />
      </span>
    </div>
    <div v-if="isOfficial" class="badge__icon">
      <img
        v-clean-tooltip="('Kubearmor official policy')"
        src="../assets/kubearmor.svg"
        :alt="t('kubewarden.policies.official')"
        class="ml-5"
        style="height: 15px;"
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.badge {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;

  &__icon {
    width: 20px;
  }
}
</style>