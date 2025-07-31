import { createError } from "h3";
import formidable from "formidable";
import { promises as fsp } from "fs";
export const config = {
  api: {
    bodyParser: false,
  },
};
// const configEnv = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  // Parsea FormData con formidable
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

  const { file } = data.files;
  if (!file) {
    throw createError({ statusCode: 400, message: "Archivo faltante" });
  }
  const formData = new FormData();
  formData.append("title", data.fields.title[0]);
  formData.append(
    "file",
    file[0].filepath
      ? new Blob([await fsp.readFile(file[0].filepath)], {
        type: file[0].mimetype,
      })
      : file[0],
    file[0].originalFilename
  );
  console.log(formData);
  try {
    const res = await fetch(
      "http://localhost:8080/api/fileuploads/upload-to-geonode/",
      // "http://localhost:8001/api/fileuploads/upload-to-geonode/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.fields.token[0]}`,
        },
        // credentials: "include",
        body: formData,
      }
    );

    console.log("response status:", res.status);
    const json = await res.json();
    console.log("json:", json);
    return json;
  } catch (error) {
    console.error("Error al subir al GeoNode:", error);
    throw createError({
      statusCode: 500,
      message: "Error al subir al GeoNode",
      data: error,
    });
  }
});
