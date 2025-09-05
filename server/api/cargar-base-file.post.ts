import type { Fields, Files } from 'formidable';
import formidable from 'formidable';

import { promises as fsp } from 'fs';
import { createError } from 'h3';
export const config = {
  api: {
    bodyParser: false,
  },
};
const configEnv = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  // Parsea FormData con formidable
  const form = formidable({ multiples: false });
  console.log('form', form);

  const data = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const { base_file } = data.files;
  if (!base_file) {
    throw createError({ statusCode: 400, message: 'Archivo faltante' });
  }
  const formData = new FormData();
  formData.append(
    'base_file',
    base_file[0].filepath
      ? new Blob([await fsp.readFile(base_file[0].filepath)], {
          type: base_file[0].mimetype,
        })
      : base_file[0],
    base_file[0].originalFilename
  );
  console.warn(formData, data.fields.token[0]);
  try {
    const res = await fetch(`${configEnv.public.geonodeApi}/uploads/upload/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.fields.token[0]}`,
      },
      body: formData as unknown as BodyInit,
    });

    console.log('response status:', res.status);
    const json = await res.json();
    console.log('json:', json);
    return json;
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
    throw createError({
      statusCode: 500,
      message: 'Error al subir al GeoNode',
      data: error,
    });
  }
});
