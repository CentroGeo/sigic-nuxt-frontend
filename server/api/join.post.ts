const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  const token = getHeader(event, 'token');
  const url = `${config.public.geonodeUrl}/sigic/georeference/join`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        layer: data.layer, // Tabla destino (sin geometría)
        geo_layer: data.geo_layer, // Capa fuente (con geometría)
        layer_pivot: data.layer_pivot, // Columna llave en destino
        geo_pivot: data.geo_pivot, // Columna llave en fuente
        columns: data.columns, // Columnas a copiar
      }),
    });
    console.warn('response: ', response);

    if (response.ok) {
      console.log('Join completado exitosamente');
      return { success: true, data: response };
    } else {
      console.error('Error en join:', response.status, response.statusText);
      return { success: false, error: { status: response.status } };
    }
  } catch (error) {
    console.error('Error de red: ', error);
    return { success: false, error: error };
  }
});
