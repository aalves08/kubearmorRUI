import { rootKubewardenRoute } from '../utils/custom-routing';
import {
  KUBEWARDEN, KUBEWARDEN_DASHBOARD, POLICY_REPORTER_PRODUCT, KUBEARMOR_PRODUCT_NAME, WG_POLICY_K8S
} from '../types';

export function init($plugin: any, store: any) {
  const {
    product,
    basicType,
    weightType,
    virtualType,
    headers
  } = $plugin.DSL(store, $plugin.name);

  const {
    POLICY_SERVER,
    ADMISSION_POLICY,
    CLUSTER_ADMISSION_POLICY
  } = KUBEWARDEN;

  product({
    inStore:             'cluster',
    inExplorer:          true,
    icon:                'kubewarden',
    removeable:          false,
    showNamespaceFilter: true
  });

  virtualType({
    label:       store.getters['i18n/t']('kubewarden.dashboard.title'),
    icon:        'kubewarden',
    name:        KUBEWARDEN_DASHBOARD,
    namespaced:  false,
    weight:      99,
    route:       rootKubewardenRoute(),
    overview:    true
  });

  virtualType({
    label:      store.getters['i18n/t']('kubewarden.policyReporter.title'),
    icon:       'notifier',
    ifHaveType: WG_POLICY_K8S.POLICY_REPORT.TYPE,
    name:       POLICY_REPORTER_PRODUCT,
    namespaced: false,
    weight:     95,
    route:      {
      name:   `c-cluster-${ KUBEARMOR_PRODUCT_NAME }-${ POLICY_REPORTER_PRODUCT }`,
      params: { product: KUBEARMOR_PRODUCT_NAME }
    }
  });

  basicType([
    KUBEWARDEN_DASHBOARD,
    POLICY_REPORTER_PRODUCT,
    POLICY_SERVER,
    ADMISSION_POLICY,
    CLUSTER_ADMISSION_POLICY
  ]);

  weightType(POLICY_SERVER, 98, true);
  weightType(CLUSTER_ADMISSION_POLICY, 97, true);
  weightType(ADMISSION_POLICY, 96, true);
}
