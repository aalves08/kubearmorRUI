<template>
  <div class="col mb-20">
    <!-- Severity and Action -->
    <div class="col mb-40">
      <div class="row mb-20">
        <div class="col span-6">
          <LabeledInput v-model="file.severity" :mode="mode" label="Severity"
            placeholder="Enter severity level (e.g., 1)" type="number" min="1"
            v-clean-tooltip="`Specify the severity level of the policy (e.g., 1, 2, 3...).`" />
        </div>
        <div class="col span-6">
          <LabeledSelect v-model="file.action" :mode="mode" :options="actionOptions" label="Action"
            placeholder="Select Action"
            v-clean-tooltip="`Specify the action to be taken when this policy is triggered (Allow, Audit, or Block).`" />
        </div>
      </div>
    </div>

    <!-- Match Paths Section -->
    <div class="col mb-40">
      <h2>
        Match Paths
        <i v-clean-tooltip="`Match file paths for security policies.`" class="icon icon-info" />
      </h2>
      <ArrayListGrouped v-model="file.matchPaths" :mode="mode" :add-label="'Add Match Path'"
        :default-add-value="{ path: '', readOnly: false, ownerOnly: false, fromSource: [] }">
        <template #default="props">
          <div class="col mb-20">
            <LabeledInput v-model="props.row.value.path" :mode="mode" :required="true" label="Absolute file path"
              placeholder="Enter the absolute file path" />
            <RadioGroup name="owner-file-matchpath" v-model="props.row.value.ownerOnly" :mode="mode"
              :options="booleanOptions" label="Owner Only" />

            <RadioGroup name="readonly-file-matchpath" v-model="props.row.value.readOnly" :mode="mode"
              :options="booleanOptions" label="Read Only" />
            <ArrayListGrouped v-model="props.row.value.fromSource" :mode="mode" :add-label="'Add Source Path'"
              :default-add-value="{ path: '' }">
              <template #default="sourceProps">
                <LabeledInput v-model="sourceProps.row.value.path" :mode="mode" label="Source Path"
                  placeholder="Enter source path" />
              </template>
            </ArrayListGrouped>
          </div>
        </template>
      </ArrayListGrouped>

    </div>

    <!-- Match Directories Section -->
    <div class="col mb-40">
      <h2>
        Match Directories
        <i v-clean-tooltip="`Match directories for security policies.`" class="icon icon-info" />
      </h2>
      <ArrayListGrouped v-model="file.matchDirectories" :mode="mode" :add-label="'Add Match Directory'"
        :default-add-value="{ dir: '', recursive: false, readOnly: false, ownerOnly: false, fromSource: [] }">
        <template #default="props">
          <div class="col mb-20">
            <LabeledInput v-model="props.row.value.dir" :mode="mode" :required="true" label="Absolute directory path"
              placeholder="Enter the absolute directory path" />
            <RadioGroup name="recursive-file-matchdir" v-model="props.row.value.recursive" :mode="mode"
              :options="booleanOptions" label="Recursive" />
            <RadioGroup name="owner-file-matchdir" v-model="props.row.value.ownerOnly" :mode="mode"
              :options="booleanOptions" label="Owner Only" />
            <RadioGroup name="read-file-matchdir" v-model="props.row.value.readOnly" :mode="mode"
              :options="booleanOptions" label="Read Only" />
            <ArrayListGrouped v-model="props.row.value.fromSource" :mode="mode" :add-label="'Add Source Path'"
              :default-add-value="{ path: '' }">
              <template #default="sourceProps">
                <LabeledInput v-model="sourceProps.row.value.path" :mode="mode" label="Source Path"
                  placeholder="Enter source path" />
              </template>
            </ArrayListGrouped>
          </div>
        </template>
      </ArrayListGrouped>
    </div>

    <!-- Match Patterns Section -->
    <div class="col mb-40">
      <h2>
        Match Patterns
        <i v-clean-tooltip="`Match file patterns using regex.`" class="icon icon-info" />
      </h2>
      <ArrayListGrouped v-model="file.matchPatterns" :mode="mode" :add-label="'Add Match Pattern'"
        :default-add-value="{ pattern: '', readOnly: false, ownerOnly: false }">
        <template #default="props">
          <div class="col mb-20">
            <LabeledInput v-model="props.row.value.pattern" :mode="mode" :required="true" label="Regex Pattern"
              placeholder="Enter the regex pattern" />
            <RadioGroup name="owner-file-matchpattern" v-model="props.row.value.ownerOnly" :mode="mode"
              :options="booleanOptions" label="Owner Only" />
            <RadioGroup name="read-file-matchpattern" v-model="props.row.value.readOnly" :mode="mode"
              :options="booleanOptions" label="Read Only" />
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
import { RadioGroup } from '@components/Form/Radio';

export default {
  props: {
    mode: {
      type: String,
      default: _CREATE
    },
    value: {
      type: Object,
      required: true
    }
  },

  components: {
    ArrayListGrouped,
    LabeledInput,
    LabeledSelect,
    RadioGroup
  },

  data() {
    // Initialize the `file` object with default structure if not already present
    if (!this.value.spec) {
      this.$set(this.value, 'spec', {});
    }
    if (!this.value.spec.file) {
      this.$set(this.value.spec, 'file', {
        severity: 1,
        action: 'Block',
        matchPaths: [],
        matchDirectories: [],
        matchPatterns: []
      });
    }

    return {
      file: this.value.spec.file,
      booleanOptions: [
        { label: 'True', value: true },
        { label: 'False', value: false }
      ],
      actionOptions: [
        { label: 'Allow', value: 'Allow' },
        { label: 'Audit', value: 'Audit' },
        { label: 'Block', value: 'Block' }
      ]
    };
  },

  watch: {
    file: {
      deep: true,
      handler(newVal) {
        this.$set(this.value.spec, 'file', newVal);
        this.$emit('input', this.value);
      }
    }
  }
};
</script>