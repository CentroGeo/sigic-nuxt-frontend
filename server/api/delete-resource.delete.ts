const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'token');
  const pk = getHeader(event, 'pk');
  const baseUrl = config.public.geonodeApi;
  const url = `${baseUrl}/resources/${pk}/`;
  //console.log(url)

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    //console.warn(response)
    //console.log('La respuesta:', response);
    if (!response.ok) {
      throw new Error(`Falló el borrar un recurso: ${response.status}`);
    }
    //const status = response.ok;
    return response.ok;
  } catch (error) {
    console.error('Error al borrar un recurso:', error);
    return false;
  }
});
