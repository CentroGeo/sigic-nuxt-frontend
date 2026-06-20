<script setup>
definePageMeta({ middleware: 'redireccionar-modulo-geocontenidos' });

const ruta = '/geocontenidos';
const route = useRoute();

// Las vistas de mapa a pantalla completa (visualizar/embed) se renderizan sin
// el chrome del módulo (navegación lateral + paneles).
const enMapaStandalone = computed(() => /\/mapas\/[^/]+\/(visualizar|embed)$/.test(route.path));

// Colapsar el panel lateral izquierdo (menú del módulo).
const colapsado = ref(false);
function alternarColapsar() {
  colapsado.value = !colapsado.value;
}
</script>

<template>
  <NuxtPage v-if="enMapaStandalone" />
  <div v-else class="modulo-geocontenidos flex">
    <UiNavegacionLateral
      :funcion-colapsar="alternarColapsar"
      :estado-colapable="colapsado"
      id-colapsable="geocontenidos-paneles"
      :sub-paginas="[
        {
          pictograma: 'pictograma-proyectos',
          // ruta: `${ruta}/`,
          globo: '',
        },
        {
          pictograma: 'pictograma-archivo-subir',
          // ruta: `${ruta}/`,
          globo: '',
        },
        {
          pictograma: 'pictograma-ayuda',
          // ruta: `${ruta}/`,
          globo: '',
        },
      ]"
    />

    <div class="contenedor-contenido">
      <UiLayoutPaneles id="geocontenidos-paneles" :estado-colapable="colapsado">
        <template #catalogo>
          <nav class="menu-lateral">
            <div class="menu-lateral-contenedor">
              <h4 class="m-0 p-4">Menú</h4>

              <ul>
                <li
                  v-for="item in [
                    {
                      nombre: 'Mapas',
                      ruta: `${ruta}/mapas`,
                    },
                    {
                      nombre: 'Panoramas',
                      // ruta: '/geocontenidos/panoramas',
                    },
                    {
                      nombre: 'Geo-historias',
                      ruta: `${ruta}/geohistorias`,
                      // subMenu: [
                      //   {
                      //     nombre: 'Escenas',
                      //     ruta: '/geocontenidos/geohistorias/escenas',
                      //   },
                      // ],
                    },
                    {
                      nombre: 'Tableros de datos',
                      ruta: `${ruta}/tableros`,
                    },
                    {
                      nombre: 'Importar datos',
                      ruta: `${ruta}/importar-datos`,
                    },
                    {
                      nombre: 'Micrositios',
                      // ruta: '/geocontenidos/micrositios',
                    },
                  ]"
                  :key="item.nombre"
                >
                  <NuxtLink :to="item.ruta">{{ item.nombre }}</NuxtLink>

                  <!-- <ul v-if="item.subMenu">
                    <li v-for="subItem in item.subMenu" :key="subItem.nombre">
                      <NuxtLink>{{ subItem.nombre }}</NuxtLink>
                    </li>
                  </ul> -->
                </li>
              </ul>
            </div>
          </nav>
        </template>

        <template #visualizador>
          <NuxtPage />
        </template>
      </UiLayoutPaneles>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modulo-geocontenidos {
  // min-height: 100vh;
  &.flex {
    gap: 0;
  }
  .contenedor-contenido {
    flex: 1;
    // padding: 16px;
  }
}
</style>
