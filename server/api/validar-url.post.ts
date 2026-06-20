export default defineEventHandler(async (event) => {
  const { url, serverType } = await readBody(event);

  const targetUrl =
    serverType === 'arcgis' ? `${url}?f=json` : `${url}?service=WMS&request=GetCapabilities`;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) return { isValid: false };

    if (serverType === 'arcgis') {
      const json = await response.json();
      return {
        isValid: json.capabilities?.includes('Map') || json.capabilities?.includes('Image'),
      };
    } else {
      const text = await response.text();
      return { isValid: text.includes('GetMap') };
    }
  } catch {
    return { isValid: false };
  }
});
