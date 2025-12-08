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
  const bodyDict = {
    title: null,
    abstract: 'Información pendiente.',
    date_type: null,
    date: null,
    category: null,
    metadata_author: [],
    languaje: null,
    license: null,
    attribution: 'No especificado.',
    data_quality_statement: 'Calidad no evaluada.',
    restriction_code_type: null,
    constraints_other: 'Ninguna',
    edition: '1.0',
    doi: '-',
    purpose: 'Propósito original no documentado',
    supplemental_information: 'No especificada',
    maintenance_frequency: 'unknown',
    attribute_set: {},
  };

  const metaFileds = Object.keys(body);
  metaFileds.forEach((field) => {
    if (field === 'attribute_set') {
      bodyDict[field] = JSON.stringify(body[field]);
    } else if (Object.keys(bodyDict).includes(field)) {
      bodyDict[field] = body[field];
    } else if (field === 'keywords') {
      keywordsBody = body[field];
    }
  });

  //console.warn(formData)
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

    //console.log('La respuesta keywords:', keywordsResponse);
    if (!keywordsResponse.ok) {
      console.error('Keywords', keywordsResponse);
    } else {
      total += 1;
    }
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }

  // Actualizamos el resto de los metadatos
  try {
    const contactsResponse = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyDict),
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

  return total;
});
