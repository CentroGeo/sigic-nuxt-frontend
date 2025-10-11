const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const token = getHeader(event, 'token');
  const type = getHeader(event, 'resourceType');
  const pk = getHeader(event, 'pk');

  const baseUrl = config.public.geonodeApi;
  const url = `${baseUrl}/${type}s/${pk}/`;

  const formData = new FormData();
  console.log('El body:', body);
  const metaFileds = Object.keys(body);
  console.log('Los campos:', metaFileds);
  metaFileds.forEach((field) => {
    if (typeof body[field] === 'string') {
      console.log(field, 'Es string');
      formData.append(field, body[field]);
    } else {
      console.log(field, 'No es string');
      formData.append(field, JSON.stringify(body[field]));
    }
  });

  /*   formData.append("attribute_set", JSON.stringify({
      "15": {
        "description": "Clave numerica que indica un municipio",
        "attribute_label": "Clave Municipal",
        "display_order": 6,
        "visible": 'True'
      }
    }));
    formData.append('title', "Laboratorios de investigación")
    formData.append('abstract', "Prueba de llenado del abstract") */

  //console.log("La forma:", formData)
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
      throw new Error(`Falló la edición de metadatos: ${response.status}`);
    }
    console.warn('response status:', response.status);

    const json = await response.json();
    // console.warn("json:", json);

    return json;
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }
});
