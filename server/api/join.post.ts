const configEnv = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const baseUrl = configEnv.public.geonodeApi;
  const url = `${baseUrl}/sigic/georeference/join`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${body.token}`,
      },
      body: JSON.stringify({
        layer: body.layer,
        geo_layer: body.geo_layer,
        layer_pivot: body.layer_pivot,
        geo_pivot: body.geo_pivot,
        columns: body.columns,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error POST (id}): ${response.status}`);
    }
    console.warn('response: ', response);

    const json = await response.json();
    // console.warn("json:", json);

    return json;
  } catch (error) {
    console.error('Error al subir al Join:', error);
  }
});
