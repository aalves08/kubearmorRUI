<template>
  <div class="col mb-20">
    <div class="col mb-40">
      <h2>
        Match Protocols
        <i v-clean-tooltip="`Specify the network protocols to be matched.`" class="icon icon-info" />
      </h2>
      <ArrayListGrouped 
        v-model="value.spec.network.matchProtocols" 
        :mode="mode" 
        :add-label="'Add Match Protocol'"
        :default-add-value="{ protocol: '', fromSource: [] }">
        
        <template #default="props">
          <div class="col mb-20">
            <LabeledSelect 
              v-model="props.row.value.protocol" 
              :mode="mode" 
              :options="protocolOptions" 
              label="Protocol"
              placeholder="Select protocol"
              v-clean-tooltip="`Select a network protocol (TCP, UDP, ICMP) to match.`"
            />
          </div>

          <div class="col mb-20">
            <ArrayListGrouped
              v-model="props.row.value.fromSource"
              :mode="mode"
              :add-label="'Add Source Path'"
              :default-add-value="{ path: '' }">
              
              <template #default="sourceProps">
                <LabeledInput 
                  v-model="sourceProps.row.value.path" 
                  :mode="mode" 
                  label="Source Path"
                  placeholder="Enter source executable path"
                  v-clean-tooltip="`Specify the executable path that accesses this protocol.`"
                />
              </template>
            </ArrayListGrouped>
          </div>
        </template>
      </ArrayListGrouped>
    </div>
  </div>
</template>

<script>
import { _CREATE } from '@shell/config/query-params';
import ArrayListGrouped from '@shell/components/form/ArrayListGrouped';
import { LabeledInput } from '@components/Form/LabeledInput';
import LabeledSelect from '@shell/components/form/LabeledSelect';

export default {
  props: {
    mode: {
      type:    String,
      default: _CREATE
    },
    value: {
      type:     Object,
      required: true
    }
  },

  components: {
    ArrayListGrouped,
    LabeledInput,
    LabeledSelect
  },

  data() {
    // Ensure `spec.network` and nested properties are initialized
    if (!this.value.spec) {
      this.$set(this.value, 'spec', {});
    }
    if (!this.value.spec.network) {
      this.$set(this.value.spec, 'network', {
        matchProtocols: []
      });
    }

    return {
      protocolOptions: [
        { label: 'TCP', value: 'TCP' },
        { label: 'UDP', value: 'UDP' },
        { label: 'ICMP', value: 'ICMP' }
      ],
      network: this.value.spec.network,
    };
    
  },

  watch: {
    network: {
      deep: true,
      handler(newVal) {
        this.$set(this.value.spec, 'network', newVal);
        this.$emit('input', this.value);
      }
    }
  }
};
</script>