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
  const form = formidable({ multiples: false });

  // Parseo del form data recibido
  const data = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const { base_file } = data.files;
  const token = data?.fields?.token?.[0];

  if (!base_file || !token) {
    throw createError({ statusCode: 400, message: 'Archivo o token faltante' });
  }

  // Crear FormData para enviar a GeoNode
  const formData = new FormData();
  const buffer = await fsp.readFile(base_file[0].filepath);
  formData.append(
    'base_file',
    new Blob([buffer], { type: base_file[0].mimetype }),
    base_file[0].originalFilename
  );

  try {
    // 1️⃣ Subir archivo al GeoNode
    const uploadRes = await fetch(`${configEnv.public.geonodeApi}/uploads/upload/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const uploadJson = await uploadRes.json();
    console.log('GeoNode upload response:', uploadJson);

    // Si no hay execution_id, devolver lo que haya
    const executionId = uploadJson?.execution_id;
    if (!executionId) {
      return uploadJson;
    }

    // 2️⃣ Polling para verificar estado del procesamiento
    const statusUrl = `${configEnv.public.geonodeApi}/resource-service/execution-status/${executionId}`;
    let statusJson = null;
    const maxAttempts = 20; // 20 * 5s = 100s máx
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await delay(5000);
      const statusRes = await fetch(statusUrl, {
        method: 'GET',

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!statusRes.ok) {
        console.warn(`Error polling (intento ${attempt + 1}): ${statusRes.status}`);
        continue;
      }

      statusJson = await statusRes.json();
      console.log('GeoNode status:', statusJson?.status);

      if (statusJson?.status === 'finished' && statusJson?.output_params?.resources?.length > 0) {
        break;
      }
    }

    // 3️⃣ Devolver resultado final al frontend
    if (statusJson?.status === 'finished') {
      const resource = statusJson.output_params.resources[0];
      return {
        success: true,
        message: 'Procesamiento completado',
        id: resource.id,
        url: `${configEnv.public.geonodeHost}${resource.detail_url}`,
        time: statusJson.finished,
      };
    } else {
      return {
        success: false,
        message: 'El procesamiento no se completó en el tiempo esperado',
        status: statusJson?.status,
      };
    }
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);
    throw createError({
      statusCode: 500,
      message: 'Error al subir al GeoNode',
      data: error,
    });
  }
});
