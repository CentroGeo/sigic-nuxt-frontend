<script setup>
const props = defineProps({
  nombre: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  keywords: { type: String, default: '' },
  licencia: { type: String, default: '' },
  categoria: { type: String, default: '' },
  atribucion: { type: String, default: '' },
  categorias: { type: Array, default: () => [] },
  requeridos: { type: Boolean, default: false },
});

const emit = defineEmits([
  'update:nombre',
  'update:descripcion',
  'update:keywords',
  'update:licencia',
  'update:categoria',
  'update:atribucion',
]);

const LICENCIAS = [
  { value: '', label: 'Sin especificar' },
  { value: 'not_specified', label: 'No especificado(a)' },
  { value: 'varied_original', label: 'Varios / Original' },
  { value: 'varied_derived', label: 'Varios / Derivados(as)' },
  { value: 'public_domain', label: 'Dominio público' },
  { value: 'public_domain_usg', label: 'Dominio público / Gobierno de EUA' },
  { value: 'odbl', label: 'Licencia abierta de bases de datos (ODbL)' },
  { value: 'nextview', label: 'NextView' },
];
</script>

<template>
  <section class="metadatos-capa">
    <h3 class="m-b-3">Metadatos de la capa</h3>

    <div class="campo m-b-3">
      <label class="etiqueta" for="meta-nombre"
        >Nombre de la capa en el catálogo <span class="texto-error">*</span></label
      >
      <input
        id="meta-nombre"
        :value="props.nombre"
        type="text"
        class="campo-texto"
        maxlength="250"
        placeholder="Nombre descriptivo para el catálogo"
        @input="emit('update:nombre', $event.target.value)"
      />
    </div>

    <div class="campo m-b-3">
      <label class="etiqueta" for="meta-desc"
        >Resumen / Descripción <span v-if="props.requeridos" class="texto-error">*</span></label
      >
      <textarea
        id="meta-desc"
        :value="props.descripcion"
        class="campo-texto"
        rows="3"
        placeholder="Describe brevemente el contenido y origen de los datos"
        @input="emit('update:descripcion', $event.target.value)"
      />
    </div>

    <div class="meta-fila m-b-3">
      <div class="campo">
        <label class="etiqueta" for="meta-cat"
          >Categoría temática <span v-if="props.requeridos" class="texto-error">*</span></label
        >
        <select
          id="meta-cat"
          :value="props.categoria"
          class="campo-texto"
          @change="emit('update:categoria', $event.target.value)"
        >
          <option value="">Sin categoría</option>
          <option v-for="cat in props.categorias" :key="cat.identifier" :value="cat.identifier">
            {{ cat.gn_description }}
          </option>
        </select>
      </div>

      <div class="campo">
        <label class="etiqueta" for="meta-lic"
          >Licencia <span v-if="props.requeridos" class="texto-error">*</span></label
        >
        <select
          id="meta-lic"
          :value="props.licencia"
          class="campo-texto"
          @change="emit('update:licencia', $event.target.value)"
        >
          <option v-for="lic in LICENCIAS" :key="lic.value" :value="lic.value">
            {{ lic.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="meta-fila">
      <div class="campo">
        <label class="etiqueta" for="meta-attr">Fuente / Atribución</label>
        <input
          id="meta-attr"
          :value="props.atribucion"
          type="text"
          class="campo-texto"
          maxlength="500"
          placeholder="Organismo o persona que generó los datos"
          @input="emit('update:atribucion', $event.target.value)"
        />
      </div>

      <div class="campo">
        <label class="etiqueta" for="meta-kw">Palabras clave</label>
        <input
          id="meta-kw"
          :value="props.keywords"
          type="text"
          class="campo-texto"
          maxlength="500"
          placeholder="Separadas por coma: clima, México, 2024"
          @input="emit('update:keywords', $event.target.value)"
        />
        <span class="texto-chico texto-color-secundario">Separadas por coma</span>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.meta-fila {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  .campo {
    flex: 1 1 280px;
    min-width: 0;
  }
}
</style>
