<script setup>
import { computed, onBeforeMount, onMounted, ref, toRefs, watch, onUnmounted } from 'vue';
import opcionesDefault from '@centrogeomx/sisdai-componentes/src/componentes/menu-accesibilidad/opcionesDefault';

const STORAGE_KEY_CLASES = 'sisdai-a11y-clases';
const STORAGE_KEY_OVERRIDE = 'sisdai-a11y-override';

const props = defineProps({
  agregarOpciones: { type: Array, default: () => [] },
  objetoStore: { type: Object, default: () => {} },
  nombreModuloStore: { type: String, default: 'accesibilidad' },
  id: { type: String, default: 'menu_accesibilidad' },
  perfilColor: { type: String, default: 'predeterminada' },
});
const emits = defineEmits(['alSeleccionarOpcion', 'alRestablecer']);
const { agregarOpciones, objetoStore, perfilColor } = toRefs(props);

const opciones = computed(() => [...opcionesDefault, ...agregarOpciones.value]);

const menuAccesibilidadEstaAbierto = ref(false);
const clasesSelecciondas = ref([]);

// Indica si el montaje inicial ya terminó; solo después se guardan cambios en localStorage.
let mountComplete = false;

function ejecutarEnStore(accion, valor) {
  if (
    objetoStore.value !== undefined &&
    Object.prototype.hasOwnProperty.call(objetoStore.value, accion)
  ) {
    switch (accion) {
      case 'restablecer':
        objetoStore.value.restablecer();
        break;
      case 'modificarClasesAccesibles':
        objetoStore.value.modificarClasesAccesibles(valor);
        break;
    }
  }
}

function restablecer() {
  clasesSelecciondas.value = [];
  localStorage.removeItem(STORAGE_KEY_CLASES);
  localStorage.removeItem(STORAGE_KEY_OVERRIDE);
  emits('alRestablecer');
  ejecutarEnStore('restablecer');
}

watch(clasesSelecciondas, (nv, ov) => {
  ejecutarEnStore('modificarClasesAccesibles', nv);

  // Solo guardar cuando es una acción del usuario, no durante la inicialización
  if (mountComplete) {
    localStorage.setItem(STORAGE_KEY_CLASES, JSON.stringify(nv));
    localStorage.setItem(STORAGE_KEY_OVERRIDE, 'true');
  }

  alternarClasesBody();
  asignarTemaClaroUOscuro(nv, ov);
});

function alternarClasesBody() {
  clasesSelecciondas.value.includes('a11y-tipografia')
    ? body.classList.add('a11y-tipografia')
    : body.classList.remove('a11y-tipografia');
  clasesSelecciondas.value.includes('a11y-simplificada')
    ? body.classList.add('a11y-simplificada')
    : body.classList.remove('a11y-simplificada');
  clasesSelecciondas.value.includes('a11y-hipervinculos')
    ? body.classList.add('a11y-hipervinculos')
    : body.classList.remove('a11y-hipervinculos');
  clasesSelecciondas.value.includes('a11y-oscura')
    ? body.classList.add('a11y-oscura')
    : body.classList.remove('a11y-oscura');
}

const tema = ref('auto');
let body = {};

function agregarPerfilTemaPredeterminados() {
  body.setAttribute('data-perfil', perfilColor.value);
  body.setAttribute('data-tema', 'claro');
}
function setTemaClaro() {
  body.setAttribute('data-tema', 'claro');
}
function setTemaOscuro() {
  body.setAttribute('data-tema', 'oscuro');
}

function asignarTemaClaroUOscuro(nv, ov) {
  if (nv.find((clase) => clase === 'a11y-oscura') && !ov.find((clase) => clase === 'a11y-oscura')) {
    setTemaOscuro();
  }
  if (!nv.find((clase) => clase === 'a11y-oscura') && ov.find((clase) => clase === 'a11y-oscura')) {
    setTemaClaro();
  }
}

/**
 * Si el usuario tiene una preferencia guardada explícita, la usa.
 * De lo contrario, detecta el tema del sistema/dispositivo.
 */
