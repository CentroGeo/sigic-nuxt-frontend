<script setup>
/**
 * @typedef {Object} Props
 * @property {Object} [recurso={}] - Indica el recurso que utiliza para comunicar a las rutas.
 * @property {Array} [opciones=[]] - Indica la o las opciones de navegación del menú.
 * @property {Boolean} [notificacion=false] - Indica si la notificación está activa o no.
 */
/** @type {Props} */
const props = defineProps({
  recurso: {
    type: Object,
    default: () => ({}),
  },
  opciones: { type: Array, default: Array },
  notificacion: { type: Boolean, default: false },
});
const route = useRoute();

/**
 * Método para comparar si el recurso es documento, capa o tabla sin geometría
 * @param value del objeto opciones que tiene el texto
 * @returns verdadero o falso según cumpla las condiciones
 */
const conEstiloOSinGeometria = (value) => {
  // valida si hay algo en el recurso o está vacío
  if (Object.keys(props.recurso).length > 0) {
    if (props.recurso.resource_type === 'document') {
      // si es documento solo se puede editar los metadatos
      return value.texto === 'Metadatos';
    } else {
      // es dataset
      if (isGeometricExtension(props.recurso.extent)) {
        // si tiene geometría se puede editar el estilo y los metadatos de la capa
        return value.texto === 'Metadatos' || value.texto === 'Estilo';
      } else {
        // si no se puede unir mediante su clave geoestadística y editar metadatos de la tabla
        return value.texto === 'Metadatos' || value.texto === 'Clave Geoestadística';
      }
    }
  } else {
    return true;
  }
};
function irARutaConQuery(value) {
  if (
    value.texto === 'Metadatos' ||
    value.texto === 'Estilo' ||
    value.texto === 'Clave Geoestadística'
  ) {
    const tipoRecurso =
      props.recurso.resource_type === 'document'
        ? 'document'
        : isGeometricExtension(props.recurso.extent)
          ? 'dataLayer'
          : 'dataTable';

    navigateTo({
      path: value.ruta,
      query: { data: props.recurso.pk, type: tipoRecurso },
    });
  } else {
    navigateTo({
      path: value.ruta,
    });
  }
}
console.log(props.opciones);
</script>
<template>
  <div class="menu-mis-archivos p-t-5 p-b-3">
    <div class="flex">
      <template v-for="value in props.opciones">
        <div v-if="conEstiloOSinGeometria(value)" :key="value.texto">
          <div v-if="value.notificacion" class="notificacion">
            <div class="circulo"></div>
          </div>
          <nuxt-link class="header-link" @click="irARutaConQuery(value)"
            >{{ value.texto }}
          </nuxt-link>
          <div :class="route.path === value.ruta ? 'borde-enlace-activo' : ''"></div>
        </div>
      </template>
    </div>
    <div class="borde-b borde-color-secundario"></div>
  </div>
</template>

<style lang="scss" scoped>
.menu-mis-archivos {
  .flex {
    gap: 32px;
    .notificacion {
      position: relative;
      .circulo {
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: var(--color-informativo-2);
        border-radius: 50%;
        right: -16px;
      }
    }
    .borde-enlace-activo {
      position: relative;
      width: 32px;
      height: 4px;
      padding-bottom: 4px;
      border-radius: 2px 2px 0px 0px;
      background-color: var(--boton-primario-borde);
      text-align: center;
      margin: 8px auto 0;
    }
  }
}
.header-link {
  color: var(--color-secundario-8);
  font-weight: 600;
}
</style>
