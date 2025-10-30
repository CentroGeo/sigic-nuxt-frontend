<script setup>
/**
 * Props:
 * - opciones: lista de opciones de menú [{ texto, key }]
 * - subruta: el valor actual de la subruta seleccionada
 */
/* const props = defineProps({
  opciones: { type: Array, default: () => [] },
  subruta: String,
}); */

const emit = defineEmits(['update:subruta']);

// Función para cambiar la subruta activa
function irASubruta(key) {
  emit('update:subruta', key);
}
</script>

<template>
  <div class="menu-mis-archivos p-b-3">
    <div class="flex">
      <template v-for="value in opciones" :key="value.key">
        <div>
          <button class="boton-secundario header-link" type="button" @click="irASubruta(value.key)">
            {{ value.texto }}
          </button>

          <div :class="subruta === value.key ? 'borde-enlace-activo' : ''"></div>
        </div>
      </template>
    </div>
    <div class="borde-b borde-color-secundario"></div>
  </div>
</template>

<style scoped lang="scss">
.menu-mis-archivos {
  .flex {
    gap: 0px;
  }
  .borde-enlace-activo {
    position: relative;
    width: 32px;
    height: 4px;
    padding-bottom: 4px;
    border-radius: 2px 2px 0px 0px;
    background-color: var(--boton-primario-borde);
    text-align: center;
    margin: -4px auto 0;
  }
}
.header-link {
  box-shadow: inherit;
  padding: inherit;
  padding: 16px 24px 16px 16px;
  position: relative;
  color: var(--texto-secundario);
  font-weight: 600;
  &:hover,
  &:focus {
    background-color: var(--boton-secundario-cursor-fondo);
  }
}
</style>
