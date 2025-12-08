import { defineStore } from 'pinia';
import { buildUrl } from '~/utils/consulta';

export const useCatalogoStore = defineStore('catalogo', () => {
  const config = useRuntimeConfig();
  const { data, status } = useAuth();
  const userEmail = data.value?.user.email;
  const estaLogueado = computed(() => status.value === 'authenticated');

  // la información del usuario activo
  // const userInfo = reactive({});

  return {
    previousPath: ref(''),
    catalogoColapsado: ref(false),
    idNavegacionLateral: 'navegacionlateral-' + Math.random().toString(36).substring(2),
    // userInfo,
    userInfo: reactive({}),

    alternarCatalogoColapsable() {
      this.catalogoColapsado = !this.catalogoColapsado;
    },

    async getUserInfo() {
      if (estaLogueado.value) {
        const { gnoxyFetch } = useGnoxyUrl();
        const queryParams = {
          page_size: 1,
          'filter{email}': userEmail,
        };

        const url = buildUrl(`${config.public.geonodeApi}/users`, queryParams);
        const request = await gnoxyFetch(url.toString());
        const res = await request.json();
        this.userInfo = res.users[0];
      }
    },
  };
});
