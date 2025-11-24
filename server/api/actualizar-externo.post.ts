const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const harvesterID = await readBody(event);
  const token = getHeader(event, 'token');
  const url = `${config.public.geonodeApi}/harvesters/${harvesterID}/`;
  let updateStatus = null;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'updating-harvestable-resources',
      }),
    });
    //console.log(response);
    updateStatus = response.ok;
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }

  return updateStatus;
});
