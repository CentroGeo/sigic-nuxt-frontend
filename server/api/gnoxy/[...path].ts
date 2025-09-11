import { defineEventHandler, proxyRequest, getQuery } from 'h3';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const rawPath = event.context.params?.path;
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath || '';
  const query = getQuery(event);

  // 🔹 Caso especial: /api/gnoxy/proxy/?url=...
  if (path === 'proxy' && query.url) {
    const targetUrl = String(query.url);

    // 🚨 Aquí no tocamos nada de cabeceras, las reenviamos tal cual vienen
    const headers = Object.fromEntries(event.headers) as Record<string, string>;

    return proxyRequest(event, targetUrl, { headers });
  }

  // 🔹 Flujo normal que ya tenías funcionando
  const backendBase = process.env.NUXT_PUBLIC_GEONODE_URL || 'https://geonode.dev.geoint.mx';
  const url = `${backendBase}/${path}${
    /* eslint-disable @typescript-eslint/no-explicit-any */
    Object.keys(query).length ? '?' + new URLSearchParams(query as any).toString() : ''
  }`;

  const session = await getServerSession(event);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const token = (session as any)?.accessToken;

  const headers = Object.fromEntries(event.headers) as Record<string, string>;
  delete headers.cookie;
  delete headers.host;

  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  return proxyRequest(event, url, { headers });
});
