<script setup>
import Mapa from "./Mapa";
import { panelesEnUso } from "@centrogeomx/sisdai-mapas/src/componentes/mapa/utiles";
import propsMapa from "@centrogeomx/sisdai-mapas/src/componentes/mapa/props";
import { MAPA_INYECTADO } from "@centrogeomx/sisdai-mapas/src/utiles/identificadores";
import "ol/ol.css";

const props = defineProps(propsMapa);
const mapa = reactive(new Mapa(props.id, props.proyeccion));
provide(MAPA_INYECTADO, mapa);

const refMapa = ref();

onMounted(() => {
  mapa.setTarget(refMapa.value);
  mapa.vista = props.vista;
});

defineExpose(mapa);
</script>

<template>
  <div class="sisdai-mapa contenedor-vis borde-redondeado-8">
    <div class="contenedor-vis-paneles" :class="panelesEnUso(useSlots())">
      <div class="panel-encabezado-vis">
        <slot name="panel-encabezado-vis" />
      </div>

      <div class="panel-izquierda-vis">
        <slot name="panel-izquierda-vis" />
      </div>

      <!-- slot para las capas -->
      <slot />

      <div class="contenido-vis">
        <!-- mapa -->
        <div ref="refMapa" tabindex="0" class="mapa" />
      </div>

      <div class="panel-derecha-vis">
        <slot name="panel-derecha-vis" />
      </div>

      <div class="panel-pie-vis">
        <slot name="panel-pie-vis" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sisdai-mapa.contenedor-vis {
  .contenedor-vis-paneles {
    position: relative;
  }

  .contenido-vis > .mapa {
    height: 100%;
  }
}

.a11y-simplificada .sisdai-mapa.contenedor-vis .contenedor-vis-paneles {
  min-height: fit-content;

  .contenido-vis {
    min-height: fit-content;
    > .mapa,
    .sisdai-mapa-control {
      display: none;
    }
  }
}
</style>

<style lang="scss">
.sisdai-mapa {
  .sisdai-mapa-control {
    --margen: 16px;
    --alto-boton: 40px;
    --ancho-boton: 40px;
    --espacio-entre-botones: 4px;

    position: absolute;
    z-index: 1;
    > button {
      height: var(--alto-boton);
      width: var(--ancho-boton);
      > span {
        margin: auto;
      }
    }
  }

  .sin-escala-grafica .sisdai-mapa-control-escala-grafica {
    display: none;
  }

  .sisdai-mapa-control-escala-grafica {
    .ol-scale-bar-inner {
      .ol-scale-text {
        bottom: unset;
        color: transparent;
        text-shadow: none;
        &:before {
          content: "Escala ";
        }
      }
      .ol-scale-step-marker {
        height: 10px;
        top: 0px !important;
      }
      .ol-scale-singlebar {
        height: 3px;
        top: 8px;
      }
      .ol-scale-step-text {
        bottom: 10px;
        font-size: 11px;
      }
      div > .ol-scale-step-marker {
        top: -2px !important;
      }
    }
  }
}
</style>
