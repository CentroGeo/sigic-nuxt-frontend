<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiBotonesRadioGrupo from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
const { data } = useAuth();
const usoDatos = ref('');
const modalSolicitarDescarga = ref(null);

const handleDescarga = () => {
  const formData = new FormData();
  formData.append(
    'project_id',
    storeLevantamiento.proyectosPublicos.find(
      (d) => String(d.id) === String(proyectoSeleccionadoId.value)
    ).id
  );
  formData.append(
    'nameFileToExport',
    storeLevantamiento.proyectosPublicos.find(
      (d) => String(d.id) === String(proyectoSeleccionadoId.value)
    ).nombre
  );
  formData.append('descriptionFileToExport', usoDatos.value);

  formData.append('user_id', data.value?.user.email);
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }
  storeLevantamiento.solicitarDescarga(formData);
  modalSolicitarDescarga.value.cerrarModal();
};
const proyectoSeleccionadoId = ref();
const storeLevantamiento = useLevantamientoStore();
</script>
<template>
  <div>
    <div class="columna-4"></div>
    <div class="columna-8 fondo-color-acento p-2 borde-redondeado-8">
      <span class="pictograma-archivo-descargar pictograma-grande texto-color-acento"></span>
      <h6 class="m-t-0 m-b-1 texto-color-secundario">Aun no hay descargas disponibles</h6>
      <p class="m-t-0 m-b-1">
        Todas las descargas solicitadas que sean aprobadas aparecerán en esta sección, podrás
        descargarlas las veces que necesites.
      </p>
      <div class="texto-centrado">
        <button class="boton-primario boton-chico" @click="modalSolicitarDescarga.abrirModal()">
          Solicitar una descarga
          <span class="pictograma-archivo-descargar" aria-hidden="true"></span>
        </button>
      </div>
    </div>
    <div class="columna-4"></div>
    <ClientOnly>
      <SisdaiModal ref="modalSolicitarDescarga">
        <template #encabezado><h3>Descargar datos</h3></template>
        <template #cuerpo>
          <form>
            <ClientOnly>
              <p class="m-t-0 m-b-3">
                Selecciona un proyecto para solicitar la descarga de sus datos
              </p>
              <SisdaiSelector
                v-model="proyectoSeleccionadoId"
                etiqueta="Proyectos disponibles"
                class="m-b-3"
              >
                <option
                  v-for="proyecto in storeLevantamiento.proyectosPublicos"
                  :key="proyecto.id"
                  :value="proyecto.id"
                >
                  {{ proyecto.nombre }}
                </option>
              </SisdaiSelector>
              <SisdaiAreaTexto
                v-model="usoDatos"
                etiqueta="Describe el uso que le darás a los datos"
                ejemplo="Describe el uso que le darás a los datos..."
                :es_etiqueta_visible="true"
                :es_obligatorio="true"
                class="m-b-3"
              />
              <p class="m-t-0 m-b-3">
                Selecciona el formato en el cual deseas descargar los datos:
              </p>
              <SisdaiBotonesRadioGrupo leyenda="" :es_vertical="true">
                <SisdaiBotonRadio
                  etiqueta="Tabulado de datos .csv"
                  value="csv"
                  name="modo-descarga"
                />
                <SisdaiBotonRadio
                  etiqueta="Geopaquete .gpkg"
                  value="geopaquete"
                  name="modo-descarga"
                />
              </SisdaiBotonesRadioGrupo>
            </ClientOnly>
          </form>
        </template>
        <template #pie>
          <button
            type="button"
            class="boton-secundario boton-chico"
            @click="modalSolicitarDescarga?.cerrarModal()"
          >
            Cerrar
          </button>
          <button
            type="button"
            class="boton-primario boton-chico"
            :disabled="!proyectoSeleccionadoId"
            @click="handleDescarga"
          >
            Solicitar descarga
          </button>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </div>
</template>
