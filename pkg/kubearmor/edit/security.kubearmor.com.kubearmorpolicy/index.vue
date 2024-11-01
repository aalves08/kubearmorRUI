<script>
import jsyaml from 'js-yaml';
import { _CREATE, _EDIT } from '@shell/config/query-params';
import CreateEditView from '@shell/mixins/create-edit-view';

import CruResource from '@shell/components/CruResource';
import { removeEmptyAttrs } from '../../utils/object';
import { handleGrowl } from '../../utils/handle-growl';

import Configed from '../../components/Policies/Configged.vue';
import Created from '../../components/Policies/Created.vue';
export default {
  name: 'AdmissionPolicy',

  props: {
    value: {
      type:     Object,
      required: true
    },

    mode: {
      type:    String,
      default: _EDIT
    },

    realMode: {
      type:    String,
      default: _EDIT
    }
  },

  components: {
    CruResource, Configed, Created
  },

  mixins: [CreateEditView],

  provide() {
    return { chartType: this.value.type, realMode: this.realMode };
  },

  computed: {
    isCreate() {
      return this.realMode === _CREATE;
    },
  },

  methods: {
    async finish(event) {
      try {
        removeEmptyAttrs(this.value);
        await this.save(event);
      } catch (e) {
        handleGrowl({ error: e, store: this.$store });
      }
    },

    updateYamlValuesFromEdit(val) {
      const parsed = jsyaml.load(val);
      
      removeEmptyAttrs(parsed);
      Object.assign(this.value, parsed);
    }
  }
};
</script>

<template>
  <Created v-if="isCreate" :value="value" :mode="mode" />
  <CruResource
    v-else
    :resource="value"
    :mode="realMode"
    :can-yaml="false"
    @finish="finish"
  >
    <Configed
      :value="value"
      :mode="realMode"
      @updateYamlValues="updateYamlValuesFromEdit"
    />
  </CruResource>
</template>

<style lang="scss" scoped>
::v-deep .cru__footer {
  z-index: 1;
}
</style>
