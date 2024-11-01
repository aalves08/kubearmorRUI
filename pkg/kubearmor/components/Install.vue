<script>
import { mapGetters } from "vuex";
import { allHash } from "@shell/utils/promise";
import ResourceFetch from "@shell/mixins/resource-fetch";
import { SERVICE } from "@shell/config/types";

export default {
  async fetch() {
    const hash = [this.$fetchType(SERVICE)];
    await allHash(hash);
  },
  mixins: [ResourceFetch],
  data() {
    return {
      console: false,
      installCommand: `helm repo add kubearmor https://kubearmor.github.io/charts
helm repo update kubearmor
helm upgrade --install kubearmor-operator kubearmor/kubearmor-operator -n kubearmor --create-namespace
kubectl apply -f https://raw.githubusercontent.com/kubearmor/KubeArmor/main/pkg/KubeArmorOperator/config/samples/sample-config.yml`,
    };
  },
  methods: {
    copyText() {
      navigator.clipboard.writeText(this.installCommand)
        .then(() => {
          console.log("Copied to clipboard!"); 
        })
        .catch((err) => {
          console.error("Failed to copy:", err); // Optional: Error handling
        });
    },
  },

  computed: {
    ...mapGetters(["currentCluster", "currentProduct"]),
    ...mapGetters({ allRepos: "catalog/repos" }),

    certManagerInstalled() {
      return !!this.$store.getters[`${this.currentProduct.inStore}/schemaFor`](
        "cert-manager.io.certificate"
      );
    },

    
  },
};
</script>

<template>
  <div class="main">
    <h2>Kubearmor operator is not installed</h2>
    <p>
      Please complete the installation process
      <a href="https://github.com/kubearmor/KubeArmor/blob/main/getting-started/deployment_guide.md#install-kubearmor" target="_blank">
        following this guide
      </a>.
    </p>

    <div class="install-command">
      <pre>{{ installCommand }}</pre>
      <button @click="copyText">Copy to Clipboard</button>
    </div>
  </div>
</template>

<style>
pre {
  text-align: left;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: black;
  color: white;
  font-family: monospace;
}
.main {
  text-align: center;
  margin: 0 auto;
  width: 100%;
}

.install-command {
  margin: 20px auto;
  display: flex;
  flex-direction: column; /* Stack elements vertically */
  align-items: center;
  gap: 10px;  /* Add some space between pre and button */
}

.install-command button {
  padding: 5px 10px; /* Reduce button size */
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>