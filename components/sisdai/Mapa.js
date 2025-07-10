import olMap from "ol/Map";
import View from "ol/View";
import { vista as vistaPorDefecto } from "@centrogeomx/sisdai-mapas/src/componentes/mapa/valores";
import * as validaciones from "@centrogeomx/sisdai-mapas/src/componentes/mapa/validaciones";
import {
  valorarArregloNumerico,
  valorarExtensionMargen,
} from "@centrogeomx/sisdai-mapas/src/utiles";
import { crearImagenMapa } from "@centrogeomx/sisdai-mapas/src/componentes/mapa/utiles";
import RenderEventType from "ol/render/EventType";

const duration = 250;

/**
 * @classdesc
 * Clase heredada de la clase Map de OpenLayers con la finaliodad de agregar funciones y/o
 * propiedades que faciliten la manipulación del contenido de la propia instancia.
 */
export default class Mapa extends olMap {
  /**
   * Creación del objeto mapa.
   * @param {number} id identificador del mapa.
   * @param {HTMLDivElement|string} target elemento o id del elemento html que contendrá el mapa.
   * @param {string} proyeccion
   * @returns {import("./../clases/Mapa.js").default} Mapa
   */
  constructor(id, proyeccion /*, target, emits*/) {
    super({
      controls: [],
      // target,
      view: new View({
        center: [0, 0],
        projection: proyeccion,
        zoom: 2,
      }),
    });
  }

  /**
   * Ajusta a vista del mapa de acuerdo a los parametros recividos con la estructura:
   *
   * @param {vista} vista
   */
  ajustarVista(vista = this.vista) {
    validaciones.vista(vista);

    const { acercamiento, centro } = vista;
    var { extension, extensionMargen } = vista;

    if (extension || (this.vista.extension && !(acercamiento || centro))) {
      extensionMargen = !extensionMargen
        ? this.vista.extensionMargen
        : extensionMargen;
      extension = !extension ? this.vista.extension : extension;

      this.getView().fit(valorarArregloNumerico(extension), {
        duration,
        padding: valorarExtensionMargen(extensionMargen),
      });
      return;
    }

    this.getView().animate({
      center:
        centro && validaciones.centro(centro)
          ? valorarArregloNumerico(centro)
          : this.getView().getCenter(),
      duration,
      zoom:
        acercamiento && validaciones.acercamiento(acercamiento)
          ? Number(acercamiento)
          : this.getView().getZoom(),
    });
  }

  /**
   * Permite descargar la vista actual del mapa, con las capas visibles y acercamiento mostrado en
   * pantalla, sin controles. El formato de descargá es PNG.
   * @param {String} nombreImagen nombre del archivo que se descargara del navegador (no debe
   * incluir extensión).
   */
  exportarImagen(nombreImagen = "mapa") {
    this.once(RenderEventType.RENDERCOMPLETE, function () {
      const link = document.createElement("a");
      console.log("creando imágen");

      link.href = crearImagenMapa(this);
      link.download = `${nombreImagen}.png`;
      link.click();
    });

    this.renderSync();
  }

  /**
   * @typedef {Object} vista
   * @property {number} [acercamiento] Nuvel de acercamiento.
   * @property {Array<number>|string} [centro] Coordenadas céntricas.
   * @property {Array<number>|string} [extension] Extensión.
   * @property {number|Array<number>} [extensionMargen] Margen de la extensión.
   *
   * @returns {vista} vista
   */
  get vista() {
    return {
      acercamiento: this.getView().get("acercamiento"),
      centro: this.getView().get("centro"),
      extension: this.getView().get("extension"),
      extensionMargen: this.getView().get("extensionMargen"),
    };
  }

  /**
   * Asigna los valores de de la vista del mapa.
   * @param {vista} vista
   */
  set vista({
    acercamiento = vistaPorDefecto.acercamiento,
    centro = vistaPorDefecto.centro,
    extension = vistaPorDefecto.extension,
    extensionMargen = vistaPorDefecto.extensionMargen,
  }) {
    this.getView().set("acercamiento", acercamiento);
    this.getView().set("centro", centro);
    this.getView().set("extension", extension);
    this.getView().set("extensionMargen", extensionMargen);

    this.ajustarVista(this.vista);
  }
}
