import {
  globo_informacion,
  globo_informacion_extendido,
} from "@centrogeomx/sisdai-componentes/src/directivas/tooltips/GloboInformacion";

export default defineNuxtPlugin((nuxtApp) => {
  // nuxtApp.vueApp.use(GlobosDeInformacion)
  nuxtApp.vueApp.directive(globo_informacion.name, globo_informacion);
  nuxtApp.vueApp.directive(
    globo_informacion_extendido.name,
    globo_informacion_extendido
  );
});
