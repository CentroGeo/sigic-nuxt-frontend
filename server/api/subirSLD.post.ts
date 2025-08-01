export default defineEventHandler(async (event) => {
  try {
    const files = await readMultipartFormData(event);
    // imprime los archivos del lado del servidor
    console.log(files);
    if (!files) {
      return createError({ statusCode: 400, statusMessage: 'Los archivos están vacíos' });
    }
    // TODO: subir files sld al backend
    for (const file of files) {
      // TODO: remover useStorage cuando se conecte al backend
      await useStorage().setItemRaw(`fs:${file.filename}`, file.data);
    }
    return 200;
  } catch (error) {
    return createError({ statusCode: 500, statusMessage: `Algo salió mal con tu api: ${error}` });
  }
});
