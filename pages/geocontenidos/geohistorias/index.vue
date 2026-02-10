<template>
  <div>
    <div>
      <NuxtLink to="/geocontenidos/geohistorias/editar" class="boton boton-primario m-y-3">
        <span class="pictograma-agregar m-r-1" />
        Crear geo-historia
      </NuxtLink>
    </div>

    <div class="grid reticula-12">
      <div v-for="_ in [1, 2, 3]" :key="_" class="columna-8 columna-4-esc">
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
  </div>
</template>

<style lang="scss" scoped>
.modulo-geocontenidos .contenedor {
  .grid.reticula-12 {
    grid-template-columns: repeat(12, 1fr);
  }
  .tarjeta {
    &-cuerpo {
      background-color: var(--color-primario-4);
      color: var(--texto-inverso);
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
