const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const requestBody = await readBody(event);
  const token = getHeader(event, 'token');
  const url = `${config.public.geonodeApi}/harvesters/`;
  let responseStatus = undefined;
  let responseObject = {};

  const actualBody = {
    name: requestBody.name,
    remote_url: requestBody.url,
    scheduling_enabled: false,
    harvester_type: requestBody.type,
    harvester_type_specific_configuration: {},
    harvest_new_resources_by_default: false,
    delete_orphan_resources_automatically: true,
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(actualBody),
    });
    console.log(response);
    responseStatus = response.ok;
    if (!response.ok) {
      //throw new Error(`Error POST servicio externo (${body.type}): ${response.status}`);
      responseObject = {};
    } else {
      responseObject = await response.json();
    }
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }

  return { responseStatus, responseObject };
});
