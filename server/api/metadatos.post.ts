const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const token = getHeader(event, 'token');
  const type = getHeader(event, 'resourceType');
  const pk = getHeader(event, 'pk');

  const baseUrl = config.public.geonodeApi;
  const url = `${baseUrl}/${type}s/${pk}/`;

  const formData = new FormData();
  const metaFileds = Object.keys(body);
  metaFileds.forEach((field) => {
    if (Array.isArray(body[field])) {
      const objectKeys = Object.keys(body[field][0]);
      objectKeys.forEach((key) => {
        formData.append(`${field}[0][${key}]`, body[field][0][key]);
      });
    } else if (typeof body[field] === 'string') {
      formData.append(field, body[field]);
    } else {
      formData.append(field, JSON.stringify(body[field]));
    }
  });
  console.log(formData);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    console.log('La respuesta:', response);
    if (!response.ok) {
      //throw new Error(`Falló la edición de metadatos: ${response.status}`);
      return response.status;
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }
});
