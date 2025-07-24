<script setup>
import SisdaiCampoBase from "@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue";
import SisdaiSelector from "@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue";

const campoTitulo = ref("");
const campoResumen = ref("");
const campoPalabrasClave = ref("");
const campoAutor = ref("");
const campoAnioPublicacion = ref("");

const seleccionEjemplo = ref("");

const seleccionCategoria = ref("");
const seleccionGrupo = ref("");

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
      <CatalogoLayoutNavegacion />
    </template>

    <template #visualizador>
      <div class="contenedor m-y-4">
        <div class="alineacion-izquierda ancho-lectura">
          <div class="flex">
            <span
              class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
            ></span>
            <h2 class="m-0">Editar</h2>
          </div>
          <h2>nombre de la capa.json</h2>

          <h2>Metadatos</h2>
          <ol>
            <li>Metadatos básicos</li>
          </ol>
          <p>
            <b
              >Miniatura imagen no mayor a 9kb tamaño 120x120px. Archivos Png o
              JPG</b
            >
          </p>

          <!-- Drag & Drop -->
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
            <div class="flex">
              <button
                class="boton-primario boton-chico"
                aria-label="Guardar"
                type="button"
                :disabled="!datosArriba"
              >
                Guardar
              </button>
              <button
                class="boton-secundario boton-chico"
                aria-label="Eliminar"
                type="button"
                :disabled="true"
              >
                Eliminar
              </button>
            </div>
          </div>

          <!-- Formulario -->
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoTitulo"
              etiqueta="Título"
              ejemplo="Añade un nombre"
            />
            <SisdaiCampoBase
              v-model="campoResumen"
              etiqueta="Resumen"
              ejemplo="El texto descriptivo es conciso y significativo. Debe ayudar a la persona usuaria a..."
            />
            <div class="flex">
              <div class="columna-8">
                <SisdaiSelector
                  v-model="seleccionEjemplo"
                  etiqueta="Tipo de fecha"
                  texto_ayuda="Creación, publicación o revisión."
                >
                  <option value="1">Creación</option>
                  <option value="2">Publicación</option>
                  <option value="3">Revisón</option>
                </SisdaiSelector>
              </div>
              <div class="columna-8">
                <SisdaiCampoBase
                  v-model="ejemplo.fecha"
                  etiqueta="Fecha"
                  ejemplo="tipo date"
                  tipo="date"
                  texto_ayuda="aaaa-mm-dd"
                />
              </div>
            </div>
            <SisdaiSelector v-model="seleccionCategoria" etiqueta="Categoría">
              <option value="1">Opcion Uno</option>
              <option value="2">Opcion Dos</option>
              <option value="3">Opcion Tres</option>
            </SisdaiSelector>
            <SisdaiSelector
              v-model="seleccionGrupo"
              etiqueta="Selecciona al grupo con el que compartirás tu archivo"
            >
              <option value="1">Opcion Uno</option>
              <option value="2">Opcion Dos</option>
              <option value="3">Opcion Tres</option>
            </SisdaiSelector>
            <SisdaiCampoBase
              v-model="campoPalabrasClave"
              etiqueta="Palabras clave"
              ejemplo="Agua, educación, conservación..."
            />
            <div class="flex">
              <div class="columna-8">
                <SisdaiCampoBase
                  v-model="campoAutor"
                  etiqueta="Autor"
                  ejemplo="Añade nombre de autor"
                />
              </div>
              <div class="columna-8">
                <SisdaiCampoBase
                  v-model="campoAnioPublicacion"
                  etiqueta="Año de publicación"
                  ejemplo="Ej. 2002"
                />
              </div>
            </div>
          </ClientOnly>
          <div class="flex p-t-3">
            <button class="boton-secundario boton-chico" type="button">
              Ir a mis archivos
            </button>
            <button class="boton-primario boton-chico" disabled="disabled">
              Actualizar
            </button>
            <button class="boton-primario boton-chico" :disabled="false">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </template>
  </UiLayoutPaneles>
</template>
