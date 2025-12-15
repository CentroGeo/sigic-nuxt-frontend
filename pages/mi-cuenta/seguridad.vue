<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';

definePageMeta({
  middleware: 'auth',
});
</script>
<template>
  <div>
    <h2>Seguridad</h2>
    <div class="p-x-7 p-b-5">
      <h3>Cambiar contraseña</h3>
      <p>
        Elige una nueva contraseña para tu cuenta. Es posible que se cierre tu sesión en otros
        dispositivos.
      </p>
      <p>
        Usa al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y
        un símbolo.
      </p>
      <SisdaiCampoBase
        class="m-y-2"
        etiqueta="Contraseña actual"
        ejemplo="Introduce tu contraseña actual"
        tipo="password"
        :es_obligatorio="false"
        :es_etiqueta_visible="true"
      />
      <SisdaiCampoBase
        class="m-y-2"
        etiqueta="Contraseña nueva"
        ejemplo="Introduce la contraseña nueva"
        tipo="password"
        :es_obligatorio="false"
        :es_etiqueta_visible="true"
      />
      <button class="boton-primario boton-chico">
        Guardar cambios <span class="pictograma-guardar"></span>
      </button>

      <h4>Vincular cuentas</h4>
      <p>
        Puedes conectar tus cuentas para facilitar el inicio de sesión y mantener sincronizada tu
        información profesional.
      </p>
      <div class="tarjeta m-y-3">
        <div class="tarjeta-cuerpo">
          <div class="flex flex-contenido-separado">
            <div class="flex-vertical-centrado">Google</div>
            <div class="flex">
              <span
                class="flex flex-vertical-centrado texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion borde-redondeado-4 p-x-1"
                >Vinculada</span
              >
              <button class="boton-chico boton-secundario">Desvincular</button>
            </div>
          </div>
        </div>
      </div>
      <div class="tarjeta m-y-3">
        <div class="tarjeta-cuerpo">
          <div class="flex flex-contenido-separado">
            <div class="flex-vertical-centrado">Rizoma</div>
            <div class="flex">
              <span
                class="flex flex-vertical-centrado texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-4 p-x-1"
                >No vinculada</span
              >
              <button class="boton-chico boton-primario">Conectar</button>
            </div>
          </div>
        </div>
      </div>
      <div class="tarjeta m-y-3">
        <div class="tarjeta-cuerpo">
          <div class="flex flex-contenido-separado">
            <div class="flex-vertical-centrado">ORCID</div>
            <div class="flex">
              <span
                class="flex flex-vertical-centrado texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-4 p-x-1"
                >No vinculada</span
              >
              <button class="boton-chico boton-primario">Conectar</button>
            </div>
          </div>
        </div>
      </div>
      <div class="tarjeta m-y-3">
        <div class="tarjeta-cuerpo">
          <div class="flex flex-contenido-separado">
            <div class="flex-vertical-centrado">GitHub</div>
            <div class="flex">
              <span
                class="flex flex-vertical-centrado texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-4 p-x-1"
                >No vinculada</span
              >
              <button class="boton-chico boton-primario">Conectar</button>
            </div>
          </div>
        </div>
      </div>
      <div class="tarjeta m-y-3 fondo-color-informacion texto-color-informacion">
        <div class="tarjeta-cuerpo">
          <p class="nota-titulo texto-color-informacion">
            <span class="pictograma-informacion" /> Información sobre las cuentas vinculadas
          </p>

          <p class="nota texto-color-informacion">
            Si desvinculas alguna cuenta, podrás seguir accediendo con tu usuario y contraseña del
            SIGIC, sin embargo, dejarás de poder iniciar sesión con esa plataforma vinculada.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
