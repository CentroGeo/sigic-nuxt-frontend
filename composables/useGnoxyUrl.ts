export function useGnoxyUrl() {
  const config = useRuntimeConfig();

  function gnoxyUrl(inputUrl: string): string {
    if (!inputUrl) return '';
    const { geonodeUrl, baseURL } = config.public;

    // Caso 1: URL empieza con geonodeUrl → traducir a gnoxy normal
    if (inputUrl.startsWith(geonodeUrl)) {
      return inputUrl.replace(geonodeUrl, `${baseURL}/api/gnoxy`);
    }

    // Caso 2: cualquier otra URL → usar gnoxy/proxy con encode
    return `${baseURL}/api/gnoxy/proxy/?url=${encodeURIComponent(inputUrl)}`;
  }

  return {
    gnoxyUrl,
  };
}
