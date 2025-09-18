export async function fetchByPk(pk) {
  console.log('Se llamó exitosamente la función');
  const config = useRuntimeConfig();
  const { gnoxyUrl } = useGnoxyUrl();
  const api = gnoxyUrl(`${config.public.geonodeApi}/resources/${pk}`);
  const res = await fetch(api);
  console.log('la res by pk:', res);
  const response = await res.json();
  return response.resource;
}
