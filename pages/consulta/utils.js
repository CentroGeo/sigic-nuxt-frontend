function parametrosEnFormatoURL(params) {
  return Object.keys(params)
    // Filtrar valores con valor
    .filter((key) => params[key] !== undefined)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
}

export function urlParams(domino, parametros) {
  return `${domino}?${parametrosEnFormatoURL(parametros)}`
}