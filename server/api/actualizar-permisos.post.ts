const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  const pk = data.pk;
  const token = getHeader(event, 'token');
  const url = `${config.public.geonodeApi}/resources/${pk}/permissions/`;
  try {
    const updatePermissionReq = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groups: [
          {
            id: 3,
            title: 'anonymous',
            name: 'anonymous',
            permissions: 'download',
          },
          {
            id: 2,
            title: 'Registered Members',
            name: 'registered-members',
            permissions: 'download',
          },
        ],
      }),
    });
    if (!updatePermissionReq.ok) {
      console.error('Error al actualizar permisos:', updatePermissionReq.status);
      return 'Error';
    } else {
      const updatePermissionRes = await updatePermissionReq.json();
      return updatePermissionRes.status;
    }
  } catch (error) {
    console.error('Error al actualizar permisos:', error);
    return 'Error';
  }
});
