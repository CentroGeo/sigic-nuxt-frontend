import formidable from 'formidable';
import { promises as fsp } from 'fs';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const url = `${config.public.geonodeApi}/account/me/avatar/`;
  const form = formidable({ multiples: false });
  const data = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const { image } = data.files;
  if (!image) {
    throw createError({ statusCode: 400, message: 'Archivo faltante' });
  }
  const formData = new FormData();
  formData.append(
    'image',
    image[0].filepath
      ? new Blob([await fsp.readFile(image[0].filepath)], {
          type: image[0].mimetype,
        })
      : image[0],
    image[0].originalFilename
  );

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.fields.token[0]}`,
      },
      body: formData,
    });
    if (!response.ok) {
      return 'Error';
    }
    const json = await response.json();
    return json.avatar_url;
  } catch (error) {
    return 'Error';
  }
});
