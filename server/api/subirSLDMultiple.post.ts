import formidable from 'formidable';
import { promises as fsp } from 'fs';
const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const form = formidable({ multiples: false });
  const data = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const datasetPk = data.fields.pk[0];
  const token = data.fields.token[0];
  const { base_file } = data.files;
  const url = `${config.public.geonodeApi}/datasets/${datasetPk}/sldstyles/`;

  if (!base_file) {
    //throw createError({ statusCode: 400, message: 'Archivo faltante' });
    return 'failed';
  }

  const formData = new FormData();
  formData.append('name', base_file[0].originalFilename.replace('.sld', ''));
  formData.append(
    'sld_file',
    base_file[0].filepath
      ? new Blob([await fsp.readFile(base_file[0].filepath)], {
          type: base_file[0].mimetype,
        })
      : base_file[0],
    base_file[0].originalFilename.replace('.sld', '')
  );

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  console.warn(response);

  if (!response.ok) {
    //throw new Error(`Error POST: ${response.status}`);
    return 'failed';
  } else {
    return 'finished';
  }
});
