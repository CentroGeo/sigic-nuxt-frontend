<script setup>
import SelectedLayer from '~/utils/consulta/SelectedLayer';

definePageMeta({ auth: false, key: 'inicio' });
const { signIn } = useAuth();

async function iniciarSesion() {
  await signIn('keycloak', {
    callbackUrl: '/',
  });
}

// Capas recientes
const storeResources = useResourcesCatalogoStore();
const storeSelected = useSelectedResources2Store();
const params = {
  'filter{resource_type}': 'dataset',
  'filter{has_geometry}': 'true',
};
storeResources.getResourcesByPage('dataLayer', 1, 4, params);

const obtenerMasRecientes = (type) => {
  return computed(() => storeResources.resourcesByType(type) || [{}]);
};

const config = useRuntimeConfig();
const isLoading = ref(true);
const capasMasRecientes = obtenerMasRecientes('dataLayer');

async function updateSelection(newPk, style) {
  storeSelected.reset();
  storeSelected.add(new SelectedLayer({ pk: newPk }), style, 'dataLayer');

  nextTick(async () => {
    await navigateTo('/consulta/capas');
  });
}
watch(
  capasMasRecientes,
  () => {
    isLoading.value = false;
  },
  { deep: true }
);

// Servicios IDEGeo
const servicios = [
  {
    icono: '/inicio/idegeo/analitca01.png',
    titulo: 'Geovisualización y analítica visual',
    descripcion:
      'Desarrollo de software de geovisualización y analítica visual para el análisis y la exploración de datos territoriales.',
  },
  {
    icono: '/inicio/idegeo/ide02.png',
    titulo: 'Infraestructuras de datos espaciales',
    descripcion:
      'Implementación de infraestructuras de datos espaciales para la gestión y distribución estandarizada de información geográfica.',
  },
  {
    icono: '/inicio/idegeo/geoportal03.png',
    titulo: 'Integración de geoportales',
    descripcion:
      'Integración de geoportales que centralicen y faciliten el acceso a información territorial de diversas fuentes.',
  },
  {
    icono: '/inicio/idegeo/geoprocessing04.png',
    titulo: 'Procesamiento geoespacial',
    descripcion:
      'Validación, estandarización y procesamiento de la información geoespacial para garantizar calidad y consistencia.',
  },
  {
    icono: '/inicio/idegeo/analisis05.png',
    titulo: 'Análisis espacial',
    descripcion:
      'Elaboración y representación de resultados de análisis espacial aplicados a problemáticas territoriales.',
  },
  {
    icono: '/inicio/idegeo/diseno06.png',
    titulo: 'Diseño cartográfico',
    descripcion:
      'Diseño cartográfico profesional para la comunicación clara y efectiva de información territorial.',
  },
  {
    icono: '/inicio/idegeo/historias07.png',
    titulo: 'Storytelling geoespacial',
    descripcion:
      'Construcción de narrativas interactivas basadas en datos geoespaciales para comunicar hallazgos de forma accesible.',
  },
  {
    icono: '/inicio/idegeo/dashboard08.png',
    titulo: 'Construcción de dashboards',
    descripcion:
      'Tableros de control interactivos para el monitoreo y seguimiento de indicadores territoriales.',
  },
];

// Logos de usuarios/clientes
const logosUsuarios = [
  { src: '/inicio/idegeo/logo_cdm_rojo.png', alt: 'CDM', width: '200px' },
  { src: '/inicio/idegeo/logo_ccmss.png', alt: 'CCMSS', width: '140px' },
  { src: '/inicio/idegeo/comunicaciones.png', alt: 'Comunicaciones', width: '280px' },
  { src: '/inicio/idegeo/logo-inei-peru.png', alt: 'INEI Perú', width: '120px' },
  { src: '/inicio/idegeo/teeb_agrifood.png', alt: 'TEEB Agrifood', width: '140px' },
  { src: '/inicio/idegeo/iica-logo.png', alt: 'IICA', width: '110px' },
  { src: '/inicio/idegeo/onu_habitat.png', alt: 'ONU Habitat', width: '200px' },
  { src: '/inicio/idegeo/inecc2.png', alt: 'INECC', width: '120px' },
  { src: '/inicio/idegeo/conafor_horizontal.png', alt: 'CONAFOR', width: '180px' },
  { src: '/inicio/idegeo/geoint2_geoint.png', alt: 'GeoINT', width: '50px' },
];
</script>

