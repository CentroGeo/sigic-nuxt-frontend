<script setup>
// TODO: demo recursos
// const { listaRecursos } = useDemoGeonodeResources();
// console.log("listaRecursos", listaRecursos);
const recursosFiltrados = ref([
  { id: "bash", nombre: "Bash" },
  { id: "c", nombre: "C" },
  { id: "cpp", nombre: "C++" },
  { id: "csharp", nombre: "C#" },
  { id: "css", nombre: "CSS" },
  { id: "dart", nombre: "Dart" },
  { id: "docker", nombre: "Docker" },
  { id: "elixir", nombre: "Elixir" },
  { id: "go", nombre: "Go" },
  { id: "graphql", nombre: "GraphQL" },
  { id: "html", nombre: "HTML" },
  { id: "java", nombre: "Java" },
  { id: "javascript", nombre: "JavaScript" },
  { id: "json", nombre: "JSON" },
  { id: "kotlin", nombre: "Kotlin" },
  { id: "markdown", nombre: "Markdown" },
  { id: "php", nombre: "PHP" },
  { id: "python", nombre: "Python" },
  { id: "r", nombre: "R" },
  { id: "ruby", nombre: "Ruby" },
  { id: "rust", nombre: "Rust" },
  { id: "scss", nombre: "SCSS" },
  { id: "shell", nombre: "Shell" },
  { id: "sql", nombre: "SQL" },
  { id: "swift", nombre: "Swift" },
  { id: "typescript", nombre: "TypeScript" },
  { id: "xml", nombre: "XML" },
  { id: "yaml", nombre: "YAML" },
]);
const recursosTipo = ref("dataLayer");
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 p-t-3">
        <CatalogoElementoFiltros
          :recursos-lista="recursosFiltrados"
          :recursos-tipo="recursosTipo"
          :categorias="[
            'categoría_0: capas',
            'categoría_1: tablas',
            'categoría_2: documentos',
          ]"
        />

        <h2>Explora</h2>
        <div class="flex">
          <!-- TODO: v-for por conjunto[totalCap,totalTab,totalDoc] -->
          <div class="columna-5">
            <a class="tarjeta tarjeta-hipervinculo-interno" href="#">
              <img
                class="tarjeta-imagen"
                src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/asha.jpg"
                alt=""
              />
              <div class="tarjeta-cuerpo">
                <p class="tarjeta-titulo">Capas geográficas</p>
                <p class="tarjeta-etiqueta">351 capas</p>
              </div>
            </a>
          </div>
          <div class="columna-5">
            <a class="tarjeta tarjeta-hipervinculo-interno" href="#">
              <img
                class="tarjeta-imagen"
                src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/becka.jpg"
                alt=""
              />
              <div class="tarjeta-cuerpo">
                <p class="tarjeta-titulo">Datos tabulados</p>
                <p>420 datos tabulados</p>
              </div>
            </a>
          </div>
          <div class="columna-5">
            <a class="tarjeta tarjeta-hipervinculo-interno" href="#">
              <img
                class="tarjeta-imagen"
                src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/baghira.jpg"
                alt=""
              />
              <div class="tarjeta-cuerpo">
                <p class="tarjeta-titulo">Documentos</p>
                <p>204 documentos</p>
              </div>
            </a>
          </div>
        </div>

        <h2>Lo más reciente</h2>
        <div class="flex">
          <!-- TODO: iterar por los más recientes -->
          <div class="columna-5">
            <div class="tarjeta">
              <img
                class="tarjeta-imagen"
                src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg"
                alt=""
              />
              <div class="tarjeta-cuerpo">
                <p class="tarjeta-etiqueta">Capa geográfica</p>
                <p class="tarjeta-titulo">Cuerpos de agua</p>
                <p>
                  Mapa interactivo: Rescate del Lago de Texcoco, diagnóstico
                </p>
              </div>
              <div class="tarjeta-pie">
                <button type="button" class="boton-primario boton-chico">
                  Ver Capa en visualizador
                </button>
              </div>
            </div>
          </div>
          <div class="columna-5">
            <div class="tarjeta">
              <img
                class="tarjeta-imagen"
                src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg"
                alt=""
              />
              <div class="tarjeta-cuerpo">
                <p class="tarjeta-etiqueta">Datos tabulados</p>
                <p class="tarjeta-titulo">Afluencia Diaria Trolebus</p>
                <p>Afluencia diaria desde enero de 2022 a Mayo de 2025</p>
              </div>
              <div class="tarjeta-pie">
                <button type="button" class="boton-primario boton-chico">
                  Ver archivo en visualizador
                </button>
              </div>
            </div>
          </div>
          <div class="columna-5">
            <div class="tarjeta">
              <img
                class="tarjeta-imagen"
                src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg"
                alt=""
              />
              <div class="tarjeta-cuerpo">
                <p class="tarjeta-etiqueta">Documento</p>
                <p class="tarjeta-titulo">Carpetas de investigación FGJ</p>
                <p>
                  Información actualizada de las carpetas de investigación de la
                  Fiscalía General de Justicia (FGJ)
                </p>
              </div>
              <div class="tarjeta-pie">
                <button type="button" class="boton-primario boton-chico">
                  Ver Documento en visualizador
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
