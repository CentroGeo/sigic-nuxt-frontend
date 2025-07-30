import formidable from "formidable";
import { promises as fsp } from "fs";

export default defineEventHandler(async (event) => {
  // TODO: subir files sld al backend
  const form = formidable({ multiples: false });
  console.log("form", form);

  const data = await new Promise<any>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
  console.log('data', data)
  console.log('data.fields.token[0]', data.fields.token[0]);

  const { base_file } = data.files;
  if (!base_file) {
    throw createError({ statusCode: 400, message: "Archivo faltante" });
  }

  const formData = new FormData();
  formData.append(
    "base_file",
    base_file[0].filepath
      ? new Blob([await fsp.readFile(base_file[0].filepath)], {
        type: base_file[0].mimetype,
      })
      : base_file[0],
    base_file[0].originalFilename
  );
  formData.append(
    "sld_file",
    base_file[0].filepath
      ? new Blob([await fsp.readFile(base_file[0].filepath)], {
        type: base_file[0].mimetype,
      })
      : base_file[0],
    base_file[0].originalFilename
  );
  formData.append("dataset_title", "geonode:coordinaciones");
  // formData.append('dataset_title', layerSlug);
  formData.append("style_upload_form", "true");
  formData.append("permissions", JSON.stringify({}));
  formData.append("charset", "undefined");
  console.log('formData', formData);
  try {
    // const files = await readMultipartFormData(event)
    // console.log('files', files) // imprime los archivos del lado del servidor
    // if (!files) {
    //   return createError({ statusCode: 400, statusMessage: 'Los archivos están vacíos' })
    // }
    // for (const file of files) {
    //   // await useStorage().setItemRaw(`fs:${file.filename}`, file.data)
    //   console.log('file.data', file.data)
    // }

    // const upRes = await fetch(`${configEnv.public.geonodeApi}/uploads/upload/`, {
    const res = await fetch("http://10.2.102.239/upload/uploads/upload", {
      method: "POST",
      headers: {
        // "X-CSRFToken": getCookie("csrftoken"),
        // Token: "RmL4MRAwZbBXtuLREQ4GGEFR8LlwHQzq",
        // "X-Requested-With": "XMLHttpRequest",
        Authorization: `Bearer ${data.fields.token[0]}`,
      },
      // credentials: "include",
      body: formData,
    });
    // if (!upRes.ok) {
    //   throw new Error(`Upload falló: ${upRes.status}`);
    // }
    // const { execution_id } = await upRes.json();
    // console.log("execution_id", execution_id);
    // return execution_id
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