<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';

definePageMeta({
  middleware: 'auth',
});
</script>
<template>
  <div>
    <h2>Seguridad</h2>
    <div class="p-x-7">
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
        :es_obligatorio="false"
        :es_etiqueta_visible="true"
      />
      <SisdaiCampoBase
        class="m-y-2"
        etiqueta="Contraseña nueva"
        ejemplo="Introduce la contraseña nueva"
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
    </div>
  </div>
</template>
