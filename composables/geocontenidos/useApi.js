import { valoresPorDefecto as valoresModal } from '~/components/geocontenidos/loaderModal.vue';

export default function () {
  const { gnoxyFetch } = useGnoxyUrl();
  const config = useRuntimeConfig();

  const modal = reactive({ ...valoresModal });

  return {
    api: async (endPoint, method = 'GET', body = {}) => {
      const parametros = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (method !== 'GET') {
        parametros.body = JSON.stringify(body);
      }

      const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/${endPoint}`, parametros);

      return { respuesta, datos: await respuesta.json() };
    },
    modal,
    mostrarModalCargando: (mensajeCargando = valoresModal.mensajeCargando) => {
      modal.cargando = true;
      modal.permitirCerrar = false;
      modal.mensajeCargando = mensajeCargando;
      modal.visible = true;
    },
    mostrarModalError: (errores) => {
      modal.cargando = false;
      modal.titulo = 'Error';
      modal.pictograma = 'cerrar';
      modal.mensaje = errores.join(` `);
      modal.permitirCerrar = true;
      modal.visible = true;
    },
    mostrarModalExito: (titulo = 'Guardado con éxito') => {
      modal.titulo = titulo;
      modal.cargando = false;
      modal.mensaje = '';
      modal.permitirCerrar = true;
      modal.visible = true;
    },
  };
}
