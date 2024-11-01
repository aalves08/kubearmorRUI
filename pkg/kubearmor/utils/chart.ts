import { Store } from 'vuex';

import { SHOW_PRE_RELEASE } from '@shell/store/prefs';

import { CatalogApp, Chart, Version } from '../types';
import { handleGrowl } from './handle-growl';

export interface RefreshConfig {
  store: Store<any>;
  chartName: string;
  retry?: number;
  init?: boolean;
}

export interface ReloadReady {
  reloadReady: boolean
}

/**
 * Asynchronously refreshes charts by dispatching actions to the store. It attempts to
 * find a specific chart by its name and, if not found, dispatches actions to refresh
 * the chart catalog. This method will retry the operation up to a maximum of three times
 * based on the retry parameter and the presence of the chart.
 *
 * @param {RefreshConfig} config - The configuration object for the refresh operation.
 * @param {any} config.store - The Vuex store instance used for state management.
 * @param {string} config.chartName - The name of the chart to be refreshed.
 * @param {number} [config.retry=0] - The current retry attempt count. Defaults to 0.
 * @param {boolean} [config.init=false] - A flag indicating whether the initial load
 *        should prevent retries. Defaults to false.
 *
 * @returns {Promise<ReloadReady>} An object indicating whether the reload is ready.
 *          Currently, it always returns an object with `reloadReady` set to false.
 *
 * @example
 * // Example usage:
 * refreshCharts({
 *   store: myStore,
 *   chartName: 'myChart',
 *   retry: 0,
 *   init: true
 * }).then(result => {
 *   console.log(result.reloadReady); // false
 * });
 */
export async function refreshCharts(config: RefreshConfig): Promise<ReloadReady> {
  const { store, chartName, init } = config;
  let retry = config.retry ?? 0;

  while ( retry < 3 ) {
    const rawCharts = store.getters['catalog/rawCharts'];
    const chart = (Object.values(rawCharts) as Chart[])?.find(c => c?.chartName === chartName);

    if ( !chart ) {
      try {
        store.dispatch('kubewarden/updateRefreshingCharts', true);
        await store.dispatch('catalog/refresh');
      } catch (e) {
        handleGrowl({ error: e as any, store });
      } finally {
        store.dispatch('kubewarden/updateRefreshingCharts', false);
      }

      if ( retry < 2 && !init ) {
        retry++;
        continue;
      }
    }
    break;
  }

  return { reloadReady: false };
}

/**
 * Checks if the installed app version satisfies the given constraint.
 *
 * @param store - The Vuex store instance.
 * @param installedAppVersion - The version of the installed application.
 * @param targetAppVersion - The target application version to compare against.
 * @param constraint - The semantic versioning constraint.
 * @returns boolean - True if the installed version satisfies the constraint, otherwise false.
 */

/**
 * Checks if there is an upgrade available for the installed application.
 *
 * @param store - The Vuex store instance.
 * @param app - The installed application object.
 * @param chart - The chart object containing version information.
 * @returns Version | null - The highest available upgrade version or null if no upgrade is available.
 */


/**
 * Validates if an upgrade version is a valid upgrade from the current version.
 *
 * @param currentVersion - The current version of the application.
 * @param upgradeVersion - The potential upgrade version.
 * @param highestVersion - The highest version found so far.
 * @returns string | null - The valid upgrade version or null if no valid upgrade is found.
 */

/**
 * Finds the kubewarden-defaults chart that has an appVersion matching the appVersion of the installed kubewarden-controller chart.
 *
 * @param store - The Vuex store instance.
 * @param controllerApp - The installed kubewarden-controller application object.
 * @param defaultsChart - The kubewarden-defaults chart object containing version information.
 * @returns Version | null - The matching kubewarden-defaults chart version or null if no matching version is found.
 */