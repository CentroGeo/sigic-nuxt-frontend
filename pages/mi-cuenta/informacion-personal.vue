<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';

definePageMeta({
  middleware: 'auth',
});

const status = ref('read');
const userInfo = ref({
  Nombre: 'Daniela',
  Apellidos: 'Fernández Acuña',
  'Dirección de correo electrónico': 'danielaferac@conabio.gob.mx',
  'Nombre de la organización': 'Comisión Nacional para el conocimiento y la Biodiversidad',
  'Laboratorio, Área o Departamento': 'Secretaria General',
  Posición: 'Subcoordinadora Técnica',
  Ciudad: 'Ciudad de México',
  'Entidad o provincia': 'Ciudad de México',
  'Código Postal': '04000',
  País: 'México',
});

function toggleStatus() {
  if (status.value === 'read') {
    status.value = 'edit';
  } else {
    status.value = 'read';
  }
}
</script>
<template>
  <div>
    <h2>Información personal</h2>
    <div class="flex columna-4">
      <div class="columna-4" style="text-align: center">
        <img src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/nilo.jpg" />
        <a class="m-t-1">Cambiar foto</a>
      </div>

      <div v-if="status === 'read'" class="columna-12">
        <div v-for="(campo, index) in Object.keys(userInfo)" :key="index" class="m-b-2">
          <label class="m-0">{{ campo }}</label>
          <p class="m-0">{{ userInfo[campo] }}</p>
        </div>
        <div class="flex m-y-6">
          <button
            class="boton-secundario boton-chico"
            aria-label="Editar Información"
            @click="toggleStatus"
          >
            Editar Información <span class="pictograma-editar"></span>
          </button>
        </div>
      </div>
      <div v-if="status === 'edit'" class="columna-12">
        <ClientOnly>
          <SisdaiCampoBase
            v-for="(campo, index) in Object.keys(userInfo)"
            :key="index"
            v-model="userInfo[campo]"
            :etiqueta="campo"
            :ejemplo="userInfo[campo]"
            tipo="text"
            class="m-b-2"
          />
        </ClientOnly>
        <div class="flex m-y-6">
          <button class="boton-secundario boton-chico" aria-label="Cancelar" @click="toggleStatus">
            Cancelar
          </button>
          <button class="boton-primario boton-chico" aria-label="Guardar Cambios">
            Guardar Cambios <span class="pictograma-guardar"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
img {
  border-radius: 50%;
  object-fit: contain;
}
</style>
