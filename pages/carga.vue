<script setup lang="ts">
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const modalCatalogoExternos = ref(null);
const campoTitulo = ref('');
const seleccionTipoFuente = ref('');
const campoURL = ref('');
const campoCapaODataset = ref('');
const seleccionFormatoRespuesta = ref('');
const areaTextoDescripcion = ref('');
const casillaUnicaAutenticacion = ref(false);
const seleccionTipoAutenticacion = ref('');
const campoContrasenia = ref('');
const campoUsuario = ref('');
const campoToken = ref('');

function conectarCatalogoExterno() {}

const archivo = ref<File | null>(null);
const titulo = ref('');
const descripcion = ref('');
const { data, status } = useAuth();
watchEffect(() => {
  if (status.value === 'authenticated') {
    // pass
  }
});
async function subirArchivo() {
  if (descripcion.value !== '') {
    const token = data.value?.accessToken;
    const formData = new FormData();
    formData.append('title', titulo.value);
    formData.append('abstract', descripcion.value);
    formData.append('base_file', archivo.value!);
    formData.append('token', token);

    await fetch('/api/subir', {
      method: 'POST',
      body: formData,
    });

    // // const json = await res.json();
  }
}
</script>
<template>
  <main>
    <h2>Esto es la vista de carga</h2>
    <section id="">
      <div class="contenedor">
        <h3>Sección</h3>
        <input type="file" @change="(e) => (archivo = e.target.files[0])" />
        <input v-model="titulo" placeholder="Título" />
        <!-- <input v-model="descripcion" placeholder="Descripción" /> -->
        <ClientOnly>
          <SisdaiCampoBase
            v-model="descripcion"
            etiqueta="Descripción"
            ejemplo="Descripción"
            tipo="text"
            texto_ayuda="Texto de ayuda."
            :es_obligatorio="true"
            :es_etiqueta_visible="true"
          />
        </ClientOnly>
        <button @click="subirArchivo">Subir</button>

        <div class="m-t-3">
          <ClientOnly>
            <SisdaiModal ref="modalCatalogoExternos" tamanio-modal="modal-grande">
              <template #encabezado>
                <h2>Conexión a catálogos externos</h2>
              </template>

              <template #cuerpo>
                <!-- se añida formulario Form -->
                <h3>Datos generales del servicio</h3>
                <form @keypress.enter.exact.prevent="conectarCatalogoExterno()">
                  <ClientOnly>
                    <SisdaiCampoBase
                      v-model="campoTitulo"
                      etiqueta="Título"
                      ejemplo="Añade un nombre"
                    />
                    <SisdaiSelector v-model="seleccionTipoFuente" etiqueta="Tipo de fuente">
                      <option value="1">WMS</option>
                      <option value="2">WFS</option>
                      <option value="3">GeoJSON</option>
                      <option value="4">CSV</option>
                      <option value="5">REST JSON</option>
                      <option value="6">Excel</option>
                    </SisdaiSelector>
                    <SisdaiCampoBase
                      v-model="campoURL"
                      etiqueta="Campo de URL"
                      ejemplo="http://"
                      tipo="url"
                    />
                    <SisdaiCampoBase
                      v-model="campoCapaODataset"
                      etiqueta="Nombre de la capa o dataset a consultar (opcional)"
                      ejemplo="Capa o dataset a consultar"
                      tipo="url"
                    />
                    <SisdaiSelector
                      v-model="seleccionFormatoRespuesta"
                      etiqueta="Formato esperado de la respuesta (opcional)"
                    >
                      <option value="1">JSON</option>
                      <option value="2">CSV</option>
                      <option value="3">XML</option>
                      <option value="4">GeoJSON</option>
                    </SisdaiSelector>
                    <SisdaiAreaTexto
                      v-model="areaTextoDescripcion"
                      etiqueta="Descripción"
                      texto_ayuda="Describe brevemente cómo llenar el campo."
                      :es_etiqueta_visible="true"
                      :es_obligatorio="false"
                    />
                    <SisdaiCasillaVerificacion
                      v-model="casillaUnicaAutenticacion"
                      etiqueta="¿Requiere autenticación?"
                      texto_ayuda="Texto de ayuda"
                      :es_ayuda_visible="true"
                      titulo="Título leyenda"
                    />
                  </ClientOnly>
                  <h3>Autenticación (si aplica)</h3>
                  <ClientOnly>
                    <SisdaiSelector
                      v-model="seleccionTipoAutenticacion"
                      etiqueta="Tipo de autenticación"
                    >
                      <option value="1">Token</option>
                      <option value="2">Basic Auth</option>
                      <option value="3">API Key</option>
                    </SisdaiSelector>
                    <SisdaiCampoBase
                      v-model="campoUsuario"
                      etiqueta="Usuario"
                      ejemplo="Añade un nombre"
                    />
                    <SisdaiCampoBase
                      v-model="campoContrasenia"
                      etiqueta="Contraseña"
                      ejemplo="***"
                    />
                    <SisdaiCampoBase v-model="campoToken" etiqueta="Token" ejemplo="***" />
                  </ClientOnly>
                </form>
              </template>

              <template #pie>
                <!-- se agrega aria-label -->
                <button
                  class="boton-primario"
                  aria-label="Aplicar filtros"
                  type="button"
                  @click="conectarCatalogoExterno()"
                >
                  Conectar
                </button>
              </template>
            </SisdaiModal>
          </ClientOnly>
          <button
            class="boton-primario boton-pictograma boton-grande"
            aria-label="Filtro Avanzado"
            type="button"
            @click="modalCatalogoExternos?.abrirModal()"
          >
            Añadir catálogo externos
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
