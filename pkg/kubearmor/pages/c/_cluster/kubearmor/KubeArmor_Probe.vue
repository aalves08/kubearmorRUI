<style lang="scss" scoped>
.reporter-panel {
  display: none;
}
</style>

<script>
import { NODE, WORKLOAD_TYPES} from '@shell/config/types';
import SortableTable from '@shell/components/SortableTable/index'
import ResourceList from '@shell/components/ResourceList'
import { allHash } from '@shell/utils/promise';
import ResourceFetch from '@shell/mixins/resource-manager';
import { DAEMONSET_HEADERS,DEPLOYMENT_HEADERS,NODELIST_HEADERS} from '../../../../config/table-headers';



export default {
 



  async beforeMount(){
    const hash = {};
    const types = [
    
      
      WORKLOAD_TYPES.DAEMON_SET,
      WORKLOAD_TYPES.DEPLOYMENT,
      NODE
      
     
    ];

    for ( const type of types ) {
      if ( this.$store.getters['cluster/canList'](type) ) {
        hash[type] = this.$store.dispatch('cluster/findAll', { type });
      }
    }

    
    await allHash(hash);


  },
  data() {
    return { DAEMONSET_HEADERS,DEPLOYMENT_HEADERS,NODELIST_HEADERS };
  },

  computed:{
    allDaemonSets() {
      return this.$store.getters['cluster/all']({type:WORKLOAD_TYPES.DAEMON_SET});
    },
    allDeployments() {
      return this.$store.getters['cluster/all'](WORKLOAD_TYPES.DEPLOYMENT);
    },
    allNodes() {
      return this.$store.getters['cluster/all'](NODE);
    },
    kADeployments() {
      return this.allDeployments?.filter(svc => svc?.metadata?.labels?.['kubearmor-app'] );
    },
    kADaemonSets() {
      return this.allDaemonSets?.filter(svc => svc?.metadata?.labels?.['kubearmor-app'] );
    },

  },
  methods: {
    logComputedValue() {
      console.log(this.kADeployments);
    }
  },
  mounted() {
    console.log('Initial computed value:', this.kADeployments);
  },
  
  components:{SortableTable,ResourceList},
}
</script>

<template>
 <div>
  <h1>KubeArmor Probe</h1>
  <br/><br/>
  
  
  <h2>DaemonSets</h2>
  <SortableTable
    :headers="DAEMONSET_HEADERS"
    :rows="kADaemonSets"
    :rowActions="true"
    titleSlot='<div style="background: red; color: red">DaemonSets</div>'
  /> 
  <br /> <br />
  
  
  <h2>Deployments</h2>
  <SortableTable
    :headers="DEPLOYMENT_HEADERS"
    :rows="kADeployments"
    :rowActions="true"
    titleSlot='<div style="background: red; color: red">DaemonSets</div>'
  /> 
  <br /> <br />


  <h2>Nodelist</h2>
  <SortableTable
    :headers="NODELIST_HEADERS"
    :rows="allNodes"
    :rowActions="true"
    titleSlot='<div style="background: red; color: red">DaemonSets</div>'
  /> 
  <br /> <br />

  </div>
  
</template>