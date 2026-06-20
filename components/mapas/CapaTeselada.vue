<script setup>
import useCapa from '@centrogeomx/sisdai-mapas/src/componentes/capa/useCapa';
import TileLayer from 'ol/layer/Tile';
import ImageTile from 'ol/source/ImageTile';

/**
 * Capa híbrida por tesela (OL 10 ImageTile + loader): intenta cada tesela desde
 * GWC/WMTS (cacheado, directo a GeoServer) y, si falla (capa/estilo/zoom no
 * cacheado o tesela fuera del extent), cae a un WMS GetMap del bbox de esa
 * tesela. Carga nativa de <img> (sin blob/proxy).
 *
 * Para capas públicas (CORS abierto en GeoServer). Las privadas usan
 * SisdaiCapaWms (proxy gnoxy).
 */
const props = defineProps({
  id: { type: [String, Number], required: true },
  // Plantilla WMTS GWC con marcadores {z}/{y}/{x}.
  fuenteWmts: { type: String, required: true },
  // Base WMS de GeoServer (".../wms?") para el fallback por tesela.
  fuenteWms: { type: String, required: true },
  // Nombre de la capa en GeoServer (workspace:nombre).
  capa: { type: String, required: true },
  estilo: { type: String, default: '' },
  opacidad: { type: Number, default: 1 },
  visible: { type: Boolean, default: true },
  posicion: { type: Number, default: 0 },
  lado: { type: String, default: '' },
  titulo: { type: String, default: '' },
});

// Medio mundo en EPSG:3857 (Web Mercator).
const SEMI = 20037508.342789244;

// Extent [minx, miny, maxx, maxy] de una tesela z/x/y (origen sup-izq, y hacia abajo).
function extent3857(z, x, y) {
  const tam = (2 * SEMI) / 2 ** z;
  const minx = -SEMI + x * tam;
  const maxy = SEMI - y * tam;
  return [minx, maxy - tam, minx + tam, maxy];
}

function sustituir(plantilla, z, x, y) {
  return String(plantilla).replace('{z}', z).replace('{x}', x).replace('{y}', y);
}

function urlWms([minx, miny, maxx, maxy]) {
  const p = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetMap',
    LAYERS: props.capa,
    STYLES: props.estilo || '',
    CRS: 'EPSG:3857',
    BBOX: `${minx},${miny},${maxx},${maxy}`,
    WIDTH: '256',
    HEIGHT: '256',
    FORMAT: 'image/png',
    TRANSPARENT: 'true',
  });
  return `${props.fuenteWms}${p.toString()}`;
}

function cargarImagen(url, crossOrigin) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = crossOrigin ?? 'anonymous';
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () => reject(new Error('img')));
    img.src = url;
  });
}

// loader OL 10: (z, x, y, options) -> Promise<HTMLImageElement>.
function loader(z, x, y, options) {
  const co = options?.crossOrigin ?? 'anonymous';
  return cargarImagen(sustituir(props.fuenteWmts, z, x, y), co).catch(() =>
    cargarImagen(urlWms(extent3857(z, x, y)), co)
  );
}

const source = new ImageTile({ loader, crossOrigin: 'anonymous' });

// Si cambia la URL WMTS o el estilo, recargar las teselas.
watch(
  () => [props.fuenteWmts, props.estilo],
  () => source.refresh()
);

const capaOl = new TileLayer({ source, tipo: 'wms' });
useCapa(capaOl, props);
</script>

<template>
  <span :sisdai-capa="props.id" />
</template>
