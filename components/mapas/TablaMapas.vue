<script setup>
/**
 * Tabla de listado de mapas para la exploración pública del catálogo.
 * Replica el markup accesible de UiTablaAccesibleV2 pero con columnas y acciones
 * propias de mapas (que provienen de la API sigic-maps, no de recursos GeoNode).
 *
 * @typedef {Object} Props
 * @property {Array} [mapas=[]] - Lista de mapas a desplegar.
 */
/** @type {Props} */
const props = defineProps({
  mapas: { type: Array, default: () => [] },
});

const idAleatorio = 'id-' + Math.random().toString(36).substring(2);
const columnas = ['pk', 'titulo', 'tipo_recurso', 'categoria', 'es_publica', 'acciones'];
const encabezados = {
  pk: 'PK',
  titulo: 'Título',
  tipo_recurso: 'Tipo de recurso',
  categoria: 'Categoría',
  es_publica: 'Es pública',
  acciones: 'Acciones',
};

/**
 * Pre-visualizar: lleva a la sección de consulta de mapas.
 */
function previsualizar() {
  navigateTo('/consulta/mapas');
}
</script>

<template>
  <div class="contenedor-tabla p-2">
    <table class="tabla-expandida">
      <thead>
        <tr>
          <th v-for="(columna, c) in columnas" :id="`${idAleatorio}-col-${c}`" :key="c" scope="col">
            {{ encabezados[columna] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(mapa, m) in props.mapas" :id="`${idAleatorio}-ren-${m}`" :key="mapa.id">
          <!-- PK -->
          <td :headers="`${idAleatorio}-ren-${m} ${idAleatorio}-col-0`">{{ mapa.id }}</td>

          <!-- Título -->
          <td :headers="`${idAleatorio}-ren-${m} ${idAleatorio}-col-1`">{{ mapa.name }}</td>

          <!-- Tipo de recurso -->
          <td :headers="`${idAleatorio}-ren-${m} ${idAleatorio}-col-2`">
            <div
              class="texto-centrado fondo-color-acento p-1 texto-color-acento borde borde-redondeado-12"
              style="width: max-content"
            >
              <span>
                <span class="pictograma-mapa-generador" aria-hidden="true" />
                Mapa
              </span>
            </div>
          </td>

          <!-- Categoría -->
          <td :headers="`${idAleatorio}-ren-${m} ${idAleatorio}-col-3`">
            {{ mapa.category?.gn_description || mapa.category || 'Sin clasificar' }}
          </td>

          <!-- Es pública -->
          <td :headers="`${idAleatorio}-ren-${m} ${idAleatorio}-col-4`">
            <div
              v-if="mapa.is_public !== false"
              class="texto-color-confirmacion texto-centrado fondo-color-confirmacion borde borde-color-confirmacion borde-redondeado-8 p-1"
              style="width: max-content"
            >
              Sí
            </div>
            <div
              v-else
              class="texto-color-alerta texto-centrado fondo-color-alerta borde borde-color-alerta borde-redondeado-8 p-1"
              style="width: max-content"
            >
              No
            </div>
          </td>

          <!-- Acciones -->
          <td :headers="`${idAleatorio}-ren-${m} ${idAleatorio}-col-5`">
            <div class="flex-width">
              <button
                v-globo-informacion:izquierda="'Pre-visualizar'"
                class="boton-pictograma boton-secundario"
                aria-label="Pre-visualizar mapa"
                type="button"
                @click="previsualizar"
              >
                <span class="pictograma-previsualizar" aria-hidden="true" />
              </button>
              <button
                v-globo-informacion:izquierda="'Descargar (próximamente)'"
                class="boton-pictograma boton-secundario"
                aria-label="Descargar mapa"
                type="button"
                disabled
              >
                <span class="pictograma-archivo-descargar" aria-hidden="true" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.contenedor-tabla {
  width: 100%;
  overflow: auto;
  display: inline-grid;
}
table {
  min-width: 600px;
  .flex-width {
    display: flex;
    gap: 16px;
    width: fit-content;
  }
}
</style>
