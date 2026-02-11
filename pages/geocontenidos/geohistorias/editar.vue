<script setup>
const distribucionLayout = ref(50);
</script>

<template>
  <form action="">
    <section>
      <h2>Edición de la historia</h2>

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
      <button class="boton-secundario">Cancelar</button>
      <button class="boton-primario">Guardar</button>
    </section>
  </form>
</template>
