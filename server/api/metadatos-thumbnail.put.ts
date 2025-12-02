import formidable from 'formidable';
import { promises as fsp } from 'fs';
import { createError } from 'h3';

export const config = {
  api: { bodyParser: false },
};

export default defineEventHandler(async (event) => {
  const form = formidable({ multiples: false });

  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const file = files.file?.[0];
  const token = fields.token?.[0];
  const pk = fields.pk?.[0];

  if (!file) {
    throw createError({
      statusCode: 400,
      message: 'No se recibió ningún archivo.',
    });
  }

  // Lee archivo en buffer
  const buffer = await fsp.readFile(file.filepath);

  // Convierte a Blob compatible con undici
  const blob = new Blob([buffer], {
    type: file.mimetype || 'application/octet-stream',
  });

  // Construye FormData para GeoNode
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('cropping', '0,0,200,200');

  const configEnv = useRuntimeConfig();

  // Envía a GeoNode
  const res = await fetch(`${configEnv.public.geonodeApi}/resources/${pk}/set_thumbnail/`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const json = await res.json();
  console.log('response status:', res);
  console.log('json:', json);
  return json;
});