function getTemaDispositivo() {
  const userOverride = localStorage.getItem(STORAGE_KEY_OVERRIDE);
  if (userOverride) {
    const savedClases = JSON.parse(localStorage.getItem(STORAGE_KEY_CLASES) || '[]');
    return savedClases.includes('a11y-oscura') ? 'oscura' : 'clara';
  }

  if (
    (window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches &&
      tema.value === 'auto') ||
    tema.value === 'oscura'
  ) {
    return 'oscura';
  }
  return 'clara';
}

function setClaseA11yOscura(temaClaroUOscuro) {
  if (temaClaroUOscuro === 'oscura' && !clasesSelecciondas.value.includes('a11y-oscura')) {
    clasesSelecciondas.value = [...clasesSelecciondas.value, ...['a11y-oscura']];
  }
  if (temaClaroUOscuro === 'clara' && clasesSelecciondas.value.includes('a11y-oscura')) {
    clasesSelecciondas.value = clasesSelecciondas.value.filter(
      (clases) => !clases.includes('a11y-oscura')
    );
  }
}

function setTemaEnDocumentoYLocalStorage() {
  localStorage.setItem('theme', tema.value);
  const temaClaroUOscuro = getTemaDispositivo();

  setClaseA11yOscura(temaClaroUOscuro);

  switch (temaClaroUOscuro) {
    case 'clara':
      setTemaClaro();
      break;
    case 'oscura':
      setTemaOscuro();
      break;
  }
}

onBeforeMount(() => {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .removeEventListener('change', setTemaEnDocumentoYLocalStorage);
});

onMounted(() => {
  body = document?.querySelector('body');
  agregarPerfilTemaPredeterminados();

  // Restaurar clases guardadas antes de detectar el tema del sistema
  const savedClases = localStorage.getItem(STORAGE_KEY_CLASES);
  if (savedClases !== null) {
    clasesSelecciondas.value = JSON.parse(savedClases);
  }

  setTemaEnDocumentoYLocalStorage();

  mountComplete = true;

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', setTemaEnDocumentoYLocalStorage);
});

onUnmounted(() => {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .removeEventListener('change', setTemaEnDocumentoYLocalStorage);
});

watch([perfilColor, tema], () => {
  setTemaEnDocumentoYLocalStorage();
});

function alternarAbiertoCerrado() {
  menuAccesibilidadEstaAbierto.value = !menuAccesibilidadEstaAbierto.value;
}

defineExpose({ alternarAbiertoCerrado, clasesSelecciondas });
</script>

<template>
  <div
    testid="menu-flotante"
    class="menu-flotante menu-flotante-derecho menu-accesibilidad"
    :class="{ abierto: menuAccesibilidadEstaAbierto }"
  >
    <button
      testid="menu-flotante-boton"
      type="button"
      class="menu-flotante-boton"
      aria-labelledby="herramientasaccesibilidadej"
      aria-controls="menua11yej"
      :aria-expanded="menuAccesibilidadEstaAbierto"
      @click="alternarAbiertoCerrado()"
    >
      <span class="pictograma-accesibilidad" aria-hidden="true"></span>
    </button>

    <div
      id="menua11yej"
      class="menu-flotante-contenedor"
      :aria-hidden="!menuAccesibilidadEstaAbierto"
    >
      <p id="herramientasaccesibilidadej" class="menu-flotante-titulo">
        Herramientas de accesibilidad
      </p>

      <div v-for="opcion in opciones" :key="opcion.titulo" testid="menu-flotante-opciones">
        <input
          :id="opcion.claseCss"
          v-model="clasesSelecciondas"
          testid="menu-flotante-input"
          type="checkbox"
          :value="opcion.claseCss"
          :tabindex="menuAccesibilidadEstaAbierto ? undefined : -1"
        />
        <label testid="menu-flotante-label" :for="opcion.claseCss">
          <span :class="opcion.icono" aria-hidden="true"></span>
          {{ opcion.titulo }}
        </label>
      </div>

      <button
        testid="boton-restablecer"
        type="button"
        class="boton-secundario boton-chico m-t-2"
        :tabindex="menuAccesibilidadEstaAbierto ? undefined : -1"
        :disabled="!clasesSelecciondas.length"
        @click="restablecer()"
      >
        Restablecer
      </button>
    </div>
  </div>
</template>
