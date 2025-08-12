<script setup>
import SisdaiCampoBase from "@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue";
import SisdaiAreaTexto from "@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue";
import SisdaiGrupoBotonesRadio from "@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue";
import SisdaiBotonRadio from "@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue";
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import SisdaiCasilla from "@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue";
import { ref } from "vue";

const catalogoModal = ref(null);
const capasModal = ref(null);
const archivosSeleccionados = ref([]);
const inputArchivos = ref(null);

const storeIA = useIAStore();

// Datos del formulario
const nombreProyecto = ref("");
const descripcionProyecto = ref("");
const visibilidadProyecto = ref("publico"); // Valor por defecto

const categorias = ref([
  {
    id: 0,
    titulo: "Nombre de categoría 1"
  },
  {
    id: 1,
    titulo: "Nombre de categoría 2"
  },
  {
    id: 2,
    titulo: "Nombre de categoría 3"
  },
  {
    id: 3,
    titulo: "Nombre de categoría 4"
  }
]);

const capasGeograficas = ref([
  {
    id: 0,
    titulo: "Nombre de la fuente de información",
    tipo: "Poligonos"
  },
  {
    id: 1,
    titulo: "Nombre de la fuente de información",
    tipo: "Puntos"
  },
  {
    id: 2,
    titulo: "Nombre de la fuente de información",
    tipo: "Líneas"
  }
]);

const capasSeleccionadas = ref([
  {
    id: 0,
    titulo: "Nombre de la fuente de información",
    cateogria: "Categoría 1",
    tipo: "Poligonos"
  },
  {
    id: 1,
    titulo: "Nombre de la fuente de información",
    cateogria: "Categoría 3",
    tipo: "Puntos"
  }
]);

const categoriaSeleccionada = ref(null);

const route = useRoute();
const esEdicion = ref(false);

const proyecto = computed(() => storeIA.proyectoSeleccionado);

onMounted(async () => {
  if (route.params.id !== "nuevo") {
    esEdicion.value = true;

    nombreProyecto.value = proyecto.value.title;
    descripcionProyecto.value = proyecto.value.description;
    visibilidadProyecto.value = proyecto.value.public ? "publico" : "privado";
  }
});

const seleccionarCategoria = categoria => {
  categoriaSeleccionada.value = categoria;
};

//const botonRadio = ref("");
const botonRadioModal = ref("");
const campoCasilla = ref(false);

// Método para manejar la selección de archivos
const manejarSeleccionArchivos = event => {
  const nuevosArchivos = Array.from(event.target.files).map(file => ({
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    nombre: file.name,
    tipo: obtenerTipoArchivo(file.name),
    archivo: file, // Objeto File original
    categoria: "Archivo",
    origen: "Propio"
  }));

  archivosSeleccionados.value = [
    ...archivosSeleccionados.value,
    ...nuevosArchivos
  ];
  event.target.value = ""; // Resetear el input para permitir seleccionar el mismo archivo otra vez
};

// Función para determinar el tipo de archivo
const obtenerTipoArchivo = nombre => {
  const extension = nombre.split(".").pop().toLowerCase();
  const tipos = {
    shp: "Shapefile",
    geojson: "GeoJSON",
    csv: "CSV",
    kml: "KML",
    zip: "ZIP",
    pdf: "PDF",
    doc: "Word",
    docx: "Word",
    xls: "Excel",
    xlsx: "Excel"
  };
  return tipos[extension] || extension.toUpperCase();
};

// Método para eliminar archivo de la lista
const eliminarArchivo = id => {
  archivosSeleccionados.value = archivosSeleccionados.value.filter(
    archivo => archivo.id !== id
  );
};

// Función para guardar el proyecto
const guardarProyecto = async () => {
  try {
    // Mostrar notificación de inicio
    /*     notificacion.mostrar({
      tipo: 'info',
      mensaje: 'Iniciando subida del proyecto...',
      duracion: 3000
    }); */

    await storeIA.crearProyecto(
      nombreProyecto.value,
      descripcionProyecto.value,
      visibilidadProyecto.value,
      archivosSeleccionados.value
    );

    // Notificación de éxito
    //alert("Proyecto guardado correctamente")
    console.log("Proyecto guardado correctamente");
    /*    notificacion.mostrar({
      tipo: 'exito',
      mensaje: 'Proyecto guardado correctamente',
      duracion: 5000
    }); */

    navigateTo("/ia/proyectos");
  } catch (error) {
    alert("Error al guardar: " + error.message);
    console.log("Error al guardar: " + error.message);
    notificacion.mostrar({
      tipo: "error",
      mensaje: "Error al guardar: " + error.message,
      duracion: 7000
    });
  }
};
</script>

<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaLeyendaInicioListas />

      <IaLayoutListas
        v-if="storeIA.existenProyectos"
        texto-boton="Crear proyecto"
        titulo="Proyectos"
        etiqueta-busqueda="Buscar un proyecto"
      />
    </template>

    <template #vistas-ia>
      <div class="contenedor">
        <h2>Configuración de proyecto</h2>
        <div class="grid">
          <div class="columna-10">
            <form action="">
              <ClientOnly>
                <SisdaiCampoBase
                  v-model="nombreProyecto"
                  etiqueta="Nombre del proyecto"
                  ejemplo=""
                  :es_etiqueta_visible="true"
                  class="m-b-3"
                />

                <SisdaiAreaTexto
                  v-model="descripcionProyecto"
                  etiqueta="Descripción del proyecto"
                  :es_etiqueta_visible="true"
                  :es_obligatorio="false"
                  class="m-b-3"
                />

                <SisdaiGrupoBotonesRadio leyenda="Visibilidad">
                  <SisdaiBotonRadio
                    v-model="visibilidadProyecto"
                    etiqueta="Público"
                    value="publico"
                    name="visibilidad"
                  />
                  <SisdaiBotonRadio
                    v-model="visibilidadProyecto"
                    etiqueta="Privado"
                    value="privado"
                    name="visibilidad"
                  />
                </SisdaiGrupoBotonesRadio>
              </ClientOnly>
            </form>
          </div>
        </div>
        <div class="flex flex-contenido-final">
          <NuxtLink
            class="boton boton-chico boton-primario"
            aria-label="Guardar proyecto"
            @click="guardarProyecto"
          >
            Guardar proyecto
          </NuxtLink>
          <nuxt-link
            class="boton boton-chico boton-secundario"
            aria-label="Cancelar"
            to="/ia/proyectos/"
          >
            Cancelar
          </nuxt-link>
        </div>

        <div class="grid">
          <div class="columna-16">
            <p class="seperador borde-b" />
            <div class="flex flex-contenido-separado fuentes-encabezado">
              <h2>Agregar fuentes de información</h2>
              <div>
                <button
                  class="boton-pictograma boton-primario m-r-2"
                  aria-label="Agregar del catalogo"
                  @click="catalogoModal?.abrirModal()"
                >
                  Agregar del catálogo
                  <span class="pictograma-agregar" aria-hidden="true" />
                </button>

                <!-- botón "Subir archivos" -->
                <button
                  class="boton-pictograma boton-primario"
                  aria-label="Subir archivos"
                  @click="$refs.fileInput.click()"
                >
                  Subir archivos
                  <span class="pictograma-archivo-subir" aria-hidden="true" />
                </button>

                <!-- Input de archivo oculto -->
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept=".shp,.geojson,.csv,.kml,.zip,.pdf,.doc,.docx,.xls,.xlsx"
                  style="display: none"
                  @change="manejarSeleccionArchivos"
                />
              </div>
            </div>
            <!--             <div class="flex flex-contenido-final">
              <NuxtLink
                class="boton boton-chico boton-primario"
                aria-label="Guardar proyecto"
                @click="guardarProyecto"
              >
                Guardar proyecto
              </NuxtLink>
              <nuxt-link
                class="boton boton-chico boton-secundario"
                aria-label="Cancelar"
                to="/ia/proyectos/"
              >
                Cancelar
              </nuxt-link>
            </div> -->
          </div>
        </div>

        <div
          class="tabla-archivos m-t-3"
          v-if="archivosSeleccionados.length > 0"
        >
          <h3>Archivos a subir</h3>
          <table class="tabla">
            <thead>
              <tr>
                <th class="p-x-3 p-y-2">Nombre</th>
                <th class="p-x-3 p-y-2">Tipo de archivo</th>
                <th class="p-x-3 p-y-2">Categoría</th>
                <th class="p-x-3 p-y-2">Origen</th>
                <th class="p-x-3 p-y-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="archivo in archivosSeleccionados" :key="archivo.id">
                <td class="p-3">{{ archivo.nombre }}</td>
                <td class="p-3">{{ archivo.tipo }}</td>
                <td class="p-3">{{ archivo.categoria }}</td>
                <td class="p-3">{{ archivo.origen }}</td>
                <td class="p-x-3 p-y-1">
                  <button
                    class="boton-pictograma boton-secundario boton-chico"
                    aria-label="Eliminar archivo"
                    @click="eliminarArchivo(archivo.id)"
                  >
                    <span class="pictograma-eliminar" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ClientOnly>
        <SisdaiModal ref="catalogoModal">
          <template #encabezado>
            <h2>Agregar información del catálogo</h2>
          </template>

          <template #cuerpo>
            <p>
              Selecciona el tipo de fuente de información que deseas agregar a
              tu proyecto
            </p>
            <SisdaiGrupoBotonesRadio
              leyenda=""
              :es_obligatorio="false"
              class="radio-catalogo"
            >
              <SisdaiBotonRadio
                v-model="botonRadioModal"
                etiqueta="Capas geográficas"
                value="Uno"
                name="nombredelgrupo"
                :es_obligatorio="false"
              />
              <SisdaiBotonRadio
                v-model="botonRadioModal"
                etiqueta="Tabulados de datos"
                value="Dos"
                name="nombredelgrupo"
                :es_obligatorio="false"
              />
              <SisdaiBotonRadio
                v-model="botonRadioModal"
                etiqueta="Documentos"
                value="Tres"
                name="nombredelgrupo"
                :es_obligatorio="false"
              />
            </SisdaiGrupoBotonesRadio>
          </template>

          <template #pie>
            <button
              type="button"
              class="boton-primario boton-chico"
              @click="
                catalogoModal?.cerrarModal();
                capasModal?.abrirModal();
              "
            >
              Siguiente
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="capasModal" class="modal-grande">
          <template #encabezado>
            <h2>Agregar (capas/tablas/documentos) del catálogo</h2>
          </template>

          <template #cuerpo>
            <p>
              Explora el catálogo y selecciona fuentes de información para el
              proyecto
            </p>
            <SisdaiCampoBusqueda class="m-y-3" etiqueta="Buscar del catálogo" />
            <div class="flex flex-contenido-separado">
              <div class="columna-5">
                <div>
                  <UiNumeroElementos
                    :numero="12"
                    etiqueta="Categorías"
                    class="m-b-3"
                  />
                  <ul class="lista-sin-estilo" style="overflow-y: auto">
                    <li
                      v-for="categoria in categorias"
                      :key="categoria.titulo"
                      class="m-y-0"
                    >
                      <div
                        class="categoria p-l-6 p-r-2 p-y-1"
                        :class="{
                          seleccionada: categoria === categoriaSeleccionada
                        }"
                        @click="seleccionarCategoria(categoria)"
                      >
                        {{ categoria.titulo }}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="columna-5">
                <div>
                  <UiNumeroElementos
                    :numero="7"
                    etiqueta="Capas geográficas"
                    class="m-b-3"
                  />
                  <ul class="lista-sin-estilo" style="overflow-y: auto">
                    <li
                      v-for="capa in capasGeograficas"
                      :key="capa.id"
                      class="m-y-0"
                    >
                      <div class="capa p-2 m-b-2 borde-redondeado-20">
                        <SisdaiCasilla
                          v-model="campoCasilla"
                          :etiqueta="capa.titulo"
                        />
                        <div class="icono">
                          <span
                            class="pictograma-capa-poligono m-r-1"
                            aria-hidden="true"
                          />
                          <span>{{ capa.tipo }}</span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="columna-5">
                <div>
                  <UiNumeroElementos
                    :numero="4"
                    etiqueta="Capas seleccionadas"
                    class="m-b-3"
                  />
                  <ul class="lista-sin-estilo" style="overflow-y: auto">
                    <li
                      v-for="capa in capasSeleccionadas"
                      :key="capa.id"
                      class="m-y-0"
                    >
                      <div class="capa p-2 m-b-2 borde-redondeado-20">
                        <h6 class="m-t-0 m-b-1">{{ capa.titulo }}</h6>
                        <div class="m-b-1">
                          {{ capa.cateogria }}
                        </div>
                        <div class="icono m-b-1">
                          <span
                            class="pictograma-capa-poligono m-r-1"
                            aria-hidden="true"
                          />
                          <span>{{ capa.tipo }}</span>
                        </div>
                        <div class="flex flex-contenido-final">
                          <button
                            class="boton-pictograma boton-sin-contenedor-secundario boton-chico"
                            aria-label="Remover"
                            type="button"
                          >
                            <span
                              class="pictograma-eliminar"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </template>

          <template #pie>
            <button
              type="button"
              class="boton-primario boton-chico"
              @click="capasModal?.cerrarModal()"
            >
              Aceptar
            </button>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </IaLayoutPaneles>

  <!-- barra de progreso de subida -->
  <div class="grid">
    <div class="columna-16">
      <!-- Barra de progreso (mostrar solo durante subida) -->
      <div v-if="storeIA.isUploading" class="upload-progress">
        <progress :value="storeIA.uploadProgress" max="100"></progress>
        <span>{{ storeIA.uploadProgress }}% completado</span>
      </div>

      <!--       <div class="flex flex-contenido-final">
        <NuxtLink
          class="boton boton-chico boton-primario"
          aria-label="Guardar proyecto"
          @click="guardarProyecto"
          :disabled="storeIA.isUploading"
        >
          <span v-if="!storeIA.isUploading">Guardar proyecto</span>
          <span v-else>Subiendo...</span>
        </NuxtLink>
        
        <nuxt-link
          class="boton boton-chico boton-secundario"
          aria-label="Cancelar"
          to="/ia/proyectos/"
          :disabled="storeIA.isUploading"
        >
          Cancelar
        </nuxt-link>
      </div> -->
    </div>
  </div>
