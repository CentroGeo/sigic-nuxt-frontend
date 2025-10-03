<script>
import { lados } from '@centrogeomx/sisdai-mapas/src/utiles/capa';
import { arrayNewsOlds } from '~/utils/consulta';

function ladoContrario(lado) {
  return lado === lados.derecho ? lados.izquierdo : lados.derecho;
}
</script>

<script setup>
const props = defineProps({
  lado: {
    type: String,
    default: lados.derecho,
  },
});

const storeResources = useResourcesConsultaStore();
const storeSelected = useSelectedResources2Store();

const estaAbierto = ref(true);
const pksSeleccionados = computed({
  get() {
    return storeSelected
      .list()
      .filter(({ lado }) => lado === undefined || lado === props.lado)
      .map(({ pk }) => pk);
  },
  set(nuevaSeleccion) {
    const { news, olds } = arrayNewsOlds(this.value, nuevaSeleccion);

    news.forEach((pk) => (storeSelected.byPk(pk).lado = undefined));
    olds.forEach((pk) => (storeSelected.byPk(pk).lado = ladoContrario(props.lado)));
  },
});
</script>

<template>
  <div class="colapsable" :class="{ abierto: estaAbierto }">
    <button
      class="colapsable-boton"
      :aria-controls="`colapsable-division-${lado}`"
      :aria-expanded="estaAbierto"
      type="button"
      @click="estaAbierto = !estaAbierto"
    >
      Panel {{ lado }}
      <span :aria-hidden="true" class="pictograma-angulo-derecho" />
    </button>

    <div
      :id="`colapsable-division-${lado}`"
      class="colapsable-contenedor"
      :aria-hidden="!estaAbierto"
    >
      <ol>
        <li
          v-for="resource in storeResources.findResources(storeSelected.pks)"
          :key="`${resource}`"
        >
          <input
            :id="`control-${lado}-${resource.pk}`"
            v-model="pksSeleccionados"
            :value="resource.pk"
            type="checkbox"
          />
          <label :for="`control-${lado}-${resource.pk}`">
            {{ resource.title }}
          </label>
        </li>
      </ol>
    </div>
  </div>
</template>
