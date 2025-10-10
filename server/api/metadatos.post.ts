const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const token = getHeader(event, 'token');
  const type = getHeader(event, 'resourceType');
  const pk = getHeader(event, 'pk');

  const baseUrl = config.public.geonodeApi;
  const url = `${baseUrl}/${type}s/${pk}/`;
  console.log(url);
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    /*body: JSON.stringify({
     title: "Probando un cambio sencillo",
     attribute_set: { "10": { "description": "Descripción", "attribute_label": "Prueba", "visible": true, "display_order": 1 } }
   }), */

    if (!response.ok) {
      throw new Error(`Error PATCH (${2}): ${response.status}`);
    }
    console.warn('response status:', response.status);

    const json = await response.json();
    // console.warn("json:", json);

    return json;
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }
});
