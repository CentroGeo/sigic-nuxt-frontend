<script setup>
const archivo = (ref < File) | (null > null);

const ejemplo = ref({});

const data = ref({});

const onDropZone = ref(null);
const { files } = useDropZone(onDropZone, { onDrop });
async function onDrop() {
  // function onDrop() {
  // console.log(files.value);
  if (files.value) {
    // TODO: remover cuando esté back, asignar una copia al store
    data.value = files.value;
    datosArriba = true;

    const formData = new FormData();
    let isValid = false;
    files.value.forEach((file) => {
      // TODO: revisar bien los MIME de los archivos válidos
      if (
        file.type === "application/geo+json" ||
        file.type === "application/json" ||
        file.type === "text/csv" ||
        file.type === "application/xml" ||
        file.type === "application/pdf" ||
        file.type === "image/jpge" ||
        file.type === "image/png" ||
        file.type === "image/webp"
      ) {
        // console.log(file);
        formData.append(
          "file",
          file,
          file.name.replaceAll(" ", "-").toLocaleLowerCase()
        );
        isValid = true;
      } else {
        isValid = false;
        console.log("Archivo inválido");
      }
    });

    if (isValid) {
      console.log(formData);
      await $fetch("/api/subirV2", {
        method: "POST",
        body: formData,
      });
    }
  }
}

let datosArriba = false;

const { open, onChange } = useFileDialog();
onChange(async (files) => {
  // imprime el archivo que se suba mediante el diálogo
  console.log(files);

  // TODO: remover cuando esté back, asignar una copia al store
  data.value = files;
  datosArriba = true;

  const formData = new FormData();
  let isValid = false;
  if (files) {
    for (let x = 0; x < files.length; x++) {
      // imprime el archivo en forma de objeto
      console.log(files[x]);

      // TODO: revisar bien los archivos válidos
      if (
        files[x]?.type === "application/geo+json" ||
        files[x]?.type === "application/json" ||
        files[x]?.type === "text/csv" ||
        files[x]?.type === "application/xml" ||
        files[x]?.type === "application/pdf" ||
        files[x]?.type === "image/jpge" ||
        files[x]?.type === "image/png" ||
        files[x]?.type === "image/webp"
      ) {
        // agrega el archivo a un FormData
        formData.append(
          "file",
          files[x],
          files[x]?.name.replaceAll(" ", "-").toLocaleLowerCase()
        );
        isValid = true;
      } else {
        isValid = false;
        console.log("Archivo inválido");
      }
    }
  }
  if (isValid) {
    // imprime el FormData si es el archivo fue válido
    console.log(formData);

    // manda el FormData con los archivos al event handler de api/upload
    await $fetch("/api/subirV2", {
      method: "POST",
      body: formData,
    });
  }
});
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10">
        <div class="alineacion-izquierda ancho-lectura">
          <h2>Carga archivo</h2>
          <p>
            <b>Solo archivos GeoJSON, Geopaquetes, CSV, XML, PDF, JPG y PNG.</b>
          </p>

          <!-- TODO> hacer components DragNdDrop -->
          <div>
            <div
              ref="onDropZone"
              class="flex flex-contenido-centrado borde borde-redondeado-16 p-1 m-b-3"
              style="min-height: 281px; border-style: dashed; cursor: pointer"
              @click="open()"
            >
              <div class="flex flex-vertical-centrado">
                <div class="texto-centrado">
                  <div v-if="!datosArriba">
                    <div>
                      <span
                        class="pictograma-archivo-subir pictograma-mediano"
                      />
                    </div>
                    <p>Arratra o suelta tu archivo</p>
                  </div>
                  <div class="texto-izquierda">
                    <p v-for="d in data" :key="d.name">
                      {{ d.name }}
                    </p>
                  </div>

                  <label
                    class="boton boton-secundario boton-chico"
                    for="identificadorUNICO"
                    @click="open()"
                  >
                    Elige Archivo
                  </label>
                  <input
                    id="identificadorUNICO"
                    name="identificadorUNICO"
                    placeholder="ejemplo"
                    type="file"
                    :v-model="ejemplo"
                    @click="open()"
                  />
                  <!-- TODO: preguntar la mejor opción -->
                  <!-- <ClientOnly>
                  <CatalogoCampoBase
                    v-model="ejemplo.archivo"
                    etiqueta="Arrastra o suelta tu archivo"
                    ejemplo="tipo file"
                    tipo="file"
                  />
                </ClientOnly>
                <input
                  type="file"
                  @change="(e) => (archivo = e.target.files[0])"
                /> -->
                </div>
              </div>
            </div>
            <button
              class="boton-primario boton-chico"
              type="button"
              :disabled="!datosArriba"
            >
              Subir archivos
            </button>
          </div>

          <h2>Cargas pendientes</h2>
          <div>
            <div class="fondo-color-confirmacion p-2 borde-redondeado-16">
              <div class="flex texto-color-confirmacion">
                <span class="pictograma-aprobado" />
                <b> Archivo cargado correctamente </b>
              </div>

              <div class="texto-color-confirmacion">
                <p class="m-b-0">
                  Se detectaron 236 polígonos/líneas/puntos válidos
                </p>
                <p class="m-0">Sistema de referencia EPSG:4326</p>
              </div>

              <p>Capas_lago_texcoco.json</p>
              <div class="flex">
                <div class="columna-8">
                  <nuxt-link to="/catalogo/mis-archivos/editar-metadatos"
                    >Editar metadatos</nuxt-link
                  >
                </div>
                <div class="columna-8">
                  <nuxt-link to="/catalogo/mis-archivos/editar-estilo"
                    >Agrega un estilo (.sld)</nuxt-link
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss">
#identificadorUNICO {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
#identificadorUNICO + label {
  display: inline-block;
  cursor: pointer;
}
#identificadorUNICO:focus + label,
#identificadorUNICO + label:hover {
}
</style>
