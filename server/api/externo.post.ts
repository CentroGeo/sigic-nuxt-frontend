export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const formData = new FormData();
  formData.append('url', body.url);
  formData.append('type', body.type);

  await fetch('https://geonode.dev.geoint.mx/services/register', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${body.token}`,
    },
    body: formData,
  }).then(response => console.log(response))

  return { body }
})