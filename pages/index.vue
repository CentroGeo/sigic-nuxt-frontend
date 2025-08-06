<script setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router';

definePageMeta({ auth: false, key: 'inicio' });
const { signIn } = useAuth();

async function iniciarSesion() {
  await signIn('keycloak', {
    callbackUrl: '/', // A dónde volver después del login
  });
}
const route = useRoute();

useHead({
  script: [
    {
      key: 'gobmx-script',
      src: 'https://framework-gb.cdn.gob.mx/gm/v3/assets/js/gobmx.js',
      defer: true,
    },
  ],
});
watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath === '/') {
      setTimeout(
        () => {
          document.body.classList.add('solo-en-index');
          if (!document?.querySelector('link[href*="framework-gb.cdn.gob.mx"]')) {
            const link = document?.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://framework-gb.cdn.gob.mx/gm/v3/assets/styles/main.css';
            document?.head.insertBefore(link, document.head.firstChild);
          }
        },

        500
      );
    } else {
      document.body.classList.remove('solo-en-index');
    }
  },
  { immediate: true }
);
onMounted(() => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://framework-gb.cdn.gob.mx/gm/v3/assets/styles/main.css';
  document.head.insertBefore(link, document.head.firstChild);
  if (route.path === '/') {
    document.body.classList.add('solo-en-index');
  }
});

