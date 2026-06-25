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

  const { sld_file } = data.files;
  const token = data?.fields?.token?.[0];
  const styleName = data?.fields?.style_name?.[0] || '';

  if (!sld_file || !token) {
    throw createError({ statusCode: 400, message: 'Archivo SLD o token faltante' });
  }

  const buffer = await fsp.readFile(sld_file[0].filepath);
  const formData = new FormData();
  formData.append(
    'sld_file',
    new Blob([buffer], { type: 'application/xml' }),
    sld_file[0].originalFilename ?? 'estilo.sld'
  );
  if (styleName) {
    formData.append('name', styleName);
  }

  try {
    const res = await fetch(`${configEnv.public.geonodeApi}/styles/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      throw createError({
        statusCode: res.status,
        message: json?.error || `Error ${res.status} al crear el estilo`,
      });
    }

    return {
      success: true,
      style_name: json.style_name,
      workspace: json.workspace,
      message: json.message,
    };
  } catch (error: unknown) {
    const h3err = error as { statusCode?: number };
    if (h3err.statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Error al subir el estilo SLD', data: error });
  }
});
