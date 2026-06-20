<script setup>
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  capa: { type: Object, required: true },
});

const emit = defineEmits(['update:style']);

const config = useRuntimeConfig();
const { data: session } = useAuth();

const estilos = ref([]);
const cargando = ref(false);
const estiloSeleccionado = ref(props.capa.style || '');

function headers() {
  const token = session.value?.accessToken;
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function cargarEstilos() {
  if (!props.capa.geonode_id && !props.capa.name) return;
  cargando.value = true;
  try {
    const url = props.capa.geonode_id
      ? `${config.public.geonodeApi}/datasets/${props.capa.geonode_id}/`
      : `${config.public.geonodeApi}/datasets/?filter{alternate}=${encodeURIComponent(props.capa.name)}`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error('error');
    const data = await res.json();
    const ds = data.dataset ?? data.datasets?.[0];
    if (ds?.styles && Array.isArray(ds.styles)) {
      estilos.value = ds.styles.map((e) => ({
        name: e.workspace ? `${e.workspace}:${e.name}` : e.name,
        sld_title: e.sld_title || e.name,
      }));
    } else {
      estilos.value = [];
    }
  } catch {
    estilos.value = [];
  } finally {
    cargando.value = false;
  }
}

function alCambiar(ev) {
  const name = ev.target.value;
  const sel = estilos.value.find((e) => e.name === name);
  if (!sel) return;
  emit('update:style', {
    layerId: props.capa.id,
    style: name,
    styleTitle: sel.sld_title,
  });
}

const hayEstilos = computed(() => estilos.value.length > 0);

onMounted(cargarEstilos);
</script>

<template>
  <div class="selector-estilo">
    <p v-if="cargando" class="texto-secundario m-0">Cargando estilos…</p>
    <div v-else-if="hayEstilos">
      <label class="texto-secundario">Estilo</label>
      <select v-model="estiloSeleccionado" class="selector-input" @change="alCambiar">
        <option v-for="e in estilos" :key="e.name" :value="e.name">{{ e.sld_title }}</option>
      </select>
    </div>
    <p v-else class="texto-secundario m-0">Sin estilos disponibles.</p>
  </div>
</template>

<style lang="scss" scoped>
.selector-estilo {
  margin-top: 6px;
}

.selector-input {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid var(--color-neutro-1);
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
