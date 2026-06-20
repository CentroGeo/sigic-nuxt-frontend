<script setup>
const props = defineProps({
  sitio: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['guardar', 'actualizar']);

const modalVisual = ref(null);

const form = reactive({
  name: '',
  url: '',
  title: '',
  subtitle: '',
  info_text: '',
});

function sincronizar() {
  form.name = props.sitio.name || '';
  form.url = props.sitio.url || '';
  form.title = props.sitio.title || '';
  form.subtitle = props.sitio.subtitle || '';
  form.info_text = props.sitio.info_text || '';
}

watch(() => props.sitio, sincronizar, { deep: true, immediate: true });

const errorUrl = ref('');

function slugify(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function validarUrl() {
  const v = form.url.trim();
  if (!v) {
    errorUrl.value = '';
    return;
  }
  if (v.startsWith('/') || v.endsWith('/')) {
    errorUrl.value = "La URL no puede comenzar ni terminar con '/'.";
    return;
  }
  if (/\/\//.test(v)) {
    errorUrl.value = "La URL no puede tener '//' consecutivos.";
    return;
  }
  if (!/^[a-z0-9_\-/]+$/.test(v)) {
    errorUrl.value = 'Solo letras min\u00fasculas, n\u00fameros, guiones, guiones bajos y /';
    return;
  }
  errorUrl.value = '';
}

const nombre = computed({
  get: () => form.name,
  set(nuevoValor) {
    if (!form.url || form.url === slugify(form.name)) {
      form.url = slugify(nuevoValor);
    }
    form.name = nuevoValor;
  },
});

function abrirModalVisual() {
  modalVisual.value?.abrir();
}

function alSubmit() {
  validarUrl();
  if (errorUrl.value) return;
  emit('actualizar', { ...form });
  emit('guardar');
}
</script>

<template>
  <form class="tab-identidad" @submit.prevent="alSubmit">
    <section class="m-b-4">
      <h3>Datos del sitio</h3>

      <div class="m-b-3">
        <label for="tab-identidad-nombre">Nombre del sitio</label>
        <input
          id="tab-identidad-nombre"
          v-model="nombre"
          type="text"
          placeholder="Ej: Observatorio Regional 2026"
          required
        />
      </div>

      <div class="m-b-3">
        <label for="tab-identidad-url">URL del sitio (slug)</label>
        <input
          id="tab-identidad-url"
          v-model="form.url"
          type="text"
          placeholder="mi-tablero o categoria/mi-tablero"
          required
          @input="validarUrl"
        />
        <p v-if="errorUrl" class="formulario-ayuda color-error">{{ errorUrl }}</p>
        <p v-else class="formulario-ayuda">
          Ruta pública: <strong>/tableros/{{ form.url || '...' }}</strong> &nbsp;·&nbsp; Puede
          incluir <code>/</code> para sub-rutas: ej. <code>datos/posgrados</code>
        </p>
      </div>

      <div class="m-b-3">
        <label for="tab-identidad-titulo">Título del sitio</label>
        <input
          id="tab-identidad-titulo"
          v-model="form.title"
          type="text"
          placeholder="Título principal que aparece en el encabezado"
          required
        />
      </div>

      <div class="m-b-3">
        <label for="tab-identidad-subtitulo">Subtítulo</label>
        <input
          id="tab-identidad-subtitulo"
          v-model="form.subtitle"
          type="text"
          placeholder="Subtítulo descriptivo"
          required
        />
      </div>

      <div class="m-b-3">
        <label for="tab-identidad-info">Descripción / información del sitio</label>
        <textarea
          id="tab-identidad-info"
          v-model="form.info_text"
          rows="4"
          placeholder="Descripción que aparecerá en el pie de página"
        />
      </div>
    </section>

    <section v-if="sitio.id" class="m-b-4">
      <h3>Logos del sitio</h3>
      <TablerosAdminSubidorLogos :site-id="sitio.id" />
    </section>

    <section class="flex flex-contenido-separado m-b-4">
      <button type="button" class="boton boton-secundario" @click="abrirModalVisual">
        <span class="pictograma-editar m-r-1" />
        Identidad visual
      </button>

      <input type="submit" class="boton boton-primario" value="Guardar y continuar" />
    </section>

    <TablerosAdminModalIdentidadVisual v-if="sitio.id" ref="modalVisual" :site-id="sitio.id" />
  </form>
</template>
