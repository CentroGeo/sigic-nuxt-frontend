import { defineStore } from 'pinia';

export const useSelectedResources2Store = defineStore('selectedResources2', {
  state: () => ({
    capas: {},
  }),
  getters: {
    listaCapas: ({ capas }) => Object.keys(capas),
    capasComoQueryParam: (state) =>
      state.listaCapas.map((capa) => `${capa},${state.capas[capa].queryParam}`).join(';'),
  },
  actions: {
    actualizarCapas(capas) {
      this.capas = capas.reduce((obj, capa) => ({ ...obj, [capa]: new ConfiguracioCapa() }), {});
    },
  },
});

class ConfiguracioCapa {
  constructor() {
    this.estilo = undefined;
    this.opacidad = 0.5;
    this.visible = 1;
  }

  get queryParam() {
    return `${this.estilo || ''},${this.opacidad},${this.visible}`;
  }
}
