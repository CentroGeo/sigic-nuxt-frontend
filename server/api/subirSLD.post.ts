import formidable from "formidable";
import { promises as fsp } from "fs";
const configEnv = useRuntimeConfig();

export default defineEventHandler(async (event) => {

  const form = formidable({ multiples: false });
  // console.log("form", form);

  const data = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
  // console.log('data', data)
  // console.log('data.fields.token[0]', data.fields.token[0]);

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

  // TODO: cambiar el layerSlug según la capa
  // formData.append('dataset_title', layerSlug);
  formData.append("dataset_title", "geonode:coordinaciones");
  formData.append("style_upload_form", "true");
  formData.append("permissions", JSON.stringify({}));
  formData.append("charset", "undefined");

  console.warn('formData', formData);

  try {
    const response = await fetch(`${configEnv.public.geonodeApi}/upload/uploads/upload`, {
      // esta es la máquina con la que se probó
      // const res = await fetch("http://10.2.102.239/upload/uploads/upload", {
      method: "POST",
      headers: {
        // Authorization: `Bearer ${data.fields.token[0]}`,
        Authorization: `Bearer Nr25BB5lq4vd9SoTBGGdlwGp4tcKIW`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error POST: ${response.status}`);
    }
    // console.warn("response status:", response.status);

    const json = await response.json();
    console.warn("json:", json);

    return json;
  } catch (error) {
    console.error("Error al subir al GeoNode:", error);

    throw createError({ statusCode: 500, statusMessage: 'Error al subir al GeoNode', data: error });
  }
});
