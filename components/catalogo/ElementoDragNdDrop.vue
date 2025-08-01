<script setup>
const props = defineProps({
  tipoArchivoValidos: {
    type: String,
    default: "",
  },
});
const { tipoArchivoValidos } = toRefs(props);

const ejemplo = ref({});

const formData = ref(new FormData());

// para obtener el token para bearer
const { data } = useAuth();
const datosArriba = ref(false);
const datos = ref({});
const esSLD = ref(false);
const todosLosDemas = ref(false);
const archivoValido = ref(false);

function appendSLD(files, layerSlug, token) {
  // console.log("files", files);
  files.forEach((file) => {
    formData.value.append("base_file", file);
    formData.value.append("sld_file", file);
    formData.value.append("dataset_title", layerSlug);
    // formData.value.append("dataset_title", "geonode:coordinaciones");
    formData.value.append("style_upload_form", "true");
    formData.value.append("permissions", JSON.stringify({}));
    formData.value.append("charset", "undefined");
    // token importante
    formData.value.append("token", token);
  });
  // console.log("formData.value", formData.value);
}

const validarTipoArchivo = (files) => {
  files.forEach((file) => {
    // console.log("file.name", file.name);
    // console.log("file.type", file.type);
    if (
      tipoArchivoValidos.value === "sld" &&
      (file.name.slice(-4) === ".sld" ||
        file.type === ".sld" ||
        file.type === "application/vnd.sld+xml" ||
        file.type === "application/vnd.sld+xml,.sld")
    ) {
      console.log("Archivo SLD válido");
      esSLD.value = true;
    } else if (
      tipoArchivoValidos.value !== "sld" &&
      (file.type === "application/vnd.geo+json" ||
        file.type === "application/json" ||
        file.type === "application/geo+json" ||
        file.type === "application/geopackage+sqlite3" ||
        file.type === "text/csv" ||
        file.type === "application/xml" ||
        file.type === "application/pdf" ||
        file.type === "image/jpeg" ||
        file.type === "image/png")
    ) {
      todosLosDemas.value = true;
    } else {
      archivoValido.value = true;
      datosArriba.value = false;
    }
  });
};

const onDropZone = ref(null);
const { files } = useDropZone(onDropZone, { onDrop });
async function onDrop() {
  // imprime el archivo que se suba mediante el drop
  // console.log("files", files.value);

  if (files.value) {
    // obtén el token para el bearer
    const token = data.value?.accessToken;
    // console.log("token", token);
    files.value = Array.from(files.value);

    datos.value = files.value;
    datosArriba.value = true;
    // let isValid = false;

    // files.value.forEach((file) => {});
    validarTipoArchivo(files.value);
    // appendSLD(files.value, "geonode:coordinaciones", token);
    if (esSLD.value && tipoArchivoValidos.value === "sld") {
      appendSLD(files.value, "geonode:coordinaciones", token);
    } else if (todosLosDemas.value) {
      // appendOtros(files, token);
      console.log("subiendo");
    } else {
      console.log("Archivo inválido");
    }

    files.value.forEach((file) => {
      // formData.value.append("base_file", file);
      // formData.value.append("sld_file", file);
      // // TODO: cambiar el layerSlug según la capa
      // // formData.append('dataset_title', layerSlug);
      // formData.value.append("dataset_title", "geonode:coordinaciones");
      // formData.value.append("style_upload_form", "true");
      // formData.value.append("permissions", JSON.stringify({}));
      // formData.value.append("charset", "undefined");
      // // token importante
      // formData.value.append("token", token);
      // TODO: revisar bien los MIME de los archivos válidos
      // if (
      //   file.type === "application/vnd.geo+json" ||
      //   file.type === "application/json" ||
      //   file.type === "application/geo+json" ||
      //   file.type === "application/geopackage+sqlite3" ||
      //   file.type === "text/csv" ||
      //   file.type === "application/xml" ||
      //   file.type === "application/pdf" ||
      //   file.type === "image/jpeg" ||
      //   file.type === "image/png" ||
      //   file.name.slice(-4) === ".sld"
      // ) {
      //   // console.log(file);
      //   formData.append(
      //     "file",
      //     file,
      //     file.name.replaceAll(" ", "-").toLocaleLowerCase()
      //   );
      //   isValid = true;
      // } else {
      //   isValid = false;
      //   console.log("Archivo inválido");
      // }
    });

    // if (isValid) {
    //   console.log(formData);
    //   await $fetch("/api/subirSLD", {
    //     method: "POST",
    //     body: formData,
    //   });
    // }
  }
}

