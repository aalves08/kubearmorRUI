import { AGE } from '@shell/config/table-headers';
import PolicyTableBadges from '../formatters/PolicyTableBadges.vue';
export const DAEMONSET_NAME = {
    name:      'name',
    label:     'Name',
  };
  
  export const DAEMONSET_DESIRED = {
    name:      'desired',
    label:     'Desired',
    value:     'status.desiredNumberScheduled',
  };
  
  export const DAEMONSET_READY = {
    name:      'ready',
    label:     'Ready',
    value:     'status.numberReady',
  };
  
  export const DAEMONSET_AVAILABLE = {
    name:      'available',
    label:     'Available',
    value:     'status.numberAvailable',
  };
  export const DAEMONSET_HEADERS = [
    DAEMONSET_NAME,
    DAEMONSET_DESIRED,
    DAEMONSET_READY,
    DAEMONSET_AVAILABLE,
  ];  


  export const DEPLOYMENT_NAME = {
    name:      'name',
    label:     'Name',
  };
  
  export const DEPLOYMENT_DESIRED = {
    name:      'desired',
    label:     'Desired',
  };
  
  export const DEPLOYMENT_READY = {
    name:      'ready',
    label:     'Ready',
  };
  
  export const DEPLOYMENT_AVAILABLE = {
    name:      'available',
    label:     'Available',
  };
  export const DEPLOYMENT_IMAGE = {
    name:      'image',
    label:     'image',
    value:     'spec.template.spec.containers',
    formatter: 'PodImages'
  };
  export const DEPLOYMENT_HEADERS = [
    DEPLOYMENT_NAME,
    DEPLOYMENT_DESIRED,
    DEPLOYMENT_READY,
    DEPLOYMENT_AVAILABLE,
    DEPLOYMENT_IMAGE,
  ]; 
  
  export const NODELIST_NAME = {
    name:      'name',
    label:     'Name',
  };
  
  export const NODELIST_ROLE = {
    name:      'roles',
    label:     'Roles',
  };
  
  export const NODELIST_OS = {
    name:      'os',
    label:     'OS',
    value:     'status.nodeInfo.osImage'
  };
  
  export const NODELIST_KERNEL_VERSION = {
    name:      'kernelVersion',
    label:     'Kernel Version',
    value:     'status.nodeInfo.kernelVersion'
  };
  export const NODELIST_CONTAINER_RUNTIME = {
    name:      'containerRuntime',
    label:     'Container Runtime',
    value:     'status.nodeInfo.containerRuntimeVersion'
  };
  export const NODELIST_ACTIVE_LSM = {
    name:      'activeLSM',
    label:     'Active LSM',
    value:     "metadata.labels.'kubearmor.com/enforcer'"
  };
  export const NODELIST_HEADERS = [
    NODELIST_NAME,
    NODELIST_ROLE,
    NODELIST_OS,
    NODELIST_KERNEL_VERSION,
    NODELIST_CONTAINER_RUNTIME,
    NODELIST_ACTIVE_LSM,
  ];  


  export const KUBEARMOR_CLUSTER_POLICY_NAME = {
    name: 'name',
    label: 'Name',
    value: 'metadata.name',
    sort: ['metadata.name'],
  };

  export const KUBEARMOR_CLUSTER_POLICY_ACTION = {
    name: 'action',
    label: 'Action',
    value: 'spec.action',
  };

  export const KUBEARMOR_CLUSTER_POLICY_SELECTOR = {
    name: 'selector',
    label: 'Selector',
    value: 'spec.selector',
    formatter: 'JsonView',
  };

  export const KUBEARMOR_CLUSTER_POLICY_HEADERS = [
    KUBEARMOR_CLUSTER_POLICY_NAME,
    AGE,
    KUBEARMOR_CLUSTER_POLICY_ACTION,
    KUBEARMOR_CLUSTER_POLICY_SELECTOR,
  ];

  export const POLICY_TABLE_HEADERS = [
    {
      name:     'name',
      labelKey: 'tableHeaders.name',
      value:    'display_name',
      sort:     'name',
      width:    300
    },
    {
      name:      'Url',
      label:  'Link to artifact hub',
      value:     'row',
      formatter: 'PolicyTableResources',
      width:     150
    },
    {
      name:      'publisher',
      label:  'Publisher Name',
      value:     'row',
      formatter: 'PolicyTablePublisher',
      width:     150
  
    },
    {
      name:      'description',
      label:  'Description',
      value:     'row',
      formatter: 'PolicyTableDescription',
      width:     150
  
    },
    {
      name:      '',
      label:     '',
      value:     'row',
      formatter: 'PolicyTableBadges',
      width:     40
    }
  ];
