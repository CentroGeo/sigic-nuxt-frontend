<script setup>
definePageMeta({
  middleware: 'auth',
});

const { status, signOut } = useAuth();
const route = useRoute();
const router = useRouter();
async function cerrarSesion() {
  // Cierra sesión y redirige al inicio
  await signOut({ callbackUrl: '/' });
}

if (route.path === '/mi-cuenta') {
  router.push('/mi-cuenta/informacion-personal');
}
</script>

<template>
  <div class="contenedor ancho-lectura">
    <div class="flex flex-contenido-separado">
      <div class="flex"><h1>Mi Cuenta</h1></div>
      <div class="flex-vertical-centrado">
        <button
          v-if="status === 'authenticated'"
          aria-label="Cerrar sesión"
          type="button"
          class="boton-secundario m-t-3"
          @click="cerrarSesion"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
    <div class="un-menu">
      <div class="p-t-5 p-b-3">
        <div class="flex menu-mis-archivos">
          <NuxtLink to="/mi-cuenta/informacion-personal">Información personal</NuxtLink>
          <NuxtLink to="/mi-cuenta/produccion-colaboraciones">Producción y colaboraciones</NuxtLink>

          <NuxtLink to="/mi-cuenta/seguridad">Seguridad</NuxtLink>
        </div>
      </div>
    </div>
    <div>
      <NuxtPage />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-mis-archivos {
  border-bottom: var(--boton-secundario-deshabilitado-borde) 1px solid;
}
a {
  box-shadow: inherit;
  padding: inherit;
  padding: 16px 24px 16px 16px;
  position: relative;
  color: var(--texto-secundario);
  font-weight: 600;

  &.router-link-active.router-link-exact-active {
    &::after {
      content: '';
      position: absolute;
      left: calc(50% - 16px);
      top: calc(100% - 3px);
      width: 32px;
      height: 4px;
      padding-bottom: 4px;
      border-radius: 2px 2px 0px 0px;
      background-color: var(--boton-primario-borde);
      text-align: center;
      margin: -4px auto 0;
    }
  }
  &:hover,
  &:focus {
    background-color: var(--boton-secundario-cursor-fondo);
    // background-color: transparent;
  }
}
</style>
