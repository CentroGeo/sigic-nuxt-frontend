export default class ConfiguracionOtro {
  separador_ = ',';

  fromQueryParam(queryParam) {
    const [uuid, isSelected] = queryParam.split(this.separador_);
    return { uuid, isSelected };
  }

  constructor(opciones = {}) {
    const { uuid, isSelected } =
      typeof opciones === 'string' ? this.fromQueryParam(opciones) : opciones;

    this.isSelected = Number(isSelected) || 0;
    this.uuid = uuid || '';
  }

  get asQueryParam() {
    // return `${this.estilo || ''},${this.opacidad},${this.visible}`;
    return [this.uuid, this.isSelected].join(this.separador_);
  }

  setSelected(newValue) {
    this.isSelected = newValue;
  }
}
