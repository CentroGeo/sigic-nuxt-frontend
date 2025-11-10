<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const permisos = [
  {
    value: 'administrar',
    label: 'Administrar',
    description: 'Control total del proyecto, gestión de usuarios y configuración',
  },
  {
    value: 'revisar',
    label: 'Revisar',
    description: 'Puede revisar, comentar y aprobar cambios en el proyecto',
  },
  {
    value: 'participar',
    label: 'Participar',
    description: 'Puede contribuir activamente con aportes de información',
  },
  {
    value: 'ver',
    label: 'Solo ver',
    description: 'Solo puede visualizar el contenido sin realizar cambios',
  },
];

const usuariosAsignados = [
  { email: 'persona_usuaria@centrogeo.edu.mx', permiso: 'Revisar', fecha: '17/10/2025' },
  { email: 'persona_usuaria@centrogeo.edu.mx', permiso: 'Administrar', fecha: '17/10/2025' },
  { email: 'persona_usuaria@centrogeo.edu.mx', permiso: 'Participar', fecha: '17/10/2025' },
  { email: 'persona_usuaria@centrogeo.edu.mx', permiso: 'Solo ver', fecha: '17/10/2025' },
];
</script>

<template>
  <div class="columna-10">
    <h6>Gestión de permisos</h6>
    <p>Asigna los niveles de acceso y edición de cada persona usuaria en el proyecto.</p>
    <div class="grid m-b-3">
      <template v-for="permiso in permisos" :key="permiso.value">
        <div class="columna-4 permiso-container p-2 borde-redondeado-8 fondo-color-neutro">
          <span class="m-b-minimo texto-tamanio-3">{{ permiso.label }}</span>
          <span class="texto-tamanio-2">{{ permiso.description }}</span>
        </div>
      </template>
    </div>
    <div class="fondo-color-neutro borde-redondeado-20 p-3">
      <div class="texto-tamanio-3 m-b-3">Asignar permiso</div>
      <div class="flex">
        <ClientOnly>
          <div class="permisos-input">
            <SisdaiCampoBase
              etiqueta="Correo electrónico"
              ejemplo="Ingresa un correo electrónico"
            />
          </div>
          <div class="permisos-input">
            <SisdaiSelector etiqueta="Permiso">
              <option value="1">Administrar</option>
              <option value="2">Revisar</option>
              <option value="3">Participar</option>
              <option value="4">Solo ver</option>
            </SisdaiSelector>
          </div>
        </ClientOnly>
        <button class="boton-primario boton boton-chico boton-permiso">Asignar permiso</button>
      </div>
    </div>
    <div>
      <h6>Personas usuarias con permisos asignados</h6>
      <div class="flex usuarios-asignados">
        <div
          v-for="usuario in usuariosAsignados"
          :key="usuario.email"
          class="correo-participante borde-redondeado-8 fondo-color-acento p-2 flex flex-contenido-separado"
        >
          <div>
            <div class="m-b-minimo texto-tamanio-3 asignado-email">{{ usuario.email }}</div>
            <div class="flex">
              <span
                class="p-x-1 p-y-minimo borde borde-color-acento borde-redondeado-8 texto-color-secundario"
                >{{ usuario.permiso }}</span
              >
              <span class="asignado-fecha texto-tamanio-2">Asignado el {{ usuario.fecha }}</span>
            </div>
          </div>
          <div class="flex">
            <button class="boton-secundario boton boton-chico">Cambiar permiso</button>
            <button class="boton-secundario boton boton-chico">Eliminar</button>
          </div>
          <!-- {{ participante }}
          <button
            class="boton-pictograma boton-sin-contenedor-primario"
            aria-label="Acción a realizar"
            type="button"
          >
            <span class="pictograma-cerrar" aria-hidden="true" />
          </button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.permiso-container {
  display: flex;
  flex-direction: column;

  .texto-tamanio-3 {
    font-weight: 500;
  }

  .texto-tamanio-2 {
    font-weight: 400;
  }
}

.permisos-input {
  flex: 1;
}

.boton-permiso {
  align-self: flex-end;
}

.usuarios-asignados {
  flex-direction: column;

  button {
    align-self: center;
  }
}

.asignado-email {
  font-weight: 500;
}

.asignado-fecha {
  align-self: flex-end;
}
</style>