<template>
  <div>
    <main id="principal">
      <!-- ============================================ -->
      <!-- PORTADA                                      -->
      <!-- ============================================ -->
      <div class="idegeo-portada">
        <div class="idegeo-portada__bg">
          <img
            src="/inicio/idegeo/intro_background.svg"
            alt=""
            aria-hidden="true"
            class="idegeo-portada__bg-img"
          />
        </div>
        <div class="idegeo-portada__contenido">
          <h1 class="idegeo-portada__titulo">Plataforma de Información Geoespacial</h1>
          <p class="idegeo-portada__subtitulo">
            IDEGeo tiene como misión diseñar y desarrollar geoportales que faciliten la comunicación
            de información territorial de forma clara e intuitiva, promoviendo la toma de decisiones
            informadas y el análisis de problemáticas desde una perspectiva espacial.
          </p>
          <div class="idegeo-portada__acciones">
            <NuxtLink class="idegeo-btn idegeo-btn--primary" to="/catalogo">
              Catálogo geoespacial
            </NuxtLink>
            <NuxtLink class="idegeo-btn idegeo-btn--outline" to="/consulta">
              Ir al geovisor
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- SERVICIOS DE INFORMACIÓN GEOESPACIAL         -->
      <!-- ============================================ -->
      <section class="idegeo-seccion-banner">
        <div class="idegeo-seccion-banner__inner">
          <h2>Servicios de Información Geoespacial</h2>
        </div>
      </section>

      <section id="servicios" class="idegeo-servicios">
        <div class="contenedor" style="width: 100%">
          <div class="idegeo-servicios__grid">
            <article v-for="(servicio, i) in servicios" :key="i" class="idegeo-servicio-card">
              <div class="idegeo-servicio-card__icono">
                <img :src="servicio.icono" :alt="servicio.titulo" />
              </div>
              <h3 class="idegeo-servicio-card__titulo">{{ servicio.titulo }}</h3>
              <p class="idegeo-servicio-card__desc">{{ servicio.descripcion }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- ¿NECESITAS UN SERVICIO?                      -->
      <!-- ============================================ -->
      <section class="idegeo-seccion-banner">
        <div class="idegeo-seccion-banner__inner">
          <h2>¿Necesitas un servicio de información geoespacial?</h2>
        </div>
      </section>

      <section id="contacto" class="idegeo-contacto" style="width: 100%">
        <div class="contenedor ancho-fijo">
          <div class="idegeo-contacto__grid">
            <div class="idegeo-contacto__info">
              <h2>Contáctanos</h2>
              <div class="idegeo-contacto__tabla">
                <div class="idegeo-contacto__fila">
                  <span class="idegeo-contacto__nombre">Oscar Gerardo Sánchez Siordia</span>
                  <a href="mailto:osanchez@centrogeo.edu.mx" class="idegeo-contacto__correo">
                    osanchez@centrogeo.edu.mx
                  </a>
                </div>
                <div class="idegeo-contacto__fila">
                  <span class="idegeo-contacto__nombre">Jesus Trujillo Almeida</span>
                  <a href="mailto:jtrujillo@centrogeo.edu.mx" class="idegeo-contacto__correo">
                    jtrujillo@centrogeo.edu.mx
                  </a>
                </div>
              </div>
              <div class="idegeo-contacto__logos">
                <img src="/inicio/idegeo/logo_centrogeo_wide-white.png" alt="CentroGeo" />
                <img src="/inicio/idegeo/logo_idegeo_wide-white_72px.png" alt="IDEGeo" />
                <img src="/inicio/idegeo/geoint2_geoint_blanco.png" alt="GeoINT" />
              </div>
            </div>
            <div class="idegeo-contacto__imagen">
              <img
                src="/inicio/idegeo/servicios_idegeo.jpg"
                alt="Servicios IDEGeo"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- USUARIOS DE IDEGEO                           -->
      <!-- ============================================ -->
      <section class="idegeo-seccion-banner">
        <div class="idegeo-seccion-banner__inner">
          <h2>Usuarios de IDEGeo</h2>
        </div>
      </section>

      <section id="usuarios" class="idegeo-usuarios">
        <div class="contenedor ancho-fijo">
          <div class="idegeo-usuarios__logos">
            <img
              v-for="logo in logosUsuarios"
              :key="logo.alt"
              :src="logo.src"
              :alt="logo.alt"
              :style="{ maxWidth: logo.width }"
              class="idegeo-usuarios__logo-img"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- CAPAS RECIENTES (CATÁLOGO)                   -->
      <!-- ============================================ -->
      <section id="explora" class="idegeo-explora">
        <div class="contenedor ancho-lectura texto-centrado">
          <h2>Explora las últimas capas geográficas</h2>
          <p>
            Consulta lo más reciente del catálogo: datos geográficos listos para visualizar,
            compartir o descargar.
          </p>
        </div>
        <div class="contenedor ancho-fijo">
          <div v-if="isLoading" class="flex flex-contenido-centrado m-t-3">
            <img
              class="color-invertir"
              :src="`${config.app.baseURL}img/loader.gif`"
              alt="...Cargando"
              height="120px"
            />
          </div>
          <div v-if="!isLoading" class="flex">
            <div v-for="(capa, i) in capasMasRecientes" :key="i" class="columna-4">
              <div class="tarjeta">
                <img class="tarjeta-imagen" :src="capa.thumbnail_url" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Capa geográfica</p>
                  <p class="tarjeta-titulo">{{ capa.title }}</p>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div v-html="capa.abstract"></div>
                </div>
                <div class="tarjeta-pie">
                  <nuxt-link
                    class="boton boton-primario boton-chico"
                    aria-label="Ver capa en visualizador"
                    :to="`/consulta/capas?capas=${capa.pk}`"
                    @click.prevent="updateSelection(capa.pk, capa.default_style)"
                  >
                    Ver capa en visualizador
                  </nuxt-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- ============================================ -->
      <!-- CTA: ¿CON QUÉ QUIERES EMPEZAR?              -->
      <!-- ============================================ -->
      <section id="empezar" class="idegeo-cta">
        <div class="contenedor ancho-lectura texto-centrado">
          <h2>¿Con qué quieres empezar?</h2>
          <div class="flex">
            <button
              class="idegeo-btn idegeo-btn--primary idegeo-btn--lg columna-16"
              @click="iniciarSesion"
            >
              Crear una cuenta
            </button>
          </div>
          <h3>o también puedes ir a:</h3>
        </div>
        <div class="contenedor ancho-lectura texto-centrado flex">
          <nuxt-link class="idegeo-btn idegeo-btn--outline-dark columna-8" to="/consulta/capas">
            Visualizador de contenido
          </nuxt-link>
          <nuxt-link class="idegeo-btn idegeo-btn--outline-dark columna-8" to="/catalogo/explorar">
            Catálogo de información
          </nuxt-link>
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss">
/* ================================================================
   IDEGeo Landing Page Styles
   Paleta: rojo #db1631, dorado #ffd300/#f2d247,
           fondo oscuro #111, textos #151414
   ================================================================ */

$color-theme: #db1631;
$color-accent: #ffd300;
$color-accent-light: #f2d247;
$bg-dark: #111;
$bg-section: #eef1f7;
$text-dark: #151414;
$text-white: #fff;

/* ── Portada ── */
.idegeo-portada {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  background-color: $color-accent;

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  &__bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: right center;
  }

  &__contenido {
    position: relative;
    z-index: 1;
    max-width: 50%;
    margin: 0 40px;
    text-align: left;
  }

  &__titulo {
    font-family: 'Montserrat', sans-serif;
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 18px;
    color: $text-dark;
  }

  &__subtitulo {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.4;
    color: $text-dark;
    margin-bottom: 1.5rem;
  }

  &__acciones {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
}

/* ── Botones IDEGeo ── */
.idegeo-btn {
  display: inline-block;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.65rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
  border: 2px solid transparent;
  text-align: center;

  &--primary {
    background: $color-theme;
    color: $text-white;
    border-color: $color-theme;

    &:hover,
    &:focus {
      background: color-mix(in srgb, $color-theme, black 8%);
      border-color: color-mix(in srgb, $color-theme, black 8%);
    }
  }

  &--outline {
    background: transparent;
    color: $text-dark;
    border-color: $text-dark;

    &:hover,
    &:focus {
      background: $text-dark;
      color: $text-white;
    }
  }

  &--outline-dark {
    background: transparent;
    color: $color-theme;
    border-color: $color-theme;

    &:hover,
    &:focus {
      background: $color-theme;
      color: $text-white;
    }
  }

  &--lg {
    font-size: 1.1rem;
    padding: 0.8rem 2rem;
  }
}

/* ── Banner separador (parallax-style) ── */
.idegeo-seccion-banner {
  background-image: url('/inicio/idegeo/curvas_naranjas.jpg');
  background-attachment: fixed;
  background-position: center;
  background-repeat: repeat;
  background-size: cover;

  &__inner {
    background-color: rgba(19, 19, 19, 0.6);
    padding: 50px 15px;
    border-top: 10px solid $color-accent;
    border-bottom: 8px solid $color-accent-light;
    text-align: center;
  }

  h2 {
    color: $text-white;
    font-family: 'Montserrat', sans-serif;
    font-size: 2.5rem;
    font-weight: 500;
    margin: 0;
    line-height: 1.3;
  }
}

/* ── Servicios ── */
.idegeo-servicios {
  background: $bg-dark;
  padding: 4rem 0;

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}

.idegeo-servicio-card {
  text-align: center;
  padding: 1.5rem 1rem;
  border-radius: 8px;
  transition:
    transform 0.2s,
    background 0.2s;
  cursor: default;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.05);
  }

  &__icono {
    width: 74px;
    height: 74px;
    margin: 0 auto 1rem;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 50%;
      border: 2px solid #ee7532;
      padding: 4px;
      transition: border-color 0.2s;
    }
  }

  &:hover &__icono img {
    border-color: $color-accent;
  }

  &__titulo {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    color: $text-white;
    margin: 0 0 0.5rem;
  }

  &__desc {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.82rem;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.5;
    margin: 0;
  }
}

