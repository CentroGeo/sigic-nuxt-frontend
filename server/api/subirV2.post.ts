export default defineEventHandler(async (event) => {
  try {
    const files = await readMultipartFormData(event)
    // imprime los archivos del lado del servidor
    console.log(files)
    if (!files) {
      return createError({ statusCode: 400, statusMessage: 'Los archivos están vacíos' })
    }

    for (const file of files) {
      // TODO: remover useStorage cuando se conecte al backend
      await useStorage().setItemRaw(`fs:${file.filename}`, file.data)
    }

    // TODO: subir files sld al backend
    //// const res = await fetch(`${configEnv.public.geonodeApi}/uploads/upload/`, {
    // const response = await fetch("http://10.2.102.99/upload/uploads/upload", {
    //   headers: {
    //     "Authorization": `Bearer ${data.fields.token[0]}`,
    //     "accept": "*/*",
    //     "accept-language": "en-US,en;q=0.9",
    //     "content-type": "multipart/form-data; boundary=----WebkitFormBoundaryb6Ed1YzAuqRpzbdL",
    //     "x-csrftoken": "7FPk21mZjOhvU63jeaRt0TSDvscOL0kv",
    //     "x-requested-with": "XMLHttpRequest"
    //   },
    //   referrer: "http://10.2.102.99/datasets/geonode:coordinaciones/style_upload",
    //   body: "filename=\"simple_green-point.sld\"",
    //   method: "POST",
    //   mode: "cors",
    //   credentials: "include"
    // })
    // console.log("response.status:", response.status);
    // if (!response.ok) {
    //   throw new Error(`Error ${response.status}:`)
    // }
    // const { dataset } = await response.json();
    // const json = await response.json();
    // console.log("json:", json);
    // // return json;
    // return {
    //   html: dataset.raw_abstract,
    //   text: dataset.abstract
    // }

    return 200
  } catch (error) {
    return createError({ statusCode: 500, statusMessage: 'Algo salió mal con tu api' })
  }
})