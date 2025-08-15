const configEnv = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = body.id;
  const baseUrl = configEnv.public.geonodeApi;
  const url = `${baseUrl}/resources/${id}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Error GET (${id}): ${response.status}`);
    }
    console.warn('response status:', response.status);
    const json = await response.json();
    return json.resource;
  } catch (error) {
    console.error('Error al obtener de GeoNode:', error);
  }
});
