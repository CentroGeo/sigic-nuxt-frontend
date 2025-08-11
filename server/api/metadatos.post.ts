const configEnv = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = body.pk;
  const baseUrl = configEnv.public.geonodeApi
  // esta es la máquina con la que se probó
  // const baseUrl = 'http://10.2.102.239/api/v2';
  // const url = `${baseUrl}/documents/${id}/`;
  const url = `${baseUrl}/datasets/${id}/`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${data.fields.token[0]}`
        'Authorization': `Bearer Nr25BB5lq4vd9SoTBGGdlwGp4tcKIW`
      },
      body: JSON.stringify({ "abstract": body.abstract }),
    });

    if (!response.ok) {
      throw new Error(`Error PATCH (${id}): ${response.status}`);
    }
    console.warn("response status:", response.status);

    const json = await response.json();
    // console.warn("json:", json);

    return json;
  } catch (error) {
    console.error("Error al subir al GeoNode:", error);
  }

  // // First get the current resource
  // let responseGet;
  // try {
  //   responseGet = await fetch(url, {
  //     headers: { 'Authorization': `Bearer Nr25BB5lq4vd9SoTBGGdlwGp4tcKIW` }
  //   });
  // } catch (error) {
  //   console.error('Error al obtener el recurso', error);
  //   return null;
  // }
  // if (!responseGet.ok) {
  //   throw new Error(`No se pudo cargar la página inicial (${id})`);
  // }
  // const resourceData = await responseGet.json();
  // // Update the abstract field
  // // resourceData.abstract = body.abstract;
  // // Actualizar solo el campo 'abstract'
  // const updatedResource = {
  //   ...resourceData,
  //   abstract: "foo4"
  // };
  // try {
  //   const putResponse = await fetch(url, {
  //     method: 'PUT',
  //     headers: {
  //       'Authorization': `Bearer Nr25BB5lq4vd9SoTBGGdlwGp4tcKIW`,
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(updatedResource),
  //   });
  //   if (!putResponse.ok) throw new Error(`Error en la actualización (${id}): ${putResponse.status}`);
  //   return await putResponse.json();
  // } catch (error) {
  //   console.error(error);
  //   return null;
  // }


})
