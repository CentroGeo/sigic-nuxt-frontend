const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const token = getHeader(event, 'token');
  const url = `${config.public.geonodeApi}/account/me/profile/`;

  try {
    const updateRequest = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!updateRequest.ok) {
      return 'error';
    } else {
      return 'ok';
    }
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
    return 'error';
  }
});
