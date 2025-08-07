const configEnv = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    const files = await readMultipartFormData(event)
    console.log('files', files) // imprime los archivos del lado del servidor

    if (!files) {
      return createError({ statusCode: 400, statusMessage: 'Los archivos están vacíos' })
    }
    const formData = new FormData();
    // almacenálo en mediante el useStorage en la carpeta /public
    for (const file of files) {
      // await useStorage().setItemRaw(`fs:${file.filename}`, file.data)
      console.log('file.data', file.data)
    }

    const res = await fetch(`${configEnv.public.geonodeApi}/upload/uploads/upload`, {
      // const res = await fetch("http://10.2.102.239/upload/uploads/upload", {
      method: "POST",
      headers: {
        // TODO: pasar el token
        // Authorization: `Bearer ${data.fields.token[0]}`,
        // "X-Requested-With": "XMLHttpRequest",
      },
      // credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Upload falló: ${res.status}`);
    }
    console.log("response status:", res.status);
    const json = await res.json();
    console.log("json:", json);
    return json;

    // return 200
  } catch (error) {
    console.error("Error al subir al GeoNode:", error);
    throw createError({ statusCode: 500, statusMessage: 'Error al subir al GeoNode', data: error });
  }
})