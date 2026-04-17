<script setup>
definePageMeta({ layout: 'tableros' });

const route = useRoute();
const { fetchSitio, fetchSitioPorUrl, fetchGrupos, fetchDatosSeleccion, fetchDatosIndicador } =
  useTableroApi();

const sitio = reactive({
  cargando: true,
  datos: null,
  error: null,
});

const grupos = ref([]);
const grupoActivo = ref(null);
const datosSeleccion = ref(null);
const subgrupoActivo = ref(null);
const indicadorActivoId = ref(null);
const indicadorActivoNombre = ref('');

const indicador = reactive({
  cargando: false,
  datos: null,
});

const estilosDinamicos = computed(() => {
  const config = sitio.datos?.configuration;
  if (!config) return {};
  return {
    '--tablero-font': config.site_font_style || 'Roboto',
    '--tablero-bg': config.site_background_color || undefined,
    '--tablero-text': config.site_text_color || undefined,
    '--tablero-header-bg': config.header_background_color || '#691c32',
    '--tablero-header-text': config.header_text_color || '#ffffff',
    '--tablero-header-font-size': config.header_font_size
      ? `${config.header_font_size}px`
      : undefined,
    '--tablero-interface-bg': config.site_interface_background_color || '#ffffff',
    '--tablero-interface-text': config.site_interface_text_color || undefined,
    '--tablero-font-size': config.site_font_size ? `${config.site_font_size}px` : undefined,
  };
});

async function cargarSitio() {
  sitio.cargando = true;
  sitio.error = null;

  try {
    const paramSitio = route.params.sitio;
    const esNumerico = /^\d+$/.test(paramSitio);

    const datos = esNumerico
      ? await fetchSitio(Number(paramSitio))
      : await fetchSitioPorUrl(paramSitio);

    if (!datos) {
      sitio.error = 'Tablero no encontrado.';
      sitio.cargando = false;
      return;
    }

    sitio.datos = datos;

    const respGrupos = await fetchGrupos(datos.id);
    grupos.value = respGrupos.results || [];

    if (grupos.value.length > 0) {
      await cambiarGrupo(grupos.value[0].id);
    }
  } catch (e) {
    sitio.error = 'Error al cargar el tablero.';
    console.error(e);
  } finally {
    sitio.cargando = false;
  }
}

async function cambiarGrupo(groupId) {
  grupoActivo.value = groupId;
  subgrupoActivo.value = null;
  indicadorActivoId.value = null;
  indicador.datos = null;

  try {
    datosSeleccion.value = await fetchDatosSeleccion(groupId);

    if (datosSeleccion.value.subgroups?.length) {
      const primerSubgrupo = datosSeleccion.value.subgroups[0];
      await cambiarSubgrupo(primerSubgrupo.subgroup_id);
    } else if (datosSeleccion.value.indicators?.length) {
      const primerIndicador = datosSeleccion.value.indicators[0];
      await cargarIndicador(primerIndicador.indicator_id, primerIndicador.indicator_name);
    }
  } catch (e) {
    console.error('Error al cargar grupo:', e);
  }
}

async function cambiarSubgrupo(subgroupId) {
  subgrupoActivo.value = subgroupId;
  indicadorActivoId.value = null;
  indicador.datos = null;

  const subgrupo = datosSeleccion.value?.subgroups?.find((s) => s.subgroup_id === subgroupId);
  if (subgrupo?.indicators?.length) {
    const primerIndicador = subgrupo.indicators[0];
    await cargarIndicador(primerIndicador.indicator_id, primerIndicador.indicator_name);
  }
}

async function cargarIndicador(indicadorId, nombre) {
  indicadorActivoId.value = indicadorId;
  indicadorActivoNombre.value = nombre;
  indicador.cargando = true;
  indicador.datos = null;

  try {
    const resp = await fetchDatosIndicador(indicadorId);
    indicador.datos = resp.data;
  } catch (e) {
    console.error('Error al cargar indicador:', e);
  } finally {
    indicador.cargando = false;
  }
}

function alSeleccionarIndicador(indicadorId) {
  const todosIndicadores = [
    ...(datosSeleccion.value?.indicators || []),
    ...(datosSeleccion.value?.subgroups?.flatMap((s) => s.indicators) || []),
  ];
  const ind = todosIndicadores.find((i) => i.indicator_id === indicadorId);
  if (ind) {
    cargarIndicador(ind.indicator_id, ind.indicator_name);
  }
}

const indicadoresDelSubgrupo = computed(() => {
  if (!subgrupoActivo.value || !datosSeleccion.value?.subgroups) return [];
  const subgrupo = datosSeleccion.value.subgroups.find(
    (s) => s.subgroup_id === subgrupoActivo.value
  );
  return subgrupo?.indicators || [];
});

watch(() => route.params.sitio, cargarSitio);
cargarSitio();
</script>

<template>
  <main id="principal" class="tablero-pagina" :style="estilosDinamicos">
    <TablerosLoader v-if="sitio.cargando" />

    <div v-else-if="sitio.error" class="tablero-pagina__error">
      <p class="h3">{{ sitio.error }}</p>
    </div>

    <template v-else-if="sitio.datos">
      <TablerosEncabezado :sitio="sitio.datos" />

      <TablerosNavGrupos :grupos="grupos" :activo="grupoActivo" @seleccionar="cambiarGrupo" />

      <TablerosNavSubgrupos
        v-if="datosSeleccion?.subgroups?.length"
        :subgrupos="datosSeleccion.subgroups"
        :activo="subgrupoActivo"
        @seleccionar="cambiarSubgrupo"
      />

      <nav v-if="indicadoresDelSubgrupo.length > 1" class="tablero-pagina__indicadores-nav">
        <select
          :value="indicadorActivoId"
          class="tablero-pagina__selector"
          @change="alSeleccionarIndicador(Number($event.target.value))"
        >
          <option
            v-for="ind in indicadoresDelSubgrupo"
            :key="ind.indicator_id"
            :value="ind.indicator_id"
          >
            {{ ind.indicator_name }}
          </option>
        </select>
      </nav>

      <TablerosIndicador
        :nombre="indicadorActivoNombre"
        :datos="indicador.datos"
        :cargando="indicador.cargando"
      />

      <TablerosPiePagina :sitio="sitio.datos" />
    </template>
  </main>
</template>

<style lang="scss" scoped>
.tablero-pagina {
  font-family: var(--tablero-font, 'Roboto'), sans-serif;
  font-size: var(--tablero-font-size, 16px);
  background: var(--tablero-bg, #f5f5f5);
  color: var(--tablero-text, #333);
  min-height: 100%;

  &__error {
    text-align: center;
    padding: 4rem 2rem;
  }

  &__indicadores-nav {
    padding: 0 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  &__selector {
    padding: 0.5rem 1rem;
    border: 1px solid var(--tablero-border-color, #e0e0e0);
    border-radius: 6px;
    background: var(--tablero-interface-bg, #ffffff);
    color: var(--tablero-interface-text, inherit);
    font-size: 0.9rem;
    min-width: 250px;
  }
}
</style>
