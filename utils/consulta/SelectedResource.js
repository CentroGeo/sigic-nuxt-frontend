/**
 * Devuelve los atributos del query param en un objeto.
 * @param {String} queryParam de un recurso con sus atributos separados por comas (,).
 * @param {Array<String>} vars lista de propiedades esperadas (ordenadas).
 * @returns
 */
export function fromQueryParam(queryParam, vars) {
  const array = queryParam.split(',');
  return vars.reduce((accum, _var, idx) => ({ ...accum, [_var]: array[idx] }), {});
}

export default class SelectedResource {
  constructor(options = {}) {
    const vars = ['uuid', 'visible', 'posicion'];
    const _options = typeof options === 'string' ? fromQueryParam(options, vars) : options;

    this.uuid = _options.uuid || undefined;
    this.visible = _options.visible ?? 1;
    this.posicion = _options.posicion || 0;
  }

  get asQueryParam() {
    return [this.uuid, Number(this.visible)].join(',');
  }

  get posicion() {
    return this.position_;
  }
  set posicion(valor) {
    this.position_ = Number(valor);
  }

  get visible() {
    return this.visibility_;
  }
  set visible(valor) {
    this.visibility_ = Boolean(Number(valor));
  }

  toggleVisibility() {
    this.visible = !this.visible;
  }
}
