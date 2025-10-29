<script setup>
defineProps({
  titulo: { type: String, default: '' },
  rol: { type: String, default: '' },
  medio: { type: String, default: '' },
  anio_periodo: { type: String, default: '' },
  instituciones: { type: String, default: '' },

  enlace: { type: String, default: '' },
});
</script>
<template>
  <div class="tarjeta m-y-4">
    <div class="tarjeta-cuerpo">
      <div class="flex flex-contenido-final">
        <button class="boton-pictograma boton-secundario" aria-label="Editar " type="button">
          <span class="pictograma-editar"></span></button
        ><button class="boton-pictograma boton-secundario" aria-label="Remover" type="button">
          <span class="pictograma-eliminar"></span>
        </button>
      </div>
      <p><span class="texto-color-secundario">Título</span> <br />{{ titulo }}</p>
      <div class="flex">
        <div class="columna-8">
          <p v-if="medio" class="m-y-0">
            <span class="texto-color-secundario">Revista/Media</span> <br />{{ medio }}
          </p>
          <p v-if="rol" class="m-y-0">
            <span class="texto-color-secundario">Rol o tipo de participación</span> <br />{{ rol }}
          </p>
        </div>
        <div class="columna-8">
          <p class="m-y-0">
            <span class="texto-color-secundario">Año o periodo</span> <br />{{ anio_periodo }}
          </p>
        </div>
      </div>
      <p v-if="instituciones" class="m-y-0">
        <span class="texto-color-secundario">Instituciones participantes</span> <br />
        {{ instituciones }}
      </p>
      <p class="m-y-0">
        <span class="texto-color-secundario">Enlace</span> <br />
        <a :href="enlace" target="_blank">{{ enlace }}</a>
      </p>
    </div>
  </div>
</template>
