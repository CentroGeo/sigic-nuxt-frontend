export function useTableroApi() {
  const { gnoxyFetch } = useGnoxyUrl();
  const config = useRuntimeConfig();
  const baseUrl = `${config.public.geonodeApi}/dashboard`;

  async function fetchJson(url: string) {
    const respuesta = await gnoxyFetch(url);
    return respuesta.json();
  }

  function authHeaders(token?: string | null, extra: Record<string, string> = {}) {
    const headers: Record<string, string> = { ...extra };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async function jsonRequest(url: string, method: string, body: unknown, token?: string | null) {
    const respuesta = await gnoxyFetch(url, {
      method,
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (respuesta.status === 204) return null;
    return respuesta.json();
  }

  async function formRequest(url: string, method: string, form: FormData, token?: string | null) {
    const respuesta = await gnoxyFetch(url, {
      method,
      headers: authHeaders(token),
      body: form,
    });
    if (respuesta.status === 204) return null;
    return respuesta.json();
  }

  async function deleteRequest(url: string, token?: string | null) {
    const respuesta = await gnoxyFetch(url, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return respuesta.ok;
  }

  return {
    // ---------- Sites ----------
    fetchSitios: () => fetchJson(`${baseUrl}/sites/`),

    fetchSitio: (id: number | string) => fetchJson(`${baseUrl}/sites/${id}/`),

    fetchSitioPorUrl: async (urlSlug: string) => {
      const datos = await fetchJson(`${baseUrl}/sites/?url=${encodeURIComponent(urlSlug)}`);
      return datos.results?.[0] ?? null;
    },

    crearSitio: (datos: unknown, token?: string | null) =>
      jsonRequest(`${baseUrl}/sites/`, 'POST', datos, token),

    actualizarSitio: async (id: number, datos: unknown, token?: string | null) => {
      // SiteUpdateSerializer no devuelve `id`, lo inyectamos para que el caller
      // pueda detectar éxito con `data?.id`
      const data = await jsonRequest(`${baseUrl}/sites/${id}/`, 'PATCH', datos, token);
      return data ? { id, ...data } : null;
    },

    eliminarSitio: (id: number, token?: string | null) =>
      deleteRequest(`${baseUrl}/sites/${id}/`, token),

    // ---------- Site configuration ----------
    fetchConfigSitio: (siteId: number) => fetchJson(`${baseUrl}/site-configs/${siteId}/`),

    actualizarConfigSitio: (siteId: number, datos: unknown, token?: string | null) =>
      jsonRequest(`${baseUrl}/site-configs/${siteId}/`, 'PATCH', datos, token),

    // ---------- Logos ----------
    fetchLogosDeSitio: (siteId: number) => fetchJson(`${baseUrl}/sites/${siteId}/logos/`),

    crearLogo: (form: FormData, token?: string | null) =>
      formRequest(`${baseUrl}/site-logos/`, 'POST', form, token),

    actualizarLogo: (id: number, form: FormData, token?: string | null) =>
      formRequest(`${baseUrl}/site-logos/${id}/`, 'PATCH', form, token),

    eliminarLogo: (id: number, token?: string | null) =>
      deleteRequest(`${baseUrl}/site-logos/${id}/`, token),

    reordenarLogos: (items: Array<{ id: number; stack_order: number }>, token?: string | null) =>
      jsonRequest(`${baseUrl}/site-logos/bulk-reorder/`, 'POST', items, token),

    // ---------- Groups ----------
    fetchGrupos: (siteId: number) => fetchJson(`${baseUrl}/groups/?site=${siteId}`),

    fetchGrupo: (id: number) => fetchJson(`${baseUrl}/groups/${id}/`),

    fetchDatosSeleccion: (groupId: number) =>
      fetchJson(`${baseUrl}/groups/${groupId}/select-data/`),

    crearGrupo: (datos: unknown, token?: string | null) =>
      jsonRequest(`${baseUrl}/groups/`, 'POST', datos, token),

    actualizarGrupo: (id: number, datos: unknown, token?: string | null) =>
      jsonRequest(`${baseUrl}/groups/${id}/`, 'PATCH', datos, token),

    eliminarGrupo: (id: number, token?: string | null) =>
      deleteRequest(`${baseUrl}/groups/${id}/`, token),

    reordenarGrupos: (items: Array<{ id: number; stack_order: number }>, token?: string | null) =>
      jsonRequest(`${baseUrl}/groups/bulk-reorder/`, 'POST', items, token),

    // ---------- Subgroups ----------
    fetchSubgrupo: (id: number) => fetchJson(`${baseUrl}/subgroups/${id}/`),

    crearSubgrupo: (form: FormData, token?: string | null) =>
      formRequest(`${baseUrl}/subgroups/`, 'POST', form, token),

    actualizarSubgrupo: (id: number, form: FormData, token?: string | null) =>
      formRequest(`${baseUrl}/subgroups/${id}/`, 'PATCH', form, token),

    eliminarSubgrupo: (id: number, token?: string | null) =>
      deleteRequest(`${baseUrl}/subgroups/${id}/`, token),

    reordenarSubgrupos: (
      items: Array<{ id: number; stack_order: number }>,
      token?: string | null
    ) => jsonRequest(`${baseUrl}/subgroups/bulk-reorder/`, 'POST', items, token),

    // ---------- Subgroups (list) ----------
    fetchSubgrupos: (groupId: number) => fetchJson(`${baseUrl}/subgroups/?group=${groupId}`),

    // ---------- Indicators ----------
    fetchIndicadores: (siteId?: number) =>
      fetchJson(`${baseUrl}/indicators/${siteId ? `?site=${siteId}` : ''}`),

    fetchIndicadoresPorGrupo: (groupId: number) =>
      fetchJson(`${baseUrl}/indicators/?group=${groupId}`),

    fetchIndicadoresPorSubgrupo: (subgroupId: number) =>
      fetchJson(`${baseUrl}/indicators/?subgroup=${subgroupId}`),

    fetchIndicador: (id: number) => fetchJson(`${baseUrl}/indicators/${id}/`),

    fetchDatosIndicador: (indicatorId: number) =>
      fetchJson(`${baseUrl}/indicators/${indicatorId}/view-data/`),

    fetchInfoIndicador: (indicatorId: number) =>
      fetchJson(`${baseUrl}/indicators/${indicatorId}/info/`),

    fetchDatosMultiples: (ids: number[]) =>
      fetchJson(`${baseUrl}/indicators/get-data/?indicator_ids=${ids.join(',')}`),

    crearIndicador: (datos: unknown, token?: string | null) =>
      jsonRequest(`${baseUrl}/indicators/`, 'POST', datos, token),

    actualizarIndicador: (id: number, datos: unknown, token?: string | null) =>
      jsonRequest(`${baseUrl}/indicators/${id}/`, 'PATCH', datos, token),

    eliminarIndicador: (id: number, token?: string | null) =>
      deleteRequest(`${baseUrl}/indicators/${id}/`, token),

    construirDatosIndicador: (id: number, datos: unknown, token?: string | null) =>
      jsonRequest(`${baseUrl}/indicators/${id}/build-data/`, 'POST', datos, token),

    guardarDatosIndicador: (id: number, datos: unknown, token?: string | null) =>
      jsonRequest(`${baseUrl}/indicators/${id}/save-data/`, 'POST', datos, token),

    clonarIndicador: (id: number, datos: unknown, token?: string | null) =>
      jsonRequest(`${baseUrl}/indicators/${id}/clone/`, 'POST', datos, token),

    reordenarIndicadores: (
      items: Array<{ id: number; stack_order: number }>,
      token?: string | null
    ) => jsonRequest(`${baseUrl}/indicators/bulk-reorder/`, 'POST', items, token),

    // ---------- InfoBoxes ----------
    fetchCuadrosDatos: (indicatorId: number) =>
      fetchJson(`${baseUrl}/infoboxes/?indicator=${indicatorId}`),

    crearCuadroDatos: (form: FormData, token?: string | null) =>
      formRequest(`${baseUrl}/infoboxes/`, 'POST', form, token),

    actualizarCuadroDatos: (id: number, form: FormData, token?: string | null) =>
      formRequest(`${baseUrl}/infoboxes/${id}/`, 'PATCH', form, token),

    eliminarCuadroDatos: (id: number, token?: string | null) =>
      deleteRequest(`${baseUrl}/infoboxes/${id}/`, token),

    agregarCuadrosDatos: (indicatorId: number, datos: unknown[], token?: string | null) =>
      jsonRequest(`${baseUrl}/infoboxes/bulk-add/${indicatorId}/`, 'POST', datos, token),

    eliminarCuadrosDatos: (indicatorId: number, ids: number[], token?: string | null) =>
      jsonRequest(
        `${baseUrl}/infoboxes/bulk-delete/${indicatorId}/`,
        'POST',
        ids.map((id) => ({ id })),
        token
      ),

    reordenarCuadrosDatos: (
      items: Array<{ id: number; stack_order: number }>,
      token?: string | null
    ) => jsonRequest(`${baseUrl}/infoboxes/bulk-reorder/`, 'POST', items, token),
  };
}
