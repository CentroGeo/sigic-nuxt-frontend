<script setup>
/**TODO: agregar método para traer la info del usuario al store */
import { buildUrl } from '~/utils/consulta';

const { data, status } = useAuth();
const estaLogueado = computed(() => status.value === 'authenticated');

const route = useRoute();

// const storeCatalogo = useCatalogoStore();
const esSuperusuario = ref(false);

onMounted(async () => {
  if (estaLogueado.value) {
    try {
      const configEnv = useRuntimeConfig();
      const { gnoxyFetch } = useGnoxyUrl();
      const userEmail = data.value?.user.email;
      const baseUrl = configEnv.public.geonodeApi;
      const queryParams = {
        page_size: 1,
        'filter{email}': userEmail,
      };

      // petición para traer solo el usuario que coincida con el parámetro email
      const url = buildUrl(`${baseUrl}/users`, queryParams);
      const request = await gnoxyFetch(url.toString());
      const res = await request.json();
      const userInfo = res.users;

      // almacenando en el store
      // storeCatalogo.userInfo = userInfo[0];
      // esSuperusuario.value = storeCatalogo.userInfo.is_superuser;
      esSuperusuario.value = userInfo[0].is_superuser;
    } catch (error) {
      console.error(error);
    }
  }
});
</script>
<template>
  <nav class="menu-lateral">
    <div class="menu-lateral-contenedor">
      <h4 class="m-0 p-4">Catálogo de información</h4>
      <ul class="lista-subpagina">
        <li>
          <nuxt-link to="/catalogo/explorar">Explorar</nuxt-link>
          <ul>
            <li>
              <nuxt-link to="/catalogo/explorar/capas">Capas geográficas</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/catalogo/explorar/tablas">Datos tabulados</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/catalogo/explorar/documentos">Documentos</nuxt-link>
            </li>
          </ul>
        </li>
      </ul>
      <ul v-if="estaLogueado" class="lista-sesion">
        <li>
          <nuxt-link
            :class="{
              ['router-link-active router-link-exact-active']:
                route.path.includes('/catalogo/mis-archivos/'),
            }"
            to="/catalogo/mis-archivos"
            >Mis archivos</nuxt-link
          >
        </li>
        <li>
          <nuxt-link to="/catalogo/cargar-archivos">Carga de archivos</nuxt-link>
        </li>
        <li>
          <nuxt-link to="/catalogo/servicios-remotos">Carga de catálogos externos</nuxt-link>
        </li>
        <li v-if="esSuperusuario">
          <nuxt-link
            :class="{
              ['router-link-active router-link-exact-active']: route.path.includes(
                '/catalogo/revision-solicitudes/'
              ),
            }"
            to="/catalogo/revision-solicitudes"
            >Revisión de solicitudes</nuxt-link
          >
        </li>
      </ul>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.menu-lateral .menu-lateral-contenedor {
  padding: 0;
  .lista-sesion {
    margin-top: 16px;
  }
}
</style>
