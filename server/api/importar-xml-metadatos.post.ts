import type { Fields, Files } from 'formidable';
import formidable from 'formidable';
import { promises as fsp } from 'fs';
import { createError } from 'h3';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default defineEventHandler(async (event) => {
  const configEnv = useRuntimeConfig();
  const form = formidable({ multiples: false });

  const data = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const { xml_file } = data.files;
  const token = data?.fields?.token?.[0];
  const datasetPk = data?.fields?.dataset_pk?.[0];

  if (!xml_file || !token) {
    throw createError({ statusCode: 400, message: 'Archivo XML o token faltante' });
  }

  if (!datasetPk) {
    throw createError({
      statusCode: 400,
      message: 'Se requiere dataset_pk para importar metadatos',
    });
  }

  const buffer = await fsp.readFile(xml_file[0].filepath);
  const formData = new FormData();
  formData.append(
    'xml_file',
    new Blob([buffer], { type: 'application/xml' }),
    xml_file[0].originalFilename ?? 'metadatos.xml'
  );

  try {
    const res = await fetch(
      `${configEnv.public.geonodeApi}/datasets/${datasetPk}/metadata-import/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!res.ok) {
      let errMsg = `Error ${res.status} al importar metadatos`;
      try {
        const json = await res.json();
        errMsg = json?.detail || json?.error || errMsg;
      } catch {}
      throw createError({ statusCode: res.status, message: errMsg });
    }

    return {
      success: true,
      message: 'Metadatos importados correctamente',
    };
  } catch (error: unknown) {
    const h3err = error as { statusCode?: number };
    if (h3err.statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Error al importar metadatos XML', data: error });
  }
});