onUnmounted(() => {
  document.body.classList.remove('solo-en-index');

  const agregadasPorFrameworkGogHead = [...document.head.children].filter(
    (el) =>
      (el.outerHTML.includes('framework-gb.cdn.gob.mx') && !el.outerHTML.includes('favicon.ico')) ||
      el.outerHTML.includes('ajax.googleapis.com/ajax/libs/webfont')
  );
  const agregadasPorFrameworkGogBody = [...document.body.children].filter(
    (el) =>
      el.outerHTML.includes('framework-gb.cdn.gob.mx') ||
      el.innerHTML.includes('framework-gb.cdn.gob.mx') ||
      el.outerHTML.includes('https://cdn.jsdelivr.net/npm') ||
      el.innerHTML.includes('https://cdn.jsdelivr.net/npm')
  );
  agregadasPorFrameworkGogHead.forEach((el) => el.remove());
  agregadasPorFrameworkGogBody.forEach((el) => el.remove());
  document.querySelector('body').className = '';
  document.querySelectorAll('div.pace').forEach((el) => el.remove());

  const vars_window = [
    'Pace',
    'Modernizr',
    '_addEvent',
    '_events',
    '_myLib',
    '$gmx',
    'html5',
    'yepnope',
    '$',
    'jQuery',
    'uidEvent',
    'bootstrap',
    'MX',
    'urlEmail',
    'getParseURL',
    'WebFont',
    'FloatingUICore',
    'FloatingUIDOM',
  ];
  for (const el of vars_window) {
    if (Object.prototype.hasOwnProperty.call(window, el)) {
      try {
        Reflect.deleteProperty(window, el);
      } catch {
        window[el] = undefined;
      }
    }
  }
});
</script>
<template>
  <div>
    <main id="principal">
      <div class="portada portada-secundaria">
        <img
          class="portada-imagen"
          src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/godo.jpg"
          alt=""
        />

        <div class="portada-degradado">
          <div class="portada-cuerpo">
            <h1 class="portada-titulo">
              Sistema Integral de Gestión de Información Científica (SIGIC)
            </h1>
            <strong class="portada-subtitulo">
              Integra, visualiza y aprovecha el conocimiento científico de México
            </strong>
          </div>
        </div>
      </div>

      <section id="que-es" class="m-y-10">
        <div class="contenedor ancho-lectura texto-centrado m-b-10">
          <h2>¿Qué es SIGIC?</h2>
          <p>
            SIGIC permite articular información estructurada de las ciencias, humanidades,
            tecnologías e innovación en un ecosistema digital que impulsa la toma de decisiones, el
            entendimiento territorial y la generación de nuevo conocimiento.
          </p>
          <p>
            Con módulos para visualizar capas, generar mapas, cargar información propia y aprovechar
            inteligencia artificial, SIGIC ofrece herramientas clave para investigar, planear y
            actuar con base en datos.
          </p>
        </div>
        <div class="contenedor ancho-fijo">
          <div class="flex">
            <div class="columna-8">
              <div class="tarjeta tarjeta-horizontal">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/pekibb.jpg"
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Visualiza información territorial</p>
                  <p>
                    Explora capas, datos y documentos desde una interfaz intuitiva. Filtra, consulta
                    y combina fuentes para generar mapas listos para descargar.
                  </p>
                </div>
                <div class="tarjeta-pie">
                  <NuxtLink class="boton-primario boton-chico" to="/consulta"
                    >Ir al visualizador</NuxtLink
                  >
                </div>
              </div>
            </div>
            <div class="columna-8">
              <div class="tarjeta tarjeta-horizontal">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/pekibb.jpg"
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Analiza con Inteligencia Artificial</p>
                  <p>
                    Crea proyectos, define contextos y conversa con tus datos en lenguaje natural.
                    La IA de SIGIC analiza, resume y entrega respuestas claras al instante.
                  </p>
                </div>
                <div class="tarjeta-pie">
                  <NuxtLink class="boton-primario boton-chico" to="/ia"
                    >Iniciar análisis con IA</NuxtLink
                  >
                </div>
              </div>
            </div>
            <div class="columna-8">
              <div class="tarjeta tarjeta-horizontal">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/pekibb.jpg"
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Explora los recursos disponibles</p>
                  <p>
                    Explora capas, tablas y documentos en un solo lugar. Accede a tus archivos y a
                    los públicos, ordénalos por tipo o fecha y encuentra rápidamente lo que buscas.
                  </p>
                </div>
                <div class="tarjeta-pie">
                  <NuxtLink class="boton-primario boton-chico" to="/catalogo"
                    >Ir al catálogo de información</NuxtLink
                  >
                </div>
              </div>
            </div>
            <div class="columna-8">
              <div class="tarjeta tarjeta-horizontal">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/pekibb.jpg"
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Usa tu propia información</p>
                  <p>
                    Carga tus capas, tablas o documentos y publícalos en el catálogo. Georreferencia
                    fácilmente y usa tus datos en mapas, proyectos o análisis dentro de SIGIC.
                  </p>
                </div>
                <div class="tarjeta-pie">
                  <NuxtLink class="boton-primario boton-chico" to="/catalogo"
                    >Ir a subir archivo</NuxtLink
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="que-hacer" class="m-y-10 fondo-color-acento p-y-5">
        <div class="contenedor ancho-lectura texto-centrado">
          <h2>¿Qué puedes hacer en SIGIC?</h2>
        </div>
        <div class="contenedor ancho-fijo">
          <div class="flex m-y-5-esc m-y-0-mov">
            <div class="columna-8 flex-vertical-centrado">
              <h3 class="texto-color-acento">Explorar información territorial diversa</h3>
              <picture class="oculto-esc">
                <img
                  loading="lazy"
                  class="borde-redondeado-20"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-3.jpg"
                  alt=""
                />
              </picture>
              <p>
                Consulta capas, tablas y documentos que puedes combinar fácilmente para entender
                patrones espaciales, fenómenos sociales o contextos específicos con la información
                científica del país.
              </p>
            </div>
            <div class="columna-8">
              <picture class="oculto-mov">
                <img
                  loading="lazy"
                  class="borde-redondeado-20"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-3.jpg"
                  alt=""
                />
              </picture>
            </div>
          </div>
          <div class="flex m-y-5-esc m-y-0-mov">
            <div class="columna-8">
              <picture>
                <img
                  loading="lazy"
                  class="oculto-mov"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/calamidad-3.jpg"
                  alt=""
                />
              </picture>
            </div>
            <div class="columna-8 flex-vertical-centrado">
              <h3 class="texto-color-acento">Profundizar en temas con ayuda de la IA</h3>
              <picture>
                <img
                  loading="lazy"
                  class="oculto-esc"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/calamidad-3.jpg"
                  alt=""
                />
              </picture>
              <p>
                Organiza la información en proyectos temáticos y analiza tus datos mediante
                consultas en lenguaje natural. La IA del SIGIC te ayuda a interpretar contextos
                complejos, generar síntesis, encontrar conexiones clave y preparar reportes
                descargables en formato PDF.
              </p>
            </div>
          </div>
          <div class="flex m-y-5-esc m-y-0-mov">
            <div class="columna-8 flex-vertical-centrado">
              <h3 class="texto-color-acento">Aprovechar tus propios datos dentro del ecosistema</h3>
              <picture class="oculto-esc">
                <img
                  loading="lazy"
                  class="borde-redondeado-20"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/perro-3.jpg"
                  alt=""
                />
              </picture>
              <p>
                Sube información en distintos formatos, agrégale un componente geográfico y úsala
                directamente en tus proyectos de IA, análisis o visualizaciones sin necesidad de
                herramientas externas.
              </p>
            </div>
            <div class="columna-8">
              <picture class="oculto-mov">
                <img
                  loading="lazy"
                  class="borde-redondeado-20"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/perro-3.jpg"
                  alt=""
                />
              </picture>
            </div>
          </div>
          <div class="flex m-y-5-esc m-y-0-mov">
            <div class="columna-8">
              <picture>
                <img
                  loading="lazy"
                  class="oculto-mov"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/asha.jpg"
                  alt=""
                />
              </picture>
            </div>
            <div class="columna-8 flex-vertical-centrado">
              <h3 class="texto-color-acento">Tener tu información ordenada y disponible</h3>
              <picture>
                <img
                  loading="lazy"
                  class="oculto-esc"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/asha.jpg"
                  alt=""
                />
              </picture>
              <p>
                Accede fácilmente a todos tus archivos personales o a datos públicos desde un solo
                catálogo. Filtra por tipo, tema o fecha, y encuentra lo que necesitas con el
                buscador integrado.
              </p>
            </div>
          </div>
          <div class="flex m-y-5-esc m-y-0-mov">
            <div class="columna-8 flex-vertical-centrado">
              <h3 class="texto-color-acento">
                Compartir tus visualizaciones mediante un enlace único
              </h3>
              <picture class="oculto-esc">
                <img
                  loading="lazy"
                  class="borde-redondeado-20"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-2.jpg"
                  alt=""
                />
              </picture>
              <p>
                ¿Quieres que tu equipo o colegas accedan exactamente a lo que estás viendo? Con un
                enlace único, puedes compartir tus tablas, documentos o capas con todos los detalles
                que hayas seleccionado.
              </p>
            </div>
            <div class="columna-8">
              <picture class="oculto-mov">
                <img
                  loading="lazy"
                  class="borde-redondeado-20"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-2.jpg"
                  alt=""
                />
              </picture>
            </div>
          </div>
        </div>
      </section>
      <section id="explora" class="m-y-10">
        <div class="contenedor ancho-lectura texto-centrado">
          <h2>Explora las últimas capas geográficas en SIGIC</h2>
          <p>
            Consulta lo más reciente del catálogo: datos geográficos listos para visualizar,
            compartir o descargar.
          </p>
        </div>
        <div class="contenedor ancho-fijo">
          <div class="flex">
            <div class="columna-4">
              <div class="tarjeta">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/asha.jpg"
                />

                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Salud</p>
                  <p class="tarjeta-titulo">
                    Infraestructura de salud pública en la Península de Yucatán
                  </p>
                  <p>Capa de puntos</p>
                </div>

                <div class="tarjeta-pie">
                  <NuxtLink class="boton-primario boton-chico"
                    >Abrir capa en el visualizador
                    <span class="pictograma-visualizador pictograma-chico"></span
                  ></NuxtLink>
                </div>
              </div>
            </div>

            <div class="columna-4">
              <div class="tarjeta">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/asha.jpg"
                />

                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Seguridad humana</p>
                  <p class="tarjeta-titulo">
                    Ubicación de refugios temporales activos – Temporada de lluvias 2024
                  </p>
                  <p>Capa de puntos</p>
                </div>

                <div class="tarjeta-pie">
                  <NuxtLink class="boton-primario boton-chico"
                    >Abrir capa en el visualizador
                    <span class="pictograma-visualizador pictograma-chico"></span
                  ></NuxtLink>
                </div>
              </div>
            </div>

            <div class="columna-4">
              <div class="tarjeta">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/asha.jpg"
                />

                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Energía y cambio climático</p>
                  <p class="tarjeta-titulo">
                    Áreas de riesgo por olas de calor extremas en el norte de México
                  </p>
                  <p>Capa de polígonos</p>
                </div>

                <div class="tarjeta-pie">
                  <NuxtLink class="boton-primario boton-chico"
                    >Abrir capa en el visualizador
                    <span class="pictograma-visualizador pictograma-chico"></span
                  ></NuxtLink>
                </div>
              </div>
            </div>

            <div class="columna-4">
              <div class="tarjeta">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/asha.jpg"
                />

                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Agua</p>
                  <p class="tarjeta-titulo">
                    Red de drenaje urbano – Zona metropolitana de Guadalajara
                  </p>
                  <p>Capa de líneas</p>
                </div>

                <div class="tarjeta-pie">
                  <NuxtLink class="boton-primario boton-chico"
                    >Abrir capa en el visualizador
                    <span class="pictograma-visualizador pictograma-chico"></span
                  ></NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="empezar" class="m-t-10 fondo-color-acento p-y-10">
        <div class="contenedor ancho-lectura texto-centrado">
          <h2>¿Con qué quieres empezar?</h2>
          <div class="flex">
            <button
              class="boton-primario boton-chico texto-centrado init-sesion columna-16"
              @click="iniciarSesion"
            >
              Crear una cuenta en SIGIC
            </button>
          </div>
          <h3>o también puedes ir a:</h3>
        </div>
        <div class="contenedor ancho-lectura texto-centrado flex">
          <a class="boton-secundario boton-chico texto-centrado init-sesion columna-8">
            Visualizador de contenido
          </a>
          <a class="boton-secundario boton-chico texto-centrado init-sesion columna-8">
            Análisis mediante IA
          </a>
          <a class="boton-secundario boton-chico texto-centrado init-sesion columna-8">
            Catálogo de información
          </a>
          <a class="boton-secundario boton-chico texto-centrado init-sesion columna-8">
            Subir mis propios archivos
          </a>
        </div>
      </section>
    </main>
  </div>
