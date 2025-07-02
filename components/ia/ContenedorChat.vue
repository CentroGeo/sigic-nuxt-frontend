<template>
  <div class="contenedor ancho-lectura">
    <p>Chat SIGIC</p>

    <div>showChatBar showDateIncorrect chatLog showChatLoader</div>

    <div>
      <form @submit.prevent>
        <label for="area-idcreadoautomaticamente" class="a11y-solo-lectura">
          Nombre de la etiqueta
        </label>

        <textarea
          id="area-idcreadoautomaticamente"
          placeholder="Envía un mensaje"
        />
        <button
          class="boton-pictograma boton-con-contenedor-primario"
          aria-label="Enviar mensaje"
          type="button"
        >
          <span class="pictograma-flecha-arriba" aria-hidden="true" />
        </button>
      </form>
    </div>
  </div>
</template>