/* ── Contacto (split layout) ── */
.idegeo-contacto {
  background: #000;
  padding: 0;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 400px;
  }

  &__info {
    padding: 3rem 2.5rem;
    color: $text-white;
    display: flex;
    flex-direction: column;
    justify-content: center;

    h2 {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0 0 1.5rem;
    }
  }

  &__tabla {
    margin-bottom: 2rem;
  }

  &__fila {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__nombre {
    font-size: 1rem;
  }

  &__correo {
    color: $text-white;
    text-decoration: none;
    font-size: 1rem;

    &:hover {
      text-decoration: underline;
    }
  }

  &__logos {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    margin-top: 1rem;

    img {
      height: auto;
      max-height: 70px;
      object-fit: contain;

      &:first-child {
        max-width: 200px;
      }
      &:nth-child(2) {
        max-width: 130px;
      }
      &:last-child {
        max-width: 60px;
      }
    }
  }

  &__imagen {
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

/* ── Usuarios / Logos ── */
.idegeo-usuarios {
  background: $text-white;
  padding: 4rem 0;

  &__logos {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 2rem;
  }

  &__logo-img {
    height: auto;
    max-height: 80px;
    object-fit: contain;
    filter: grayscale(0.2);
    transition: filter 0.2s;

    &:hover {
      filter: grayscale(0);
    }
  }
}

/* ── Explora (capas recientes) ── */
.idegeo-explora {
  background: $bg-section;
  padding: 4rem 0;

  h2 {
    color: $text-dark;
  }

  p {
    color: rgba(0, 0, 0, 0.7);
  }
}

/* ── CTA final ── */
.idegeo-cta {
  background: $color-accent;
  padding: 4rem 0;

  h2 {
    color: $text-dark;
    font-family: 'Montserrat', sans-serif;
    margin-bottom: 1.5rem;
  }

  h3 {
    color: $text-dark;
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    margin: 1.5rem 0;
  }
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .idegeo-servicios__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .idegeo-portada {
    height: auto;
    min-height: 100vh;
    padding: 6rem 0 3rem;

    &__contenido {
      max-width: 90%;
      margin: 0 auto;
    }

    &__titulo {
      font-size: 1.5rem;
    }

    &__subtitulo {
      font-size: 1rem;
    }
  }

  .idegeo-seccion-banner h2 {
    font-size: 1.5rem;
  }

  .idegeo-contacto__grid {
    grid-template-columns: 1fr;
  }

  .idegeo-contacto__imagen {
    max-height: 300px;
  }

  .idegeo-servicios__grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
