import { defineStore } from "pinia";

export const useShownFilesStore = defineStore("shownFiles", {
  state: () => ({
    shownFiles: {
      dataLayer: undefined,
      dataTable: undefined,
      document: undefined,
    },
  }),
  actions: {
    setShownFile(resourceType, resource) {
      this.shownFiles[resourceType] = resource;
      //console.log("cambio la seleccion", this.shownFiles[resourceType].uuid);
    },
  },
});
