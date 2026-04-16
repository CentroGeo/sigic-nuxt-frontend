<script setup>
const props = defineProps({
  pestanias: {
    type: Array,
    default: () => [
      {
        id: 'pestania-1',
        titulo: 'Pestaña 1',
      },
      {
        id: 'pestania-2',
        titulo: 'Pestaña 2',
      },
      {
        id: 'pestania-3',
        titulo: 'Pestaña 3',
        deshabilitada: true,
      },
    ],
  },
  idSeleccion: {
    type: String,
    default: undefined,
  },
});
const { pestanias, idSeleccion } = toRefs(props);

const seleccion = ref(idSeleccion.value || pestanias.value[0].id);
watch(idSeleccion, (nv) => (seleccion.value = nv));

function calcularNuevoIndex(movimiento) {
  const idx_actual = pestanias.value.findIndex((p) => p.id === seleccion.value);
  let nuevo_idx = idx_actual + movimiento;

  if (nuevo_idx < 0) {
    nuevo_idx = pestanias.value.length + nuevo_idx;
  } else if (pestanias.value.length <= nuevo_idx) {
    nuevo_idx = nuevo_idx - pestanias.value.length;
  }
  return nuevo_idx;
}

function mover(movimiento = 1) {
  let i = 0,
    pestania;
  do {
    pestania = pestanias.value[calcularNuevoIndex(movimiento + i)];
    movimiento < 0 ? i-- : i++;
  } while (pestania.deshabilitada);

  seleccion.value = pestania.id;
}
</script>

<template>
  <div class="pestanias">
    <div role="tablist" @keydown.left="mover(-1)" @keydown.right="mover(1)">
      <button
        v-for="pestania in pestanias"
        :id="`sisdai-pestania-boton-${pestania.id}`"
        :key="`key-sisdai-pestania-boton-${pestania.id}`"
        type="button"
        role="tab"
        :disabled="pestania.deshabilitada"
        :aria-selected="pestania.id === seleccion"
        :aria-controls="`sisdai-pestania-panel-${pestania.id}`"
        :tabindex="pestania.id === seleccion ? 0 : -1"
        @click="() => (seleccion = pestania.id)"
      >
        {{ pestania.titulo }}
      </button>
    </div>

    <div>
      <div
        v-for="pestania in pestanias"
        :id="`sisdai-pestania-panel-${pestania.id}`"
        :key="`key-sisdai-pestania-panel-${pestania.id}`"
        role="tabpanel"
        :aria-labelledby="`sisdai-pestania-boton-${pestania.id}`"
        :hidden="pestania.id !== seleccion"
      >
        <slot :name="`contenido-${pestania.id}`">
          <p>Contenido de {{ pestania.titulo }}</p>
        </slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pestanias {
  div[role='tablist'] {
    display: flex;
    overflow-x: auto;

    /* Opcional: Para suavizar el scroll en dispositivos táctiles */
    -webkit-overflow-scrolling: touch;

    button[role='tab'] {
      display: flex;
      flex: 0 0 auto;
    }

    // button {
    //   background-color: transparent;
    //   border: 1px solid var(--color-primario);
    //   color: var(--color-primario);
    //   padding: 0.5em 1em;
    //   margin-right: 0.25em;
    //   cursor: pointer;

    //   &:hover:not([disabled]) {
    //     background-color: var(--color-primario);
    //     color: white;
    //   }
    // }
  }

  // button[aria-selected='true'] {
  //   background-color: var(--color-primario);
  //   color: white;
  // }

  // button[disabled] {
  //   opacity: 0.5;
  // }
}
</style>
