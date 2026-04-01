const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  const token = getHeader(event, 'token');
  const url = `${config.public.geonodeUrl}/sigic/requests/`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resource_pk: data.resource_pk, // id del recurso a solicitud
      }),
    });
    console.warn('response: ', response);

    if (response.ok) {
      console.log('Request completada exitosamente');
      return { success: true, ok: response };
    } else {
      console.error('Error en request:', response.status, response.statusText);
      return { success: false, error: { status: response.status } };
    }
  } catch (error) {
    console.error('Error de red: ', error);
    return { success: false, error: error };
  }
});
