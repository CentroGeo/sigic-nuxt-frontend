const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const token = getHeader(event, 'token');
  const type = getHeader(event, 'resourceType');
  const pk = getHeader(event, 'pk');

  const baseUrl = config.public.geonodeApi;
  const url = `${baseUrl}/${type}s/${pk}/`;
  const keywordsUrl = `${baseUrl}/resources/${pk}/keywordtags/replace/`;

  let total = 0;
  let keywordsBody: string[] = [];
  const contactsBody = { metadata_author: [] };
  const formData = new FormData();
  const metaFileds = Object.keys(body);
  metaFileds.forEach((field) => {
    /* if (Array.isArray(body[field])) {
      const objectKeys = Object.keys(body[field][0]);
      objectKeys.forEach((key) => {
        formData.append(`${field}[0][${key}]`, body[field][0][key]);
      });
    } */
    if (field === 'metadata_author') {
      contactsBody['metadata_author'] = body[field];
    } else if (field === 'keywords') {
      keywordsBody = body[field];
    } else if (typeof body[field] === 'string') {
      formData.append(field, body[field]);
    } else {
      formData.append(field, JSON.stringify(body[field]));
    }
  });

  // Actualizamos keywords
  try {
    const keywordsResponse = await fetch(keywordsUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(keywordsBody),
    });

    console.log('La respuesta keywords:', keywordsResponse);
    if (!keywordsResponse.ok) {
      console.error('Keywords', keywordsResponse);
    } else {
      total += 1;
    }
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }

  // Actualizamos metadata_author
  try {
    const contactsResponse = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactsBody),
    });
    //console.log('La respuesta:', contactsResponse);
    if (!contactsResponse.ok) {
      console.error('Contactos', contactsResponse);
    } else {
      total += 1;
    }
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }

  // Actualizamos el resto de los metadatos
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    //console.log('La respuesta:', response);
    if (!response.ok) {
      console.error('General:', response);
    } else {
      total += 1;
    }
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }

  return total;
});
