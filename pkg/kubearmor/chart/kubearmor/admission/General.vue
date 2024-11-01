<script>
import isEmpty from 'lodash/isEmpty';

import { _CREATE } from '@shell/config/query-params';
import { set } from '@shell/utils/object';

import LabeledSelect from '@shell/components/form/LabeledSelect';
import Loading from '@shell/components/Loading';
import NameNsDescription from '@shell/components/form/NameNsDescription';
import { Banner } from '@components/Banner';
import { LabeledInput } from '@components/Form/LabeledInput';
import { RadioGroup } from '@components/Form/Radio';

import { KUBEWARDEN, KUBEWARDEN_APPS } from '../../../types';

export default {
  name: 'General',

  inject: ['chartType'],

  props: {
    mode: {
      type:    String,
      default: _CREATE
    },
    targetNamespace: {
      type:     String,
      required: true
    },
    isCustom: {
      type:    Boolean,
      default: false
    },
    value: {
      type:     Object,
      required: true
    }
  },

  components: {
    LabeledSelect,
    Loading,
    NameNsDescription,
    Banner,
    LabeledInput,
    RadioGroup
  },

  async fetch() {
    if ( this.$store.getters['cluster/canList'](KUBEWARDEN.POLICY_SERVER) ) {
      await this.$store.dispatch('cluster/findAll', { type: KUBEWARDEN.POLICY_SERVER });
    }
  },

  data() {
    let policy = null;

    if ( this.value?.policy ) {
      policy = this.value.policy;
    } else {
      policy = this.value || {};
    }

    // fix for https://github.com/rancher/kubewarden-ui/issues/672
    // enforce `default` as namespace for creation of AP's
    if ( this.mode === _CREATE && this.chartType === KUBEWARDEN.ADMISSION_POLICY ) {
      set(policy.metadata, 'namespace', 'default');
    }

    return {
      policy,
      initialPolicyMode: null,
      isNamespaceNew:    false
    };
  },

  watch: {
    isNamespaceNew(neu) {
      this.$set(this.value, 'isNamespaceNew', neu);
    }
  },

  created() {
    if ( this.policyMode ) {
      this.initialPolicyMode = this.policyMode;
    }
  },

  beforeUpdate() {
    this.$nextTick(() => {
      // In order to fix the layout of the NameNsDescription component
      // we need to adjust the classes of the child elements
      const wrapper = this.$refs?.nameNsDescriptionWrapper;

      const children = wrapper?.querySelectorAll('.row.mb-20 > .col.span-3');

      if ( this.isGlobal ) {
        if ( children?.length === 1 ) {
          children[0].classList.remove('span-3');
          children[0].classList.add('span-12');
        }
      } else if ( children?.length === 2 ) {
        children[0].classList.remove('span-3');
        children[0].classList.add('span-4');
        children[1].classList.remove('span-3');
        children[1].classList.add('span-8');
      }
    });
  },

  computed: {
    isCreate() {
      return this.mode === _CREATE;
    },

    isGlobal() {
      return this.chartType === KUBEWARDEN.CLUSTER_ADMISSION_POLICY;
    },

    modeDisabled() {
      // Kubewarden doesn't allow switching a policy from 'protect' to 'monitor'
      if ( !this.isCreate ) {
        return this.initialPolicyMode === 'protect';
      }

      return false;
    },

    policyMode() {
      return this.value?.policy?.spec?.mode;
    },

    policyServers() {
      return this.$store.getters['cluster/all'](KUBEWARDEN.POLICY_SERVER);
    },

    policyServerOptions() {
      if ( this.policyServers?.length > 0 ) {
        const out = [];

        this.policyServers.map(p => out.push(p.id));

        return out;
      }

      return this.policyServers || [];
    },

    showModeBanner() {
      if ( !this.isCreate && ( this.initialPolicyMode === 'monitor' && this.policyMode === 'protect' ) ) {
        return true;
      }

      return false;
    }
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending" mode="relative" />
  <div v-else>
    <div class="row">
      <div ref="nameNsDescriptionWrapper" class="col span-6 name-col">
        <NameNsDescription
          data-testid="kw-policy-general-name-input"
          :mode="mode"
          :value="policy"
          :namespaced="!isGlobal"
          :namespace-new-allowed="true"
          name-key="metadata.name"
          namespace-key="metadata.namespace"
          @isNamespaceNew="isNamespaceNew = $event"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.name-col div:before, .name-col div:after {
  content: unset;
  display: unset;
}
</style>