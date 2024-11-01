import { RouteConfig } from "vue-router";
import Dashboard from "./Dashboard.vue";
import Helloworld from "./pages/c/_cluster/kubearmor/KubeArmor_Probe.vue"
import { KA_NAME } from "./types";

export const routes: RouteConfig[] = [
  {
    name: `c-cluster-${KA_NAME}-dashboard`,
    path: `/c/:cluster/:product/dashboard`,
    component: Dashboard,
  },
  {
    name: `c-cluster-${KA_NAME}-KubeArmor_Probe`,
    path: `/c/:cluster/:product/KubeArmor_Probe`,
    component: Helloworld,
    meta:      {
      product: 'kubearmor'
    },
  }
];