const { open, onChange } = useFileDialog();
onChange(async (files) => {
  // imprime el archivo que se suba mediante el diálogo
  // console.log("files", files);
  files = Array.from(files);

  if (files) {
    // obtén el token para el bearer
    const token = data.value?.accessToken;
    // console.log("token", token);

    datos.value = files;
    datosArriba.value = true;

    validarTipoArchivo(files);

    if (esSLD.value && tipoArchivoValidos.value === "sld") {
      appendSLD(files, "geonode:coordinaciones", token);
    } else if (todosLosDemas.value) {
      // appendOtros(files, token);
      console.log("subiendo");
    } else {
      console.log("Archivo inválido");
    }
    // por cada conjunto de Files asigna las propiedades
    // según el tipo de archivo. acá es para SLD
    // for (let x = 0; x < files.length; x++) {
    //   // formData.value.append("base_file", files[x]);
    //   // formData.value.append("sld_file", files[x]);
    //   // // TODO: cambiar el layerSlug según la capa
    //   // // formData.append('dataset_title', layerSlug);
    //   // formData.value.append("dataset_title", "geonode:coordinaciones");
    //   // formData.value.append("style_upload_form", "true");
    //   // formData.value.append("permissions", JSON.stringify({}));
    //   // formData.value.append("charset", "undefined");
    //   // // token importante
    //   // formData.value.append("token", token);
    // }
  }
  // console.log("formData.value", formData.value);

  // TODO: remover cuando esté back, asignar una copia al store
  // datos.value = files;
  // datosArriba = true;
  // let isValid = false;
  // if (files) {
  //   for (let x = 0; x < files.length; x++) {
  //     // imprime el archivo en forma de objeto
  //     console.log("files[x]", files[x]);

  //     // TODO: revisar bien los archivos válidos
  //     if (
  //       files[x]?.type === "application/vnd.geo+json" ||
  //       files[x]?.type === "application/json" ||
  //       files[x]?.type === "application/geo+json" ||
  //       files[x]?.type === "application/geopackage+sqlite3" ||
  //       files[x]?.type === "text/csv" ||
  //       files[x]?.type === "application/xml" ||
  //       files[x]?.type === "application/pdf" ||
  //       files[x]?.type === "image/jpeg" ||
  //       files[x]?.type === "image/png" ||
  //       files[x]?.name.slice(-4) === ".sld"
  //     ) {
  //       // agrega el archivo a un FormData
  //       // formData.append(
  //       //   "file",
  //       //   files[x],
  //       //   files[x]?.name.replaceAll(" ", "-").toLocaleLowerCase()
  //       // );

  //       console.log("files[x]", files[x]);

  //       formData.append("base_file", files[x]);
  //       formData.append("sld_file", files[x]);
  //       formData.append("dataset_title", "geonode:coordinaciones");
  //       // formData.append('dataset_title', layerSlug);
  //       formData.append("style_upload_form", "true");
  //       formData.append("permissions", JSON.stringify({}));
  //       formData.append("charset", "undefined");

  //       isValid = true;
  //     } else {
  //       isValid = false;
  //       console.log("Archivo inválido");
  //       console.log("files[x]?.type", files[x]?.type);
  //     }
  //   }
  // }
  // if (isValid) {
  //   // imprime el FormData si es el archivo fue válido
  //   console.log(formData);

  //   // manda el FormData con los archivos al event handler de api/upload
  //   await $fetch("/api/subirV2", {
  //     method: "POST",
  //     body: formData,
  //   });
  // }
});
</script>
<template>
  <div>
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
                <span class="pictograma-archivo-subir pictograma-mediano" />
              </div>
              <p>Arratra o suelta tu archivo</p>
            </div>
            <div class="texto-izquierda">
              <p v-for="d in datos" :key="d.name">
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
          </div>
        </div>
      </div>
      <p v-if="archivoValido" class="texto-color-error">Archivo inválido</p>
      <div class="flex">
        <client-only>
          <button
            class="boton-primario boton-chico"
            aria-label="Guardar"
            type="button"
            :disabled="!datosArriba"
            @click="$emit('guardarArchivo', formData)"
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
        </client-only>
      </div>
    </div>
    <!-- TODO: preguntar la mejor opción -->
    <!-- <ClientOnly>
      <CatalogoCampoBase
        v-model="ejemplo.archivo"
        etiqueta="Arrastra o suelta tu archivo"
        ejemplo="tipo file"
        tipo="file"
      />
    </ClientOnly>
    <input type="file" @change="(e) => (archivo = e.target.files[0])" /> -->
  </div>
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
