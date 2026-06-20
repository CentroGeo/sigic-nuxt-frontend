export interface ColumnSchema {
  name: string;
  detected_type: string;
  editable_type: string;
  confidence: 'high' | 'medium' | 'low';
  geo_role: string | null;
  sample_values: string[];
  warning?: string;
}

export interface StyleSpec {
  col: string;
  type: 'categorical' | 'graduated' | 'graduated_size';
  palette: string;
  n_classes?: number;
  classification?: 'quantile' | 'equal_interval';
  label?: string;
  size_min?: number;
  size_max?: number;
  reverse?: boolean;
}

export interface GeoNodeCategory {
  id: number;
  identifier: string;
  gn_description: string;
}

export interface DataImportJob {
  id: number;
  status: 'pending' | 'analyzing' | 'ready' | 'importing' | 'done' | 'error';
  error_message: string;
  original_filename: string;
  file_format: string;
  column_schema: ColumnSchema[] | null;
  geo_strategy: string;
  geo_field_lat: string;
  geo_field_lon: string;
  geo_field_join: string;
  geonode_dataset_id: number | null;
  dashboard_site_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTableroPayload {
  name: string;
  description?: string;
  layer_abstract?: string;
  layer_keywords?: string;
  layer_license?: string;
  layer_category?: string;
  layer_attribution?: string;
  style_specs?: StyleSpec[];
  default_style_col?: string;
}

export function useDataImporter() {
  const { gnoxyFetch } = useGnoxyUrl();
  const config = useRuntimeConfig();
  // geonodeApi ya incluye /api/v2, ej: https://geonode.dev.geoint.mx/api/v2
  const baseUrl = `${config.public.geonodeApi}/data-importer/jobs`;

  function authHeaders(token?: string | null): Record<string, string> {
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  }

  async function uploadFile(file: File, token?: string | null): Promise<DataImportJob> {
    const form = new FormData();
    form.append('file', file);
    const resp = await gnoxyFetch(`${baseUrl}/upload/`, {
      method: 'POST',
      headers: authHeaders(token),
      body: form,
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `Error ${resp.status} al subir archivo`);
    }
    return resp.json();
  }

  async function pollJob(jobId: number, token?: string | null): Promise<DataImportJob> {
    const resp = await gnoxyFetch(`${baseUrl}/${jobId}/`, {
      headers: authHeaders(token),
    });
    if (!resp.ok) throw new Error(`Error ${resp.status} consultando job`);
    return resp.json();
  }

  async function updateSchema(
    jobId: number,
    payload: Partial<{
      column_schema: ColumnSchema[];
      geo_strategy: string;
      geo_field_lat: string;
      geo_field_lon: string;
      geo_field_join: string;
    }>,
    token?: string | null
  ): Promise<DataImportJob> {
    const resp = await gnoxyFetch(`${baseUrl}/${jobId}/schema/`, {
      method: 'PATCH',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error(`Error ${resp.status} actualizando esquema`);
    return resp.json();
  }

  async function previewGeo(
    jobId: number,
    payload: {
      geo_strategy: string;
      geo_field_lat?: string;
      geo_field_lon?: string;
      geo_field_join?: string;
    },
    token?: string | null
  ): Promise<{
    ok: boolean;
    matched?: number;
    sample_size?: number;
    total?: number;
    geojson?: string;
    error?: string;
  }> {
    const resp = await gnoxyFetch(`${baseUrl}/${jobId}/geo-preview/`, {
      method: 'POST',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return { ok: false, error: err.detail || err.error || `Error ${resp.status}` };
    }
    return resp.json();
  }

  async function importToGeonode(jobId: number, token?: string | null): Promise<void> {
    const resp = await gnoxyFetch(`${baseUrl}/${jobId}/import/`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `Error ${resp.status} importando`);
    }
  }

  async function finalizeLayer(
    jobId: number,
    payload: CreateTableroPayload,
    token?: string | null
  ): Promise<{ dataset_id: number; alternate: string | null }> {
    const resp = await gnoxyFetch(`${baseUrl}/${jobId}/finalize-layer/`, {
      method: 'POST',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `Error ${resp.status} finalizando capa`);
    }
    return resp.json();
  }

  async function createTablero(
    jobId: number,
    payload: CreateTableroPayload,
    token?: string | null
  ): Promise<{ site_id?: number; building?: boolean; job_id?: number }> {
    const resp = await gnoxyFetch(`${baseUrl}/${jobId}/create-tablero/`, {
      method: 'POST',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `Error ${resp.status} creando tablero`);
    }
    return resp.json();
  }

  async function listJobs(token?: string | null): Promise<DataImportJob[]> {
    const url = `${baseUrl}/`;
    const resp = await gnoxyFetch(url, { headers: authHeaders(token) });
    if (!resp.ok) {
      console.warn('[listJobs] HTTP', resp.status, url);
      return [];
    }
    const data = await resp.json();
    console.debug('[listJobs] recibidos:', Array.isArray(data) ? data.length : data);
    return Array.isArray(data) ? data : (data.results ?? []);
  }

  async function deleteJob(jobId: number, token?: string | null): Promise<boolean> {
    const resp = await gnoxyFetch(`${baseUrl}/${jobId}/`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return resp.ok || resp.status === 204;
  }

  async function fetchCategories(token?: string | null): Promise<GeoNodeCategory[]> {
    try {
      const resp = await gnoxyFetch(`${baseUrl.replace('/jobs', '')}/categories/`, {
        headers: authHeaders(token),
      });
      if (!resp.ok) return [];
      const data = await resp.json();
      return Array.isArray(data) ? data : (data.categories ?? data.results ?? []);
    } catch {
      return [];
    }
  }

  return {
    uploadFile,
    pollJob,
    updateSchema,
    previewGeo,
    importToGeonode,
    finalizeLayer,
    createTablero,
    listJobs,
    deleteJob,
    fetchCategories,
  };
}