</template>
<style lang="scss" scoped>
.init-sesion {
  display: inline;
}
.solo-en-index {
  .contenido {
    padding-top: 54px;
  }
  nav.navegacion.navegacion-pegada {
    top: 54px;
  }
}

:root {
  --escala-rem-gob-sisdai: 0.65;
}
nav.navbar {
  padding-top: calc(var(--escala-rem-gob-sisdai) * 0.5rem);
  padding-bottom: calc(var(--escala-rem-gob-sisdai) * 0.5rem);
}
nav.navbar.navbar-fixed-top {
  z-index: 9999;
}
a.navbar-brand {
  margin-right: calc(var(--escala-rem-gob-sisdai) * 63rem);
  margin-top: 0;
  margin-bottom: 0;
  padding: 0 0 calc(var(--escala-rem-gob-sisdai) * 0.3125rem) 0 !important;
}
.navbar-expand-md .navbar-nav .nav-link {
  padding-right: calc(var(--escala-rem-gob-sisdai) * 0.5rem);
  padding-left: calc(var(--escala-rem-gob-sisdai) * 1.5rem);
  padding-top: calc(var(--escala-rem-gob-sisdai) * 1.8rem);
}
@media (min-width: 768px) and (max-width: 992px) {
  a.navbar-brand {
    margin-right: calc(var(--escala-rem-gob-sisdai) * 61rem);
  }
}
@media (min-width: 576px) and (max-width: 768px) {
  .navbar-dark .navbar-toggler {
    margin-right: calc(var(--escala-rem-gob-sisdai) * 9rem);
  }
  a.navbar-brand {
    margin-right: calc(var(--escala-rem-gob-sisdai) * 41rem);
  }
}
@media (max-width: 576px) {
  a.navbar-brand {
    margin-right: calc(var(--escala-rem-gob-sisdai) * 41rem);
  }
}
.navbar-toggler-icon {
  display: inline-block;
  width: calc(var(--escala-rem-gob-sisdai) * 1.5em);
  height: calc(var(--escala-rem-gob-sisdai) * 1.5em);
}
</style>
