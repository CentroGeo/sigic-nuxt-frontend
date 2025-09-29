import { defineEventHandler, proxyRequest, getQuery } from 'h3';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const rawPath = event.context.params?.path;
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath || '';
  const query = getQuery(event);

  // Caso especial: /api/gnoxy/proxy/?url=...
  if (path === 'proxy' && query.url) {
    const targetUrl = String(query.url);
    const headers = Object.fromEntries(event.headers) as Record<string, string>;

    return proxyRequest(event, targetUrl, { headers });
  }

  // Flujo normal
  const backendBase = process.env.NUXT_PUBLIC_GEONODE_URL || 'https://geonode.dev.geoint.mx';

  // Construcción manual de query params preservando repetidos
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else if (value !== undefined) {
      params.append(key, String(value));
    }
  });

  const url = `${backendBase}/${path}${params.toString() ? '?' + params.toString() : ''}`;

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
