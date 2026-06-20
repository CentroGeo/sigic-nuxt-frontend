import ScaleLine from 'ol/control/ScaleLine';
import { transform } from 'ol/proj';

export function useMapControls(getMap) {
  const scaleLineControl = shallowRef(null);
  const mouseLatElement = ref(null);
  const mouseLngElement = ref(null);
  let pointerMoveHandler = null;
  let mouseLeaveHandler = null;
  let containerRef = null;

  function createScaleLineControl() {
    const control = new ScaleLine({
      units: 'metric',
      bar: true,
      steps: 4,
      text: true,
      minWidth: 140,
    });
    scaleLineControl.value = control;
    return control;
  }

  function addControlsToMap() {
    const map = getMap();
    if (!map) return;
    if (scaleLineControl.value) {
      map.addControl(scaleLineControl.value);
    }
  }

  function setupMousePositionTracking(latElement, lngElement) {
    mouseLatElement.value = latElement;
    mouseLngElement.value = lngElement;
    const map = getMap();
    if (!map) return;

    pointerMoveHandler = (event) => {
      const coordinate = event.coordinate;
      if (!coordinate) return;
      const proyMapa = map.getView().getProjection().getCode();
      const [lng, lat] =
        proyMapa === 'EPSG:4326' ? coordinate : transform(coordinate, proyMapa, 'EPSG:4326');
      if (mouseLatElement.value) mouseLatElement.value.textContent = lat.toFixed(6);
      if (mouseLngElement.value) mouseLngElement.value.textContent = lng.toFixed(6);
    };
    map.on('pointermove', pointerMoveHandler);
  }

  function setupMouseLeaveHandler(mapContainer) {
    if (!mapContainer) return;
    containerRef = mapContainer;
    mouseLeaveHandler = () => {
      if (mouseLatElement.value) mouseLatElement.value.textContent = '---';
      if (mouseLngElement.value) mouseLngElement.value.textContent = '---';
    };
    mapContainer.addEventListener('mouseleave', mouseLeaveHandler);
  }

  function removeControls() {
    const map = getMap();
    if (!map) return;
    if (scaleLineControl.value) {
      map.removeControl(scaleLineControl.value);
      scaleLineControl.value = null;
    }
    if (pointerMoveHandler) {
      map.un('pointermove', pointerMoveHandler);
      pointerMoveHandler = null;
    }
  }

  function cleanup() {
    removeControls();
    if (containerRef && mouseLeaveHandler) {
      containerRef.removeEventListener('mouseleave', mouseLeaveHandler);
      mouseLeaveHandler = null;
      containerRef = null;
    }
    mouseLatElement.value = null;
    mouseLngElement.value = null;
  }

  return {
    scaleLineControl,
    mouseLatElement,
    mouseLngElement,
    createScaleLineControl,
    addControlsToMap,
    setupMousePositionTracking,
    setupMouseLeaveHandler,
    removeControls,
    cleanup,
  };
}
