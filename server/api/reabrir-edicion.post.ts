const configEnv = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const baseUrl = configEnv.public.geonodeUrl;
  const headers = {
    Authorization: `Bearer ${body.token}`,
    'Content-Type': 'application/json',
  };
  try {
    const response = await fetch(`${baseUrl}/sigic/requests/reopen`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ resource_pk: body.resource_pk }),
    });
    if (!response.ok) {
      return 'Error';
    }
    return await response.json();
  } catch (error) {
    console.error('Error al reabrir la edición:', error);
    return 'Error';
  }
});
