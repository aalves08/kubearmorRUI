<template>
  <div class="col mb-20">
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-model="process.action"
          :mode="mode"
            

          label="Action"
          :options="actionOptions"
          placeholder="Select action (default: Block)"
        />
      </div>
      <div class="col span-6">
        <LabeledInput
          v-model="process.severity"
          :mode="mode"
          label="Severity"
          type="number"
          min="1"
          placeholder="Enter severity level (e.g., 1)"
        />
      </div>
    </div>

    <!-- Match Paths Section -->
    <div class="col mb-40">
      <h2>
        Match Paths
        <i v-clean-tooltip="`Specify paths to match executables.`" class="icon icon-info" />
      </h2>
      <ArrayListGrouped 
        v-model="process.matchPaths" 
        :mode="mode" 
        :add-label="'Add Match Path'"
        :required="true"
        :default-add-value="{ path: '', fromSource: [] }"
      >
        <template #default="props">
          <div class="col mb-20">
            <LabeledInput 
              v-model="props.row.value.path" 
              :mode="mode" 
              :required="true"
              label="Absolute Path"
              placeholder="Enter the executable path"
            />
            <RadioGroup 
            name="owner-process-matchpath"

            v-model="props.row.value.ownerOnly" 
              :mode="mode" 
              :options="booleanOptions" 
              label="Owner Only"
            />
            <ArrayListGrouped
              v-model="props.row.value.fromSource"
              :mode="mode"
              :add-label="'Add Source Path'"
              :default-add-value="{ path: '' }"
            >
              <template #default="sourceProps">
                <LabeledInput 
                  v-model="sourceProps.row.value.path" 
                  :mode="mode" 
                  label="Source Path"
                  placeholder="Enter source path"
                />
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
        <i v-clean-tooltip="`Specify directories to match.`" class="icon icon-info" />
      </h2>
      <ArrayListGrouped 
        v-model="process.matchDirectories" 
        :mode="mode" 
          

        :add-label="'Add Match Directory'"
        :default-add-value="{ dir: '', recursive: false, ownerOnly: false, fromSource: [] }"
      >
        <template #default="props">
          <div class="col mb-20">
            <LabeledInput 
              v-model="props.row.value.dir" 
              :mode="mode" 
              :required="true"
              label="Directory Path"
              placeholder="Enter the directory path"
            />
            <RadioGroup 
              name="recursive-process-matchdir"
              v-model="props.row.value.recursive" 
              :mode="mode" 
              :options="booleanOptions" 
              label="Recursive"
            />
            <RadioGroup 
            name="owner-process-matchdir"
              v-model="props.row.value.ownerOnly" 
              :mode="mode" 
              :options="booleanOptions" 
              label="Owner Only"
            />
            <ArrayListGrouped
              v-model="props.row.value.fromSource"
              :mode="mode"
              :add-label="'Add Source Path'"
              :default-add-value="{ path: '' }"
            >
              <template #default="sourceProps">
                <LabeledInput 
                  v-model="sourceProps.row.value.path" 
                  :mode="mode"  
                  label="Source Path"
                  placeholder="Enter source path"
                />
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
        <i v-clean-tooltip="`Define regex patterns to match processes.`" class="icon icon-info" />
      </h2>
      <ArrayListGrouped 
        v-model="process.matchPatterns" 
        :mode="mode" 
        :add-label="'Add Match Pattern'"
        :default-add-value="{ pattern: '', ownerOnly: false }"
      >
        <template #default="props">
          <div class="col mb-20">
            <LabeledInput  
              v-model="props.row.value.pattern" 
              :mode="mode"   
              :required="true"
              label="Pattern"
              placeholder="Enter regex pattern"
            />
            <RadioGroup 
            name="owner-process-matchpattern"
              v-model="props.row.value.ownerOnly" 
              :mode="mode" 
              :options="booleanOptions" 
              label="Owner Only"
            />
          </div>
        </template>
      </ArrayListGrouped>
    </div>
  </div>
</template>

<script>
import ArrayListGrouped from '@shell/components/form/ArrayListGrouped';
import { LabeledInput } from '@components/Form/LabeledInput';
import { RadioGroup } from '@components/Form/Radio';
import LabeledSelect from '@shell/components/form/LabeledSelect';
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
    ArrayListGrouped,
    LabeledInput,
    RadioGroup,
    LabeledSelect
  },

  data() {
    if (!this.value.spec) {
      this.$set(this.value, 'spec', {});
    }
    if (!this.value.spec.process) {
      this.$set(this.value.spec, 'process', {
        action: 'Block',
        severity: 1,
        matchPaths: [],
        matchDirectories: [],
        matchPatterns: []
      });
    }

    return {
      process: this.value.spec.process,
      actionOptions: [
        { label: 'Allow', value: 'Allow' },
        { label: 'Audit', value: 'Audit' },
        { label: 'Block', value: 'Block' }
      ],
      booleanOptions: [
        { label: 'True', value: true },
        { label: 'False', value: false }
      ]
    };
  },
  watch: {
    process: {
      deep: true,
      handler(newVal) {
        this.$set(this.value.spec, 'process', newVal);
        this.$emit('input', this.value);
      }
    }
  }
};
</script>
