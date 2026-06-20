import { getServerSession } from '#auth';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const requestBody = await readBody(event);

  const session = await getServerSession(event);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const token = (session as any)?.accessToken;

  if (!token) {
    return { responseStatus: 'error', message: 'No autenticado' };
  }

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
      console.warn('GeoNode error response:', JSON.stringify(responseObject));
      message =
        responseObject?.url?.[0] ||
        responseObject?.errors?.[0] ||
        responseObject?.detail ||
        responseObject?.message ||
        (typeof responseObject === 'string' ? responseObject : null) ||
        `Error ${response.status}: ${response.statusText}`;
    } else {
      responseStatus = 'success';
      message = 'Servicio registrado exitosamente';
    }
  } catch (error) {
    responseStatus = 'error';
    console.warn('registrar-servicio fetch error:', error);
    message = error instanceof Error ? error.message : 'Ocurrió un error';
  }

  return { responseStatus, message };
});
