/**
 *
 * @param {Object} extent
 * @returns {Boolean} devuelve true cuando tiene geometría.
 */
export function tableHaveGeometry(coords) {
  const noGeometryExtent = [-1, -1, 0, 0].join('');

  return coords.join('') !== noGeometryExtent;
}
