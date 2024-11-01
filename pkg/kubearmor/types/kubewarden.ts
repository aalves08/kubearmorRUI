
export const KUBEARMOR_PRODUCT_NAME = 'kubearmor';
export const KUBEWARDEN_PRODUCT_GROUP = 'policies.kubewarden.io';

export const CHART_NAME = 'rancher-kubewarden';

export const KUBEWARDEN_DASHBOARD = 'dashboard';
export const KUBEWARDEN_REPO = 'https://charts.kubewarden.io';

export const KUBEWARDEN_CHARTS = {
  CONTROLLER:       'kubearmor-controller',
  DEFAULTS:         'kubearmor-defaults',
};

export const KUBEWARDEN_APPS = {
  RANCHER_CONTROLLER: 'rancher-kubearmor-controller',
  RANCHER_DEFAULTS:   'rancher-kubearmor-defaults'
};

export const KUBEWARDEN_LABELS = { POLICY_SERVER: 'kubewarden/policy-server' };

export const KUBEWARDEN = {
  ADMISSION_POLICY:         'security.kubearmor.com.kubearmorpolicy',
  CLUSTER_ADMISSION_POLICY: 'policies.kubewarden.io.clusteradmissionpolicy',
  POLICY_SERVER:            'policies.kubewarden.io.policyserver'
};

/* eslint-disable no-unused-vars */
export enum KUBEWARDEN_CRD {
  ADMISSION_POLICY = 'dmissionpolicies.policies.kubewarden.io',
  CLUSTER_ADMISSION_POLICY = 'clusteradmissionpolicies.policies.kubewarden.io',
  POLICY_SERVER = 'policyservers.policies.kubewarden.io'
}
/* eslint-enable no-unused-vars */

export interface Rule {
  apiGroups: string[];
  apiVersions: string[];
  operations: string[];
  resources: string[];
}
// Basic alternative for V1ObjectMeta (metadata usually includes name, namespace, labels, etc.)
export interface ObjectMeta {
  name?: string;
  namespace?: string;
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
}

// Basic alternative for V1MatchCondition
export interface MatchCondition {
  key: string;
  operator: string; // e.g., 'In', 'NotIn', 'Exists', 'DoesNotExist'
  values?: string[];
}

// Basic alternative for V1LabelSelector
export interface LabelSelector {
  matchLabels?: { [key: string]: string };
  matchExpressions?: Array<{
    key: string;
    operator: string; // e.g., 'In', 'NotIn', 'Exists', 'DoesNotExist'
    values?: string[];
  }>;
}
export interface Policy {
  id?: string;
  type?: string;
  links?: {
    remove?: string;
    self?: string;
    update?: string;
    view?: string;
  };
  apiVersion: string;
  kind: string;
  metadata: ObjectMeta;

  spec: {
    // KubeArmor-specific fields
    tags?: string[]; // Tags for categorizing policies
    severity?: number; // Severity level (e.g., 1 to 10 for KubeArmor policies)
    action?: 'Allow' | 'Audit' | 'Block'; // Action to take (KubeArmor-specific)
    message?: string; // Message to display for policy violations (KubeArmor)

    // Shared and Kubewarden fields
    backgroundAudit?: boolean;
    matchConditions?: MatchCondition[];
    matchPolicy?: string;
    mode?: string;
    module?: string;
    mutating?: boolean;
    namespaceSelector?: LabelSelector;
    objectSelector?: LabelSelector;
    selector?: LabelSelector; // Selector for KubeArmor policies
    policyServer?: string; // Optional, may not be required for KubeArmor
    rules?: Array<Rule>; // Optional for KubeArmor, required for Kubewarden

    // Additional KubeArmor settings, including file/process/network controls
    file?: {
      matchPaths?: Array<{
        path: string;
        readOnly?: boolean;
        ownerOnly?: boolean;
        fromSource?: Array<{ path: string }>;
      }>;
      action?: 'Allow' | 'Audit' | 'Block'; // Action to take (KubeArmor-specific)
      matchDirectories?: Array<{
        dir: string;
        recursive?: boolean;
        readOnly?: boolean;
        ownerOnly?: boolean;
        fromSource?: Array<{ path: string }>;
      }>;
      matchPatterns?: Array<{
        pattern: string;
        readOnly?: boolean;
        ownerOnly?: boolean;
      }>;
    };
    process?: {
      matchPaths?: Array<{
        path: string;
        ownerOnly?: boolean;
        fromSource?: Array<{ path: string }>;
      }>;
      matchDirectories?: Array<{
        dir: string;
        recursive?: boolean;
        ownerOnly?: boolean;
        fromSource?: Array<{ path: string }>;
      }>;
      matchPatterns?: Array<{
        pattern: string;
        ownerOnly?: boolean;
      }>;
    };
    network?: {
      matchProtocols?: Array<{
        protocol: 'TCP' | 'UDP' | 'ICMP';
        fromSource?: Array<{ path: string }>;
      }>;
    };

    // Additional Kubewarden settings
    failurePolicy?: string;
    settings?: any;
    sideEffects?: string;
    timeoutSeconds?: number;
  };

  status?: {
    conditions?: Array<{ type: string; status: string; reason?: string; message?: string }>;
    mode?: string;
    policyStatus?: string;
  };
}
