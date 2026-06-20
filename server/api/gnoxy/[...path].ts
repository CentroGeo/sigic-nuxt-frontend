import { defineEventHandler, proxyRequest, getQuery } from 'h3';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const rawPath = event.context.params?.path;
  const pathWithoutSlash = Array.isArray(rawPath) ? rawPath.join('/') : rawPath || '';
  // h3 strips the trailing slash from catch-all params; restore it from the original URL
  const originalUrl = event.node.req.url || '';
  const trailingSlash = originalUrl.endsWith('/') || originalUrl.includes('/?') ? '/' : '';
  const path = pathWithoutSlash.endsWith('/') ? pathWithoutSlash : pathWithoutSlash + trailingSlash;
  const query = getQuery(event);

  const session = await getServerSession(event);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const token = (session as any)?.accessToken;

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

  // const headers = Object.fromEntries(event.headers) as Record<string, string>;
  // delete headers.cookie;
  // delete headers.host;

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Evitar que el browser muestre el diálogo de autenticación básica
  // cuando el backend responde 401 con WWW-Authenticate: Basic.
  // proxyRequest llama a res.setHeader internamente, así que lo interceptamos
  // antes de que escriba los headers.
  const res = event.node.res;
  const origSetHeader = res.setHeader.bind(res);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (res as any).setHeader = (name: string, value: unknown) => {
    if (String(name).toLowerCase() === 'www-authenticate') return res;
    return origSetHeader(name, value as any);
  };

  return proxyRequest(event, url, { headers });
});
