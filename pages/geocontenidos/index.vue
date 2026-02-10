<script setup>
const menu = [
  {
    nombre: 'Mapas',
    ruta: '/geocontenidos/mapas',
  },
  {
    nombre: 'Panoramas',
    ruta: '/geocontenidos/panoramas',
  },
  {
    nombre: 'Geo-historias',
    ruta: '/geocontenidos/geohistorias',
    // subMenu: [
    //   {
    //     nombre: 'Escenas',
    //     ruta: '/geocontenidos/geohistorias/escenas',
    //   },
    // ],
  },
  {
    nombre: 'Tableros de datos',
    ruta: '/geocontenidos/tableros-datos',
  },
  {
    nombre: 'Micrositios',
    ruta: '/geocontenidos/micrositios',
  },
];
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <nav class="menu-lateral">
        <div class="menu-lateral-contenedor">
          <h4 class="m-0 p-4">Menú</h4>

          <ul>
            <li v-for="item in menu" :key="item.nombre">
              <NuxtLink>{{ item.nombre }}</NuxtLink>

              <ul v-if="item.subMenu">
                <li v-for="subItem in item.subMenu" :key="subItem.nombre">
                  <NuxtLink>{{ subItem.nombre }}</NuxtLink>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor">
        <h1>Geo-historias</h1>

        <div>
          <button class="boton boton-primario m-y-3">
            <span class="pictograma-agregar m-r-1" />
            Crear geo-historia
          </button>
        </div>

        <div class="flex">
          <div v-for="_ in [1, 2]" :key="_" class="columna-8 columna-8-esc">
            <div class="tarjeta">
              <div class="tarjeta-cuerpo">
                <p class="tarjeta-titulo">Nombre de la geo-historia</p>

                <p class="tarjeta-etiqueta">Creado: xx de xxxxxxx de 202x</p>
              </div>

              <div class="tarjeta-pie flex">
                <button class="boton boton-chico boton-secundario m-t-3">
                  <span class="pictograma-ojo-ver m-r-1" />
                  Ver escenario
                </button>
                <button class="boton boton-chico boton-secundario">
                  <span class="pictograma-editar m-r-1" />
                  Editar escenario
                </button>
                <button class="boton boton-chico boton-secundario">
                  <span class="pictograma-editar m-r-1" />
                  Editar escenas
                </button>
                <button class="boton boton-chico boton-secundario">
                  <span class="pictograma-agregar m-r-1" />
                  Crear escena
                </button>
                <button class="boton boton-chico boton-primario">
                  <span class="pictograma-eliminar m-r-1" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss" scoped>
.contenedor {
  .tarjeta {
    &-cuerpo {
      background-color: var(--fondo-primario);
    }
    &-pie {
      flex-direction: column;
      button {
        display: block;
      }
    }
  }
}
</style>
