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

  // Prepara FormData para reenviar a GeoNode
  const formData = new FormData();
  formData.append("title", data.fields.title[0]);
  formData.append("abstract", data.fields.abstract[0]);
  formData.append(
    "base_file",
    base_file[0].filepath
      ? new Blob([await fsp.readFile(base_file[0].filepath)], {
          type: base_file[0].mimetype,
        })
      : base_file[0]
  );
  const res = await fetch("https://geonode.dev.geoint.mx/api/v2/uploads/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${data.fields.token[0]}`,
    },
    body: formData as any, // puedes usar undici para más control
  });
  console.log(res);

  const json = await res.json();
  return json;
});
