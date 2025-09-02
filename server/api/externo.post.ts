export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const url = 'https://geonode.dev.geoint.mx/services/register';

  const formData = new FormData();
  formData.append('url', body.url);
  formData.append('type', body.type);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${body.token}`,
      },
      body: formData,
    });
    // .then(response => console.log(response))

    if (!response.ok) {
      throw new Error(`Error POST servicio externo (${body.type}): ${response.status}`);
    }
    console.warn('response status:', response.status);

    const json = await response.json();

    // return { body }
    return json;
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }
});
