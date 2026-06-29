import formidable from 'formidable';
import { promises as fsp } from 'fs';

export default defineEventHandler(async (event) => {
  const configEnv = useRuntimeConfig();
  const baseUrl = configEnv.public.geonodeApi;

  const form = formidable({ multiples: false });

  const data = await new Promise<{
    // @ts-ignore
    fields: any;
    // @ts-ignore
    files: any;
  }>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const pk = data.fields.pk?.[0];
  const token = data.fields.token?.[0];
  const xmlFile = data.files.xml_file?.[0];

  if (!pk || !token) {
    throw createError({ statusCode: 400, message: 'Faltan campos pk o token' });
  }
  if (!xmlFile) {
    throw createError({ statusCode: 400, message: 'Falta el archivo xml_file' });
  }

  const url = `${baseUrl}/datasets/${pk}/metadata-import/`;

  const formData = new FormData();
  formData.append(
    'xml_file',
    xmlFile.filepath
      ? new Blob([await fsp.readFile(xmlFile.filepath)], {
          type: xmlFile.mimetype || 'application/xml',
        })
      : xmlFile,
    xmlFile.originalFilename || 'metadata.xml'
  );

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await response.json();

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: json.error || 'Error al procesar el archivo XML',
      });
    }

    return json;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al conectar con el servidor',
      data: error,
    });
  }
});
