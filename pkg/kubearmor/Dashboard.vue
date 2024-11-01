<script>
import { WORKLOAD_TYPES } from "@shell/config/types";

import Install from "./components/Install.vue";

export default {
  name: "Dashboard",
  layout: "single",
  async beforeMount() {
     this.operatorPresence = await this.$store.dispatch(`cluster/findMatching`, {
      type: WORKLOAD_TYPES.DEPLOYMENT,
      selector: "kubearmor-app=kubearmor-operator",

    },{ root: true });
   

    this.consoleUrl = "https://kubearmor.io/";
    // type='networking.k8s.io.networkpolicies'
    const type= 'security.kubearmor.com.kubearmorpolicy'
  if ( this.$store.getters['cluster/canList'](type) ) {
        const res1 = await this.$store.dispatch('cluster/findAll', { type });
      }
  else{
    console.log("cannot list")
  }
   

  },


  components: {
    
    Install,
  },

  data() {
    return {
      consoleUrl: "",
      operatorPresence: null,
    };
  },
  computed: {
    hasKubearmor() {
      return this.operatorPresence;
    },
    async checkPolicies(){
      var type='networking.k8s.io.networkpolicies'
    console.log(type)
  if ( this.$store.getters['cluster/canList'](type) ) {
        const res1 = await this.$store.dispatch('cluster/findAll', { type });
            console.log(res1)
      }
  else{
    console.log("cannot list")
  }
    }
  },
};
</script>
<template>

  <Console v-if="hasKubearmor" :url="consoleUrl" />
  <Install v-else />
</template>
