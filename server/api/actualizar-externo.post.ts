const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  const harvesterID = data.id;
  const newStatus = data.status;
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
        status: `${newStatus}`,
      }),
    });
    //console.log(response);
    updateStatus = response.ok;
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
  }

  return updateStatus;
});
