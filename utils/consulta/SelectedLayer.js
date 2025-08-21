import SelectedResource, { fromQueryParam } from './SelectedResource';

export default class SelectedLayer extends SelectedResource {
  constructor(options = {}) {
    const vars = ['uuid', 'estilo', 'opacidad', 'visible', 'posicion'];
    const _options = typeof options === 'string' ? fromQueryParam(options, vars) : options;
    super(_options);

    this.estilo = _options.estilo || undefined;
    this.opacidad = _options.opacidad || 1;
  }

  get asQueryParam() {
    return [this.uuid, this.estilo || '', this.opacidad, Number(this.visible)].join(',');
  }

  get opacidad() {
    return this.opacidad_;
  }
  set opacidad(valor) {
    this.opacidad_ = Number(valor);
  }

  updateOpacity(value) {
    this.opacidad = value;
  }
}
