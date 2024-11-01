<script>
import { _CREATE } from '@shell/config/query-params';
import { LabeledInput } from '@components/Form/LabeledInput';
import ArrayListGrouped from '@shell/components/form/ArrayListGrouped';

export default {
  name: 'BasicConfig',

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
    LabeledInput,
    ArrayListGrouped
  },

  data() {
    // Initialize `spec` and its properties if not already present
    if (!this.value.spec) {
      this.$set(this.value, 'spec', {});
    }
    if (this.value.spec.severity === undefined) {
      this.$set(this.value.spec, 'severity', 1); // Default severity to 1
    }
    if (!this.value.spec.tags) {
      this.$set(this.value.spec, 'tags', []);
    }
    if (!this.value.spec.message) {
      this.$set(this.value.spec, 'message', '');
    }

    return {
      severity: this.value.spec.severity,
      tags: this.value.spec.tags,
      message: this.value.spec.message
    };
  },

  watch: {
    severity(newVal) {
      this.$set(this.value.spec, 'severity', newVal);
      this.$emit('input', this.value);
    },
    tags: {
      deep: true,
      handler(newVal) {
        this.$set(this.value.spec, 'tags', newVal);
        this.$emit('input', this.value);
      }
    },
    message(newVal) {
      this.$set(this.value.spec, 'message', newVal);
      this.$emit('input', this.value);
    }
  },
};
</script>

<template>
  <div>
    <div class="col mb-20">
      <LabeledInput
        v-model="severity"
        :mode="mode"
        type="number"

        label="Severity"
        placeholder="Enter a severity level (1-10)"
        min="1"
        max="10"
        :tooltip="`Specify the severity level (default is 1)`"
      />
    </div>

    <div class="col mb-20">
      <ArrayListGrouped
        v-model="tags"
        :mode="mode"
        :add-label="'Add Tag'"
        :default-add-value="''"
        :tooltip="`Add tags related to the policy`"
      >
        <template #default="props">
          <LabeledInput
            v-model="props.row.value"
            :mode="mode"
            label="Tag"

            placeholder="Enter a tag"
          />
        </template>
        
      </ArrayListGrouped>
    </div>

    <div class="col mb-20">
      <LabeledInput
        v-model="message"
        :mode="mode"

        label="Message"
        placeholder="Enter a message"
        :tooltip="`Enter a message to be displayed when the policy is triggered`"
      />
    </div>
  </div>
</template>
