import { KA_NAME, KA_PRODUCT_NAME } from "./types";
import { IPlugin } from '@shell/core/types';
// import { KUBEARMOR_CLUSTER_POLICY } from './your-constants-file'; // Assuming you have KUBEARMOR_CLUSTER_POLICY defined
// import { KUBEARMOR_CLUSTER_POLICY } from "config/table-headers";
import { KUBEARMOR_CLUSTER_POLICY_HEADERS } from './config/table-headers';
const KA_Icon = require("./icon.svg");

export function init($plugin: any, store: any) {
  const { product, configureType, virtualType, basicType } = $plugin.DSL(
    store,
    KA_PRODUCT_NAME
  );

  product({
    inStore: "cluster",
    inExplorer: true,
    icon: KA_Icon,
    removeable: false,
    showNamespaceFilter: true,
  });

  virtualType({
    label: KA_NAME,
    name: KA_NAME,
    namespaced: false,
    weight: 99,
    overview: true,
    route: {
      name: `c-cluster-${KA_NAME}-dashboard`,
    },
  });

  virtualType({
    labelKey: 'KubeArmor Probe',
    name:     'KubeArmor Probe',
    icon: KA_Icon,
    route:    {
      name:   `c-cluster-${ KA_NAME }-KubeArmor_Probe`,
      params: {
        product: 'kubearmor'
      }
    }
  });

  // Configure the custom table headers for KubeArmorClusterPolicy

  // Register the resource types with basicType
  basicType([
    'KubeArmor Probe',
    'security.kubearmor.com.kubearmorpolicy',
    'security.kubearmor.com.kubearmorhostpolicy',
    'operator.kubearmor.com.kubearmorconfig',
    'security.kubearmor.com.kubearmorclusterpolicy'
  ]);

  // Add a console log to check the headers
  console.log('KubeArmor Cluster Policy Headers:', KUBEARMOR_CLUSTER_POLICY_HEADERS);

  // Configure the custom table headers for KubeArmorClusterPolicy
  configureType('security.kubearmor.com.kubearmorclusterpolicy', {
    name: 'kubearmor-cluster-policy',
    label: 'KubeArmor Cluster Policy',
    headers: KUBEARMOR_CLUSTER_POLICY_HEADERS
  });
  
}
