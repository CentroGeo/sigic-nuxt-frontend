export function useGnoxyUrl() {
  const config = useRuntimeConfig();

  function gnoxyUrl(inputUrl: string): string {
    if (!inputUrl) return '';

    const { geonodeUrl } = config.public;

    // Caso 1: URL empieza con geonodeUrl → traducir a gnoxy normal
    if (inputUrl.startsWith(geonodeUrl)) {
      return inputUrl.replace(geonodeUrl, `/api/gnoxy`);
    }

    // Caso 2: cualquier otra URL → usar gnoxy/proxy con encode
    return `/api/gnoxy/proxy/?url=${encodeURIComponent(inputUrl)}`;
  }

  return {
    gnoxyUrl,
    gnoxyFetch: (url: string) => {
      const event = useRequestEvent();

      const finalUrl = gnoxyUrl(url);

      // 🟢 SSR
      if (event) {
        const host = event.node.req.headers.host;
        const proto = event.node.req.headers['x-forwarded-proto'] || 'http';

        return fetch(`${proto}://${host}${finalUrl}`);
      }

      // 🔵 CLIENTE
      return fetch(finalUrl);
    },
  };
}
