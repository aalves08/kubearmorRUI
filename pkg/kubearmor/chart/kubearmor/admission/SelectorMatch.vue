<script>
import KeyValue from '@shell/components/form/KeyValue';
import InfoBox from '@shell/components/InfoBox';
import { _CREATE } from '@shell/config/query-params';

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
    KeyValue,
    InfoBox
  },

  data() {
    if (!this.value.spec) {
      this.$set(this.value, 'spec', {});
    }
    if (!this.value.spec.selector) {
      this.$set(this.value.spec, 'selector', {});
    }
    if (!this.value.spec.selector.matchLabels) {
      this.$set(this.value.spec.selector, 'matchLabels', {});
    }

    return {
      matchLabels: this.value.spec.selector.matchLabels,
    };
  },

  watch: {
    matchLabels: {
      deep: true,
      handler(newVal) {
        this.$set(this.value.spec.selector, 'matchLabels', newVal);
        this.$emit('input', this.value);
      }
    }
  },
};
</script>

<template>
  <div>
    <InfoBox ref="infobox">
      <h4>
        Match Labels
        <i
          v-clean-tooltip="t('kubewarden.policyConfig.selector.matchLabels.tooltip')"
          class="icon icon-info icon-lg"
        />
      </h4>
      <div class="row mb-20">
        <div class="col span-12">
          <KeyValue
            v-model="matchLabels"
            :mode="mode"
            :add-label="t('labels.addLabel')"
            placeholder="Enter match label key"
          />
        </div>
      </div>
    </InfoBox>
  </div>
</template>