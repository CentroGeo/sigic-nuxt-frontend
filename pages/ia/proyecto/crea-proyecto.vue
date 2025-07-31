<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiGrupoBotonesRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiCasilla from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';

import { ref } from 'vue';

const catalogoModal = ref(null);
const capasModal = ref(null);

const storeIA = useIAStore();

const categorias = ref([
  {
    id: 0,
    titulo: 'Nombre de categoría 1',
  },
  {
    id: 1,
    titulo: 'Nombre de categoría 2',
  },
  {
    id: 2,
    titulo: 'Nombre de categoría 3',
  },
  {
    id: 3,
    titulo: 'Nombre de categoría 4',
  },
]);

const capasGeograficas = ref([
  {
    id: 0,
    titulo: 'Nombre de la fuente de información',
    tipo: 'Poligonos',
  },
  {
    id: 1,
    titulo: 'Nombre de la fuente de información',
    tipo: 'Puntos',
  },
  {
    id: 2,
    titulo: 'Nombre de la fuente de información',
    tipo: 'Líneas',
  },
]);

const capasSeleccionadas = ref([
  {
    id: 0,
    titulo: 'Nombre de la fuente de información',
    cateogria: 'Categoría 1',
    tipo: 'Poligonos',
  },
  {
    id: 1,
    titulo: 'Nombre de la fuente de información',
    cateogria: 'Categoría 3',
    tipo: 'Puntos',
  },
]);

const categoriaSeleccionada = ref(null);

const seleccionarCategoria = (categoria) => {
  categoriaSeleccionada.value = categoria;
};

const botonRadio = ref('');
const botonRadioModal = ref('');
const campoCasilla = ref(false);
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
                  etiqueta="Nombre del proyecto"
                  ejemplo=""
                  :es_etiqueta_visible="true"
                  class="m-b-3"
                />

                <SisdaiAreaTexto
                  etiqueta="Descripción del proyecto"
                  :es_etiqueta_visible="true"
                  :es_obligatorio="false"
                  class="m-b-3"
                />

                <SisdaiGrupoBotonesRadio leyenda="Visibilidad">
                  <SisdaiBotonRadio
                    v-model="botonRadio"
                    etiqueta="Público"
                    value="publico"
                    name="visibilidad"
                  />
                  <SisdaiBotonRadio
                    v-model="botonRadio"
                    etiqueta="Privado"
                    value="privado"
                    name="visibilidad"
                  />
                </SisdaiGrupoBotonesRadio>
              </ClientOnly>
            </form>
          </div>
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
                <button class="boton-pictograma boton-primario" aria-label="Subir archivos">
                  Subir archivos
                  <span class="pictograma-archivo-subir" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div class="flex flex-contenido-final">
              <NuxtLink
                class="boton boton-chico boton-primario"
                aria-label="Guardar proyecto"
                to="/ia/proyectos"
                @click="storeIA.crearProyecto()"
              >
                Guardar proyecto
              </NuxtLink>
              <button class="boton-chico boton-secundario" aria-label="Cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      </div>

      <ClientOnly>
        <SisdaiModal ref="catalogoModal">
          <template #encabezado>
            <h2>Agregar información del catálogo</h2>
          </template>

          <template #cuerpo>
            <p>Selecciona el tipo de fuente de información que deseas agregar a tu proyecto</p>
            <SisdaiGrupoBotonesRadio leyenda="" :es_obligatorio="false" class="radio-catalogo">
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
            <p>Explora el catálogo y selecciona fuentes de información para el proyecto</p>
            <SisdaiCampoBusqueda class="m-y-3" etiqueta="Buscar del catálogo" />
            <div class="flex flex-contenido-separado">
              <div class="columna-5">
                <div>
                  <UiNumeroElementos :numero="12" etiqueta="Categorías" class="m-b-3" />
                  <ul class="lista-sin-estilo" style="overflow-y: auto">
                    <li v-for="categoria in categorias" :key="categoria.titulo" class="m-y-0">
                      <div
                        class="categoria p-l-6 p-r-2 p-y-1"
                        :class="{
                          seleccionada: categoria === categoriaSeleccionada,
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
                  <UiNumeroElementos :numero="7" etiqueta="Capas geográficas" class="m-b-3" />
                  <ul class="lista-sin-estilo" style="overflow-y: auto">
                    <li v-for="capa in capasGeograficas" :key="capa.id" class="m-y-0">
                      <div class="capa p-2 m-b-2 borde-redondeado-20">
                        <SisdaiCasilla v-model="campoCasilla" :etiqueta="capa.titulo" />
                        <div class="icono">
                          <span class="pictograma-capa-poligono m-r-1" aria-hidden="true" />
                          <span>{{ capa.tipo }}</span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="columna-5">
                <div>
                  <UiNumeroElementos :numero="4" etiqueta="Capas seleccionadas" class="m-b-3" />
                  <ul class="lista-sin-estilo" style="overflow-y: auto">
                    <li v-for="capa in capasSeleccionadas" :key="capa.id" class="m-y-0">
                      <div class="capa p-2 m-b-2 borde-redondeado-20">
                        <h6 class="m-t-0 m-b-1">{{ capa.titulo }}</h6>
                        <div class="m-b-1">
                          {{ capa.cateogria }}
                        </div>
                        <div class="icono m-b-1">
                          <span class="pictograma-capa-poligono m-r-1" aria-hidden="true" />
                          <span>{{ capa.tipo }}</span>
                        </div>
                        <div class="flex flex-contenido-final">
                          <button
                            class="boton-pictograma boton-sin-contenedor-secundario boton-chico"
                            aria-label="Remover"
                            type="button"
                          >
                            <span class="pictograma-eliminar" aria-hidden="true" />
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
</style>