</template>

<style lang="scss">
.separador {
  width: 100%;
  height: 1px;
  background: #aaa;
}

.fuentes-encabezado {
  align-items: center;
}

.radio-catalogo {
  .grupo-formulario {
    flex-direction: column;
  }
}

.categoria {
  background: var(--navegacion-secundaria-fondo);
  color: var(--navegacion-secundaria-activo-borde);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  cursor: pointer;

  &.seleccionada {
    border-left: 8px solid var(--navegacion-secundaria-activo-borde);
    background: var(--navegacion-secundaria-activo-fondo);
  }
}

.capa {
  background: var(--fondo-acento);
  color: var(--texto-secundario);

  font-style: normal;
  font-weight: 500;
  line-height: 20px;

  .icono {
    display: flex;
    align-items: center;
  }
}

//tabla de archivos. TODO: estilo sisdai
/* .tabla-archivos {
  margin-top: 2rem;
  border: 1px solid var(--borde);
  border-radius: 4px;
  overflow: hidden;

  h3 {
    background: var(--fondo-acento);
    padding: 1rem;
    margin: 0;
    font-size: 1.1rem;
  }
}*/

.tabla {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    /* padding: 0.75rem 1rem; */
    text-align: center;
  }

  th {
    border-bottom: 1px solid var(--borde);
    color: var(--Base-Tipografa---texto-primario, #141414);
    text-align: center;
    font-size: var(--Tipos-Tamao-Prrafos-Prrafo-base, 16px);
    font-style: normal;
    font-weight: 600;
    line-height: var(--Tipos-Interlineado-Prrafos-Prrafos, 24px); /* 150% */
  }

  tr:last-child td {
    border-bottom: none;
  }
}

//barra ed progreso. TODO: estilo sisdai
.upload-progress {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--fondo-acento);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-progress progress {
  width: 100%;
  height: 20px;
}

.upload-progress span {
  text-align: center;
  font-size: 0.9rem;
}

.boton[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
