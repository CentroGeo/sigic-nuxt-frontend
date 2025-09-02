import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const pathParam = getRouterParam(event, 'path');
  const filePath = Array.isArray(pathParam) ? pathParam.join('/') : pathParam;

  const session = await getServerSession(event);

  if (!session || !session.accessToken) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: 'No autorizado (sin token)' })
    );
  }

  const token = session.accessToken;
  const imageUrl = `${config.public.iaBackendUrl}direct/media/${filePath}`;

  const response = await fetch(imageUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return sendError(
      event,
      createError({ statusCode: response.status, statusMessage: 'Error cargando imagen' })
    );
  }

  const contentType = response.headers.get('Content-Type');
  event.node.res.setHeader('Content-Type', contentType || 'image/jpeg');

  const buffer = await response.arrayBuffer();
  return new Response(buffer);
});
