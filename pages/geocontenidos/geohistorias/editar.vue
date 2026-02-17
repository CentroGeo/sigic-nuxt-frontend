<script setup>
const colorPrimario = ref('#000000');
const colorSecundario = ref('#ffffff');
const distribucionLayout = ref(50);
</script>

<template>
  <form @submit.prevent>
    <section>
      <div class="flex p-y-3">
        <NuxtLink to="/geocontenidos/geohistorias" class="boton boton-secundario boton-chico">
          <span class="pictograma-flecha-izquierda m-r-1" />
        </NuxtLink>

        <h2 class="m-0">Edición del escenario</h2>
      </div>

      <div class="m-b-4">
        <label for="nombre">Nombre de la historia</label>
        <input id="nombre" type="text" name="nombre" />
      </div>

      <div class="m-b-4">
        <label for="descripcion">Descripción (0 / 50)</label>
        <textarea id="descripcion" name="descripcion"></textarea>
      </div>

      <div class="m-b-4">
        <label for="posicion">Posición de la línea del tiempo</label>
        <select id="posicion" name="posicion">
          <option value="arriba">Arriba</option>
          <option value="abajo">Abajo</option>
        </select>
      </div>
    </section>

    <section>
      <h2>Colores del Tema</h2>

      <p>Personaliza los colores de la línea del tiempo</p>

      <div class="flex flex-contenido-separado m-b-2">
        <div>
          <label for="color-primario">Color primario</label>
          <input id="color-primario" v-model="colorPrimario" type="color" name="color-primario" />
        </div>

        <div>
          <label for="color-secundario">Color secundario</label>
          <input
            id="color-secundario"
            v-model="colorSecundario"
            type="color"
            name="color-secundario"
          />
        </div>
      </div>

      <label>Vista previa del gradiente</label>
      <div
        class="borde borde-color-secundario borde-redondeado-8 m-b-4"
        :style="{ background: `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})` }"
        style="height: 200px"
      />
    </section>

    <section>
      <h2>Distribución del layout</h2>

      <p>Ajusta el espacio que ocupará el panel de texto y el panel del mapa</p>

      <div>
        <label for="" class="flex flex-contenido-separado">
          <span>Panel de texto: {{ distribucionLayout }}%</span>
          <span>Panel del mapa: {{ 100 - distribucionLayout }}%</span>
        </label>
        <input v-model="distribucionLayout" type="range" min="20" max="80" />
      </div>

      <div class="m-b-4">
        <label>Vista previa de la distribución</label>
        <div class="flex texto-tamanio-10" style="height: 200px; gap: 0">
          <span
            class="pictograma-reporte borde borde-color-secundario borde-l-redondeado-8 borde-r-redondeado-0"
            :style="{ width: distribucionLayout + '%' }"
            style="align-items: center; justify-content: center"
          />
          <span
            class="pictograma-mexico borde borde-color-secundario borde-l-redondeado-0 borde-r-redondeado-8"
            style="flex: 1; align-items: center; justify-content: center"
          />
        </div>
      </div>
    </section>

    <section class="flex flex-contenido-final">
      <NuxtLink to="/geocontenidos/geohistorias" class="boton boton-secundario">
        Cancelar
      </NuxtLink>
      <button class="boton-primario">Guardar</button>
      <button class="boton-primario">Guardar y Editar escenas</button>
    </section>
  </form>
</template>
