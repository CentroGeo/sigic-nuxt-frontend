<script setup>
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import { ref } from "vue";
import { useIAStore } from "~/stores/ia.js";
const storeIA = useIAStore();

const props = defineProps({
  titulo: { type: String, default: "Título" },
  textoBoton: { type: String, default: "Título" },
  etiquetaBusqueda: { type: String, default: undefined },
  recursoLista: { type: Array, required: true },
});
const { titulo, textoBoton, recursoLista, etiquetaBusqueda } = toRefs(props);

// const fechaHoy = new Date();
const fechaHoy = "01-07-2025";

const catalogoFiltrado = ref(recursoLista.value);
</script>

<template>
  <div>
    <div>
      <!-- TODO: Colocar ListasChats -->
      <div v-if="titulo == 'Chats'">
        <div style="max-height: 85vh; overflow-y: auto" class="p-x-3 p-t-3">
          <button
            style="width: 100%; text-align: center; display: inline-block"
            class="boton-primario"
            aria-label="Crear nuevo chat"
          >
            {{ textoBoton }}
          </button>

          <ClientOnly>
            <SisdaiCampoBusqueda
              style="width: 100%"
              class="m-y-3"
              :etiqueta="etiquetaBusqueda"
              :catalogo="recursoLista"
              :catalogo-anidado="true"
              catalogo-anidado-propiedad-elementos="chat"
              propiedad-busqueda="titulo"
              @alFiltrar="(r) => (catalogoFiltrado = r)"
            />
          </ClientOnly>

          <h6>{{ titulo }}</h6>
          <ul class="lista-sin-estilo">
            <li
              v-for="grupo in catalogoFiltrado"
              :id="grupo.id"
              :key="grupo.id"
            >
              {{ grupo.fecha == fechaHoy ? "Hoy" : grupo.fecha }}
              <ul class="lista-sin-estilo">
                <li v-for="chat in grupo.chat" :id="chat.id" :key="chat.id">
                  <nuxt-link
                    class="tarjeta-chat p-2 fondo-color-acento borde borde-redondeado-20"
                    to="/ia/chat/dinamica"
                  >
                    <div>
                      <h5 class="tarjeta-titulo m-t-0">{{ chat.titulo }}</h5>
                      <p class="tarjeta-nombre-proyecto">
                        {{ chat.proyecto }}
                      </p>
                      <p class="tarjeta-nombre-contexto">
                        {{ chat.contexto }}
                      </p>
                      <div class="flex flex-contenido-final">
                        <div>
                          <nuxt-link
                            class="boton-pictograma boton-sin-contenedor-primario"
                            to="#"
                          >
                            <span
                              class="pictograma-editar"
                              aria-hidden="true"
                            />
                          </nuxt-link>
                          <button
                            class="boton-pictograma boton-sin-contenedor-primario"
                            aria-label="Remover chat"
                            type="button"
                          >
                            <span
                              class="pictograma-eliminar"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </nuxt-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- TODO: Colocar ListasProyectos -->
    <div v-if="titulo == 'Proyectos'">
      <div style="max-height: 85vh; overflow-y: auto" class="p-x-3 p-t-3">
        <nuxt-link
          style="width: 100%; text-align: center; display: inline-block"
          class="boton boton-primario"
          aria-label="Crear proyecto"
          to="/ia/proyecto/crea-proyecto"
        >
          {{ textoBoton }}
          <span class="pictograma-agregar" aria-hidden="true" />
        </nuxt-link>

        <ClientOnly>
          <SisdaiCampoBusqueda
            style="width: 100%"
            class="m-y-3"
            :catalogo="recursoLista"
            :etiqueta="etiquetaBusqueda"
            propiedad-busqueda="titulo"
          />
        </ClientOnly>

        <h6>{{ titulo }}</h6>
      </div>

      <div v-if="storeIA.existenProyectos">
        <ul class="lista-chats lista-sin-estilo">
          <li
            v-for="proyecto in catalogoFiltrado"
            :key="proyecto.id"
            class="m-0"
          >
            <div class="proyecto seleccionado p-l-4 p-r-2 p-y-1">
              <div class="proyecto-titulo m-b-1">{{ proyecto.titulo }}</div>
              <div class="flex">
                <UiNumeroElementos
                  :numero="proyecto.numero_contextos"
                  etiqueta="Contextos"
                />
                <UiNumeroElementos
                  :numero="proyecto.numero_fuentes"
                  etiqueta="Fuentes"
                />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.lista-chats {
  max-height: 85vh;
  overflow-y: auto;
}
.boton-nuevo-proyecto {
  width: 100%;
}

.proyecto {
  &.seleccionado {
    border-left: var(--Escalas-Bordes-borde-8, 8px) solid
      var(--Base-Borde---borde-acento, #53323c);
    background: var(--Base-Fondo---fondo-acento, #fcf3f5);
  }

  .proyecto-titulo {
    color: var(
      --Componentes-Navegacin-secundaria---navegacion-secundaria-color,
      #391821
    );
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: var(--Tipos-Interlineado-Prrafos-Prrafos, 24px);
  }
}
</style>
