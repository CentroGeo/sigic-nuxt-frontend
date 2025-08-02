<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
const modalCompartir = ref(null);
function abrirModalCompartir() {
  modalCompartir.value?.abrirModal();
}

const botonesEnlaces = [
  {
    label: "X",
    pictogram: "pictograma-social-x",
    action: () => {
      console.log("Compartir en X");
    },
  },
  {
    label: "Facebook",
    pictogram: "pictograma-social-facebook",
    action: () => {
      console.log("Compartir en Facebook");
    },
  },
  {
    label: "LinkedIn",
    pictogram: "pictograma-social-linkedin",
    action: () => {
      console.log("Compartir en LinkedIn");
    },
  },
  {
    label: "Enlace",
    pictogram: "pictograma-enlace-subrayado",
    action: () => {
      console.log("Compartir enlace");
    },
  },
];
defineExpose({
  abrirModalCompartir,
});
</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalCompartir">
      <template #encabezado>
        <h1>Compartir</h1>
      </template>

      <template #cuerpo>
        <div class="flex flex-contenido-alrededor">
          <div
            v-for="(boton, index) in botonesEnlaces"
            :key="`compartir-${index}`"
            class="flex contenedor-boton"
          >
            <div class="flex flex-contenido-centrado">
              <button
                class="boton-primario boton-pictograma boton-grande"
                :aria-label="`Compartir en ${boton.label}`"
                type="button"
              >
                <span :class="boton.pictogram" aria-hidden="true" />
              </button>
            </div>
            <div class="flex flex-contenido-centrado">
              {{ boton.label }}
            </div>
          </div>
        </div>

        <div class="tarjeta m-y-3">
          <div class="tarjeta-cuerpo">
            <p>
              Solo se compartirán las capas públicas. Si tu selección contiene
              capas de usuario, estas no se visualizarán de forma pública.
            </p>
          </div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
<style lang="scss" scoped>
.contenedor-boton {
  flex-direction: column;
}
.tarjeta {
  width: 99%;
  background-color: var(--color-alerta-1);
  border: 1px solid var(--color-alerta-3);
  p {
    color: var(--color-alerta-3);
  }
}
</style>
