import formidable from 'formidable';
import { promises as fsp } from 'fs';
const configEnv = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const baseUrl = configEnv.public.geonodeApi;
  const url = `${baseUrl}/upload/uploads/upload`;
  const form = formidable({ multiples: false });

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
  formData.append(
    'sld_file',
    base_file[0].filepath
      ? new Blob([await fsp.readFile(base_file[0].filepath)], {
          type: base_file[0].mimetype,
        })
      : base_file[0],
    base_file[0].originalFilename
  );

  formData.append('dataset_title', data.fields.dataset_title[0]);
  formData.append('style_upload_form', 'true');
  formData.append('permissions', JSON.stringify({}));
  formData.append('charset', 'undefined');

  //console.warn('formData', formData);

  try {
    // Esta primera peticion sube el archivo pero solo regresa un execution ID
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.fields.token[0]}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Error POST: ${response.status}`);
    }
    const json = await response.json();
    const executionID = json.execution_id;
    let status = 'running';
    do {
      const resStatus = await fetch(
        `${baseUrl}/executionrequest?import&filter{source}=resource_file_upload&page=1&page_size=99999`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${data.fields.token[0]}`,
          },
        }
      );
      const { requests } = await resStatus.json();
      const current = requests.find((d) => d.exec_id === executionID);
      status = current.status; //puede ser running, finished y failed
      console.warn(status);
    } while (status === 'running');
    return status;
  } catch (error) {
    console.error('Error al subir al GeoNode:', error);

    throw createError({ statusCode: 500, statusMessage: 'Error al subir al GeoNode', data: error });
  }
});
