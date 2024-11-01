import { importTypes } from "@rancher/auto-import";
import { IPlugin,PanelLocation,TableColumnLocation } from "@shell/core/types";
import { routes } from "./routes";
import {
  NAMESPACE, POD, WORKLOAD_TYPES, INGRESS, SERVICE
} from '@shell/config/types';
// Init the package
export default function($plugin: IPlugin) {
  // Auto-import model, detail, edit from the folders
  importTypes($plugin);

  // Provide plugin metadata from package.json
  $plugin.metadata = require("./package.json");

  // Load a product
  $plugin.addProduct(require("./product"));

  $plugin.addRoutes(routes);

  // $plugin.addTableColumn(
  //   TableColumnLocation.RESOURCE,
  //   {
  //     resource: [
  //       'security.kubearmor.com.kubearmorpolicy'

  //     ]
  //   },
  //   {
  //     name:      'hello',
  //     labelKey:  'hello',
  //   }
  // );

  // commented by priyanshu
  
}
  