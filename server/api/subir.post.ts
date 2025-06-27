import { createError } from "h3";
import formidable from "formidable";
import { Readable } from "stream";
import { promises as fsp } from "fs";
export const config = {
  api: {
    bodyParser: false,
  },
};

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

  const { base_file } = data.files;
  if (!base_file) {
    throw createError({ statusCode: 400, message: "Archivo faltante" });
  }
  const formData = new FormData();
  formData.append("title", data.fields.title[0]);
  formData.append("abstract", data.fields.abstract[0]);
  formData.append(
    "base_file",
    base_file[0].filepath
      ? new Blob([await fsp.readFile(base_file[0].filepath)], {
          type: base_file[0].mimetype,
        })
      : base_file[0],
    base_file[0].originalFilename
  );
  console.log(formData);
  try {
    const res = await fetch("http://10.2.102.177/uploads/upload/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.fields.token[0]}`,
      },
      body: formData as any,
    });

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
