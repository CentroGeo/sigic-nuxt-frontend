export default class ConfiguracioCapa {
  separador_ = ',';

  /**
   * Devuelve los atributos del query param en un objeto.
   * @param {String} queryParam de un recurso con sus atributos separados por comas (,).
   * @returns {Object}
   */
  fromQueryParam(queryParam) {
    const [uuid, estilo, opacidad, visible, posicion] = queryParam.split(this.separador_);
    return { uuid, estilo, opacidad, posicion, visible };
  }

  constructor(opciones = {}) {
    const { estilo, opacidad, posicion, uuid, visible } =
      typeof opciones === 'string' ? this.fromQueryParam(opciones) : opciones;

    this.estilo = estilo || undefined;
    this.opacidad = opacidad || 1;
    this.uuid = uuid || '';
    this.visible = visible || 1;
    this.posicion = posicion || 0;
  }

  get asQueryParam() {
    return [this.uuid, this.estilo || '', this.opacidad, Number(this.visible)].join(
      this.separador_
    );
  }

  get opacidad() {
    return this.opacidad_;
  }
  set opacidad(valor) {
    this.opacidad_ = Number(valor);
  }

  get posicion() {
    return this.posicion_;
  }
  set posicion(valor) {
    this.posicion_ = Number(valor);
  }

  get visible() {
    return this.visible_;
  }
  set visible(valor) {
    this.visible_ = Boolean(Number(valor));
  }
}
