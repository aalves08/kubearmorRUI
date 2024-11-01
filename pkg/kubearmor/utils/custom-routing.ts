import { KUBEARMOR_PRODUCT_NAME } from '../types';

interface KubewardenRouteConfig {
  name?: string;
  params?: {
    [key: string]: any;
  };
  meta?: {
    [key: string]: any;
  };
}

export const rootKubewardenRoute = (): KubewardenRouteConfig => ({
  name:   `c-cluster-${ KUBEARMOR_PRODUCT_NAME }`,
  params: { product: KUBEARMOR_PRODUCT_NAME },
  meta:   { pkg: KUBEARMOR_PRODUCT_NAME, product: KUBEARMOR_PRODUCT_NAME }
});

export const createKubewardenRoute = (config?: KubewardenRouteConfig) => {
  const { name, params = {}, meta = {} } = config || {};

  return {
    name:   name || `c-cluster-${ KUBEARMOR_PRODUCT_NAME }-resource`,
    params: { ...rootKubewardenRoute().params, ...params },
    meta:   { ...rootKubewardenRoute().meta, ...meta }
  };
};
