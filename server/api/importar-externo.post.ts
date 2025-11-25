const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  const token = getHeader(event, 'token');
  const harvesterID = data.harvesterID;
  const resources = data.resources;
  //console.error(token)
  //console.log(harvesterID)
  console.warn(resources);
  const url = `${config.public.geonodeApi}/harvesters/${harvesterID}/harvestable-resources/`;
  let updateStatus = null;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resources),
    });
    //console.log(response);
    updateStatus = response.ok;
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }

  return updateStatus;
});
