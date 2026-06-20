import { getServerSession } from '#auth';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { serviceId } = await readBody(event);

  const session = await getServerSession(event);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const token = (session as any)?.accessToken;

  if (!token) {
    return { success: false, message: 'No autenticado' };
  }

  try {
    const response = await fetch(
      `${config.public.geonodeApi}/services/${serviceId}/retry-harvesting/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.error || `Error ${response.status}` };
    }
    return { success: true, ...data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
});
