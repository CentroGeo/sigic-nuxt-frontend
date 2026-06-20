export function useSigicMapas() {
  const config = useRuntimeConfig();
  const { data: session } = useAuth();

  const api = config.public.geonodeApi;

  function authHeaders(extra = {}) {
    const token = session.value?.accessToken;
    return token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra };
  }

  // ── Maps ────────────────────────────────────────────────────────────────

  async function fetchMaps(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${api}/sigic-maps/${query ? `?${query}` : ''}`;
    // Enviar token (si hay) para que el dueño vea también sus mapas privados;
    // anónimo solo recibe los públicos (backend filtra por get_queryset).
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  }

  async function fetchMap(id) {
    const res = await fetch(`${api}/sigic-maps/${id}/`, { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  }

  async function createMap(body) {
    const res = await fetch(`${api}/sigic-maps/`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async function updateMap(id, body) {
    const res = await fetch(`${api}/sigic-maps/${id}/`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.warn('[updateMap] !ok', { status: res.status, body: txt });
      return null;
    }
    const json = await res.json();
    console.warn('[updateMap] ok', { status: res.status, json });
    return json;
  }

  async function deleteMap(id) {
    const res = await fetch(`${api}/sigic-maps/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.ok;
  }

  async function uploadMapImage(id, file) {
    const form = new FormData();
    form.append('card_image', file);
    const res = await fetch(`${api}/sigic-maps/${id}/upload-image/`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
    if (!res.ok) return null;
    return res.json();
  }

  // ── Layers ───────────────────────────────────────────────────────────────

  async function fetchLayers(mapId) {
    const res = await fetch(`${api}/sigic-map-layers/by-map/${mapId}/`, {
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async function fetchLayer(id) {
    const res = await fetch(`${api}/sigic-map-layers/${id}/`, { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  }

  async function createLayer(body) {
    const res = await fetch(`${api}/sigic-map-layers/`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async function updateLayer(id, body) {
    const res = await fetch(`${api}/sigic-map-layers/${id}/`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async function deleteLayer(id) {
    const res = await fetch(`${api}/sigic-map-layers/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.ok;
  }

  async function updateLayerStyle(id, style) {
    const res = await fetch(`${api}/sigic-map-layers/${id}/update-style/`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ style }),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async function bulkAddLayers(mapId, layers) {
    const res = await fetch(`${api}/sigic-map-layers/bulk-add/${mapId}/`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(layers),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async function bulkReorderLayers(layers) {
    const res = await fetch(`${api}/sigic-map-layers/bulk-reorder/`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(layers),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async function bulkDeleteLayers(mapId, ids) {
    const res = await fetch(`${api}/sigic-map-layers/bulk-delete/${mapId}/`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(ids.map((id) => ({ id }))),
    });
    if (!res.ok) return null;
    return res.json();
  }

  return {
    fetchMaps,
    fetchMap,
    createMap,
    updateMap,
    deleteMap,
    uploadMapImage,
    fetchLayers,
    fetchLayer,
    createLayer,
    updateLayer,
    deleteLayer,
    updateLayerStyle,
    bulkAddLayers,
    bulkReorderLayers,
    bulkDeleteLayers,
  };
}
