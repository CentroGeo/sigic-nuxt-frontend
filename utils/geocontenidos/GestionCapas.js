import { arrayNewsOlds, categoriesNamesInSpanish } from '~/utils/consulta';

export class GestionCapas {
  categoria = undefined;
  categorias = {};

  /**
   * Devuelve el listado de las categorias ordenadas alfabeticamente en español
   */
  get categoriasOrdenadas() {
    return Object.keys(this.categorias)
      .map((identifier) => [identifier, categoriesNamesInSpanish[identifier]])
      .sort((a, b) => a[1].localeCompare(b[1]));
  }

  estaticas_ = {};
  almacenadas_ = [];
  set almacenadas(capas) {
    this.almacenadas_ = capas;
    this.estaticas_ = Object.fromEntries(capas.map((capa) => [capa.id, JSON.stringify(capa)]));
  }
  get almacenadas() {
    return this.almacenadas_.filter(({ geonode_id }) => !this.eliminarIds.includes(geonode_id));
  }

  /**
   * Capas almacenadas en la escena con formato de selección
   */
  get seleccionAlmacenadas() {
    return this.almacenadas.map(({ geonode_id }) => `${this.categoria}-${geonode_id}`);
  }

  /**
   * Capas seleccionadas que aún no están almacenadas en la escena
   */
  // seleccionNoAlmacenadas = [];
  get seleccionNoAlmacenadas() {
    return this.almacenar.map(({ geonode_id, identifier }) => `${identifier}-${geonode_id}`);
  }

  /**
   * Capas seleccionadas junto con las almacenadas sin las que se van a eliminar en la escena
   * para los checkboxs del catálogo
   */
  get seleccion() {
    return [
      ...this.seleccionAlmacenadas.filter(
        (categoriaCapa) => !this.eliminarSeleccion.includes(categoriaCapa)
      ),
      ...this.seleccionNoAlmacenadas,
    ];
  }
  set seleccion(capas) {
    capas
      .filter((capa) => this.eliminarSeleccion.includes(capa))
      .forEach((capa) => {
        const eliminada = this.eliminar.find(
          ({ geonode_id }) => geonode_id === Number(capa.split('-')[1])
        );
        this.asociaElimimar(eliminada);
      });

    const { news, olds } = arrayNewsOlds(
      this.seleccionNoAlmacenadas,
      capas.filter((categoriaCapa) => !this.seleccionAlmacenadas.includes(categoriaCapa))
    );

    const agregar = news.map((categoriaCapa) => {
      const [identifier, pk] = categoriaCapa.split('-');

      return {
        ...capaAlmacenar,
        geonode_id: pk,
        dataset_title: this.categorias[identifier][pk].title,
        name: this.categorias[identifier][pk].alternate, //
        identifier,
      };
    });
    if (agregar.length > 0) this.almacenar.push(...agregar);

    const quitar = this.almacenar.filter(({ geonode_id, identifier }) =>
      olds.includes(`${identifier}-${geonode_id}`)
    );
    if (quitar.length > 0) this.almacenar.pop(...quitar);
  }

  /**
   * Capas seleccionadas con formato para visualizar en capas almacenadas (pero que aún no han
   * sido almacenadas)
   */
  almacenar = [];

  get comoAlmacenadas() {
    return [...this.almacenadas, ...this.almacenar];
  }

  get actualizar() {
    return this.almacenadas.filter((capa) => this.estaticas_[capa.id] !== JSON.stringify(capa));
  }

  eliminar = [];
  get eliminarIds() {
    return this.eliminar.map(({ geonode_id }) => geonode_id);
  }
  asociaElimimar(capa) {
    // Si la capa solo ha sido seleccionada pero no almacenada
    if (this.seleccionNoAlmacenadas.includes(`${capa.identifier}-${capa.geonode_id}`)) {
      this.almacenar.pop(capa);
      return;
    }

    // Si la capa no ha sido eliminada
    if (!this.eliminar.map(({ geonode_id }) => geonode_id).includes(capa.geonode_id)) {
      // agregar a eliminar
      this.eliminar.push(capa);
    } else {
      // quitar de eliminar
      this.eliminar.pop(capa);
    }
  }

  get eliminarSeleccion() {
    return this.eliminar.map(({ geonode_id }) => `${this.categoria}-${geonode_id}`);
  }

  get hayCambios() {
    return this.actualizar.length || this.almacenar.length || this.eliminar.length;
  }
}

export const capaAlmacenar = {
  // scene: undefined, // escena,
  // geonode_id: undefined, // pk,
  visible: true,
  opacity: 1,
  style: null, //
  style_title: null, //

  // id: -1, //
  // name: undefined, // categorias.datos[identifier][pk].alternate, //
  // dataset_title: undefined, // categorias.datos[identifier][pk].title, //
  // stack_order: -1, //
};
