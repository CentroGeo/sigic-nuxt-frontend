const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const requestBody = await readBody(event);
  const token = getHeader(event, 'token');
  const url = `${config.public.geonodeApi}/services/`;
  let responseStatus = undefined;
  let message = undefined;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    console.warn('La peticion:', response);
    const responseObject = await response.json();
    console.warn('La respuesta:', responseObject);

    if (!response.ok) {
      responseStatus = 'error';
      message = responseObject.url[0] ? responseObject.url[0] : 'Ocurrió un error';
    } else {
      responseStatus = 'success';
      message = 'Servicio registrado exitosamente';
    }
  } catch (error) {
    responseStatus = 'error';
    message = 'Ocurrió un error';
  }

  return { responseStatus, message };
});
