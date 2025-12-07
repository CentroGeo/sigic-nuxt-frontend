const configEnv = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const pk = body.pk;
  const baseUrl = configEnv.public.geonodeUrl;
  const headers = { Authorization: `Bearer ${body.token}`, 'Content-Type': 'application/json' };

  try {
    const response = await fetch(`${baseUrl}/sigic/requests/${pk}`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({ status: body.status, rejection_reason: body.rejection_reason }),
    });
    // console.log('response', response)

    if (!response.ok) {
      throw new Error(`Error PATCH (${pk}): ${response.status}`);
    }
    console.warn('response status:', response.status);

    const json = await response.json();

    return json;
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }
});
