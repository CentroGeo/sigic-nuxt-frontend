<script setup></script>

<template>
  <main class="contenedor">
    <h1>Configuración del superusuario</h1>

    <hr />

    <h2>Límite de capas no aprobadas por usuario</h2>

    <div class="usuarios">
      <table class="tabla-usuarios">
        <thead>
          <tr>
            <th>Nombre completo</th>
            <th>Límite de capas privadas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Andrés Martínez</td>
            <td>
              <input type="number" min="0" step="1" value="0" />
            </td>
          </tr>
        </tbody>
      </table>

      <button class="boton-primario m-t-3" type="submit">Guardar cambios</button>
    </div>

    <hr />

    <h2>Configuración</h2>

    <div class="vista-mapa">
      <form class="form-extend-mapa">
        <fieldset>
          <legend>Editar extend del mapa</legend>

          <div class="campo-extend">
            <label for="xmin">Xmin</label>
            <input id="xmin" name="xmin" type="number" step="any" placeholder="Xmin" />
          </div>

          <div class="campo-extend">
            <label for="ymin">Ymin</label>
            <input id="ymin" name="ymin" type="number" step="any" placeholder="Ymin" />
          </div>

          <div class="campo-extend">
            <label for="xmax">Xmax</label>
            <input id="xmax" name="xmax" type="number" step="any" placeholder="Xmax" />
          </div>

          <div class="campo-extend">
            <label for="ymax">Ymax</label>
            <input id="ymax" name="ymax" type="number" step="any" placeholder="Ymax" />
          </div>

          <button class="boton-primario m-t-3" type="submit">Guardar extend</button>
        </fieldset>
      </form>
    </div>
  </main>
</template>
