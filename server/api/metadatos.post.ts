export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const formData = new FormData();
  formData.append('abstract', body.abstract);
  await fetch('http://10.2.102.239/api/v2/resources/13', {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${body.token}`,
    },
    body: formData,
  }).then(response => console.log(response))
  return { body }
})

// import type { Fields, Files } from "formidable";
// import formidable from 'formidable';
// type Data = {
//   fields: Fields,
//   files: Files,
// }
// export default defineEventHandler(async (event) => {
//   // console.log('event', event)
//   const form = formidable({ multiples: false });
//   const data = await new Promise<Data>((resolve, reject) => {
//     form.parse(event.node.req, (err, fields, files) => {
//       if (err) reject(err);
//       else resolve({ fields, files });
//     });
//   });
//   // console.log('data', data)
//   // console.log('data.fields.token[0]', data.fields.token[0])
//   // console.log('data.fields.abstract[0]', data.fields.abstract[0])
//   const formData = new FormData();
//   formData.append('abstract', data.fields.abstract[0]);
//   try {
//     const response = await fetch('http://10.2.102.239/api/v2/datasets/1/', {
//       method: 'PATCH',
//       headers: {
//         'Content-type': 'application/json; charset=UTF-8',
//         Authorization: `Bearer ${data.fields.token[0]}`,
//       },
//       body: formData,
//     })
//     console.log(response)
//     // .then((response) => response.json())
//     //   .then((json) => console.log(json));
//   } catch (error) {
//     console.error("Error al subir al GeoNode:", error);

//     throw createError({ statusCode: 500, statusMessage: 'Error al subir al GeoNode', data: error });
//   }
// });