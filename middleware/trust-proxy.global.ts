import { defineEventHandler, getHeader } from 'h3';

export default defineEventHandler((event) => {
  // Solo ejecuta del lado del servidor (Nitro)
  if (!event.node || !event.node.req) return;

  try {
    const xfp = getHeader(event, 'x-forwarded-proto');
    const xfh = getHeader(event, 'x-forwarded-host');

    if (xfp || xfh) {
      event.node.req.headers['x-forwarded-proto'] = xfp || 'https';
      event.node.req.headers['x-forwarded-host'] = xfh || event.node.req.headers.host;
      event.node.req.headers['x-forwarded-prefix'] =
        event.node.req.headers['x-forwarded-prefix'] || '';
      if (process.dev) console.log('[nitro] trust proxy headers applied');
    }
  } catch (err) {
    if (process.dev) console.warn('[nitro] trust proxy failed:', err);
  }
});
