export class GestionMarcadores {
  estaticos_ = {};
  almacenados_ = [];
  set almacenados(marcadores) {
    this.almacenados_ = marcadores;
    this.estaticos_ = Object.fromEntries(
      marcadores.map((marcador) => [String(marcador.id), JSON.stringify(marcador)])
    );
  }
  get almacenados() {
    return this.almacenados_;
    //.filter(({ geonode_id }) => !this.eliminarIds.includes(geonode_id));
  }

  almacenar = [];

  get actualizar() {
    return this.almacenados.filter(
      (marcador) => this.estaticos_[String(marcador.id)] !== JSON.stringify(marcador)
    );
  }

  get visualizar() {
    return [...this.almacenados, ...this.almacenar];
  }

  byId(id) {
    return this.visualizar.find((marcador) => String(marcador.id) === String(id));
  }

  get hayCambios() {
    return this.actualizar.length || this.almacenar.length;
    // || this.eliminar.length;
  }
}
