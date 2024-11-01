<template>
  <div>
    

    <Tab name="general" :label="('General')" :weight="99">
      <General
        v-model="chartValues"
        data-testid="kw-policy-config-general-tab"
        :mode="mode"
        :target-namespace="targetNamespace"
        :is-custom="isCustom"
      />
      <BasicConfig v-model="chartValues.policy" :mode="mode" />
    </Tab>
    <Tab name="selector" :label="'Selector'" :weight="97">
      <SelectorMatch
        v-model="chartValues.policy"
        data-testid="ka-policy-config-selector-tab"
        :mode="mode"
      />
    </Tab>   
    <Tab name="file" :label="'File Configuration'" :weight="96">
      <FileMatch
        v-model="chartValues.policy"
        data-testid="ka-policy-config-file-tab"
        :mode="mode"
      />
    </Tab> 
    <Tab name="process" :label="'Process Configuration'" :weight="96">
  <ProcessMatch
    v-model="chartValues.policy"
    data-testid="ka-policy-config-process-tab"
    :mode="mode"
  />
</Tab>
<Tab name="network" :label="'Network Configuration'" :weight="96">
    <NetworkMatch
    v-model="chartValues.policy"
        data-testid="ka-policy-config-network-tab"
    :mode="mode"/>
  </Tab>

  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';

import { _CREATE } from '@shell/config/query-params';
import Tab from '@shell/components/Tabbed/Tab';
import SelectorMatch from './SelectorMatch.vue';
import General from './General.vue';
import ProcessMatch from './ProcessMatch.vue';
import FileMatch from './FileMatch.vue';
import TagsInput from './TagsInput'
import BasicConfig from './BasicConfig.vue';
import NetworkMatch from './NetworkMatch.vue';
import {artifactHubPackageNames } from './artifacthubpackages'

export default {
  props: {
    customPolicy: {
      type:    Boolean,
      default: false
    },
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
    General,
    Tab,
    SelectorMatch,
    ProcessMatch,
    FileMatch,
    TagsInput,
    BasicConfig,
    NetworkMatch
  },

  inject: ['chartType'],

  data() {
    return {
      artifactHubPackageNames,
      activeTab: null,
      chartValues: null }
    ;
  },
  created() {
    if ( this.value ) {
      this.chartValues = this.value;
    }
    if (!this.value.message) {
      this.$set(this.value, 'message', '');
    }
  },

  computed: {
    hasFile() {
      return !isEmpty(this.chartValues?.policy?.spec?.file);
    },
    hasProcess() {
      return !isEmpty(this.chartValues?.policy?.spec?.process);
    },
    hasSelector() {
      return !isEmpty(this.chartValues?.policy?.spec?.selector);
    },
    isCreate() {
      return this.mode === _CREATE;
    },
    isCustom() {
      return this.customPolicy;
    },
    isGlobal() {
      return this.chartType === KUBEWARDEN.ADMISSION_POLICY;
    },
    targetNamespace() {
      return this.forceNamespace || this.chartValues?.metadata?.namespace || 'default';
    },
    disabledFile() {
      const packageName = this.value.metadata?.name || '';
        return this.artifactHubPackageNames.includes(packageName);
    }
  },

  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
    },
  }
};
</script>
