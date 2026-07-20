<script setup>
const props = defineProps({
  topBarId: {
    type: Number,
    required: true,
  },
});

const { data: userData } = useAuth();
const { gnoxyUrl } = useGnoxyUrl();
const {
  crearLogoTopBar,
  actualizarLogoTopBar,
  eliminarLogoTopBar,
  reordenarLogosTopBar,
  fetchTopBar,
} = useTableroApi();

const logos = ref([]);
const cargando = ref(false);
const subiendo = ref(false);
const inputArchivo = ref(null);

// Estado del logo que se va a crear
const nuevoLink = ref('');
const nuevaUrlImagen = ref('');
const nuevoAlt = ref('');

async function cargar() {
  cargando.value = true;
  try {
    const tb = await fetchTopBar(props.topBarId);
    logos.value = tb.logos || [];
  } catch (e) {
    console.error('Error al cargar logos de banda:', e);
  } finally {
    cargando.value = false;
  }
}

async function subirArchivo(event) {
  const archivo = event.target.files?.[0];
  if (!archivo) return;

  subiendo.value = true;
  try {
    const form = new FormData();
    form.append('top_bar', String(props.topBarId));
    form.append('icon', archivo);
    if (nuevoLink.value) form.append('icon_link', nuevoLink.value);
    if (nuevoAlt.value) form.append('alt_text', nuevoAlt.value);
    form.append('stack_order', String(logos.value.length + 1));

    const creado = await crearLogoTopBar(form, userData.value?.accessToken);
    if (creado?.id) {
      logos.value.push(creado);
      nuevoLink.value = '';
      nuevaUrlImagen.value = '';
      nuevoAlt.value = '';
      if (inputArchivo.value) inputArchivo.value.value = '';
    } else {
      console.error('Error al crear logo de banda:', JSON.stringify(creado));
      alert(`Error al subir logo:\n${JSON.stringify(creado, null, 2)}`);
    }
  } catch (e) {
    console.error('Error al subir logo de banda:', e);
  } finally {
    subiendo.value = false;
  }
}

async function agregarUrlExterna() {
  if (!nuevaUrlImagen.value) return;

  subiendo.value = true;
  try {
    const form = new FormData();
    form.append('top_bar', String(props.topBarId));
    form.append('icon_url', nuevaUrlImagen.value);
    if (nuevoLink.value) form.append('icon_link', nuevoLink.value);
    if (nuevoAlt.value) form.append('alt_text', nuevoAlt.value);
    form.append('stack_order', String(logos.value.length + 1));

    const creado = await crearLogoTopBar(form, userData.value?.accessToken);
    if (creado?.id) {
      logos.value.push(creado);
      nuevoLink.value = '';
      nuevaUrlImagen.value = '';
      nuevoAlt.value = '';
    } else {
      alert(`Error:\n${JSON.stringify(creado, null, 2)}`);
    }
  } catch (e) {
    console.error('Error al agregar URL externa:', e);
  } finally {
    subiendo.value = false;
  }
}

async function actualizarCampo(logo, campo) {
  const form = new FormData();
  form.append(campo, logo[campo] || '');
  await actualizarLogoTopBar(logo.id, form, userData.value?.accessToken);
}

async function quitar(id) {
  if (!confirm('¿Eliminar este logo de la banda?')) return;
  const ok = await eliminarLogoTopBar(id, userData.value?.accessToken);
  if (ok) logos.value = logos.value.filter((l) => l.id !== id);
}

async function mover(idx, dir) {
  const nuevo = idx + dir;
  if (nuevo < 0 || nuevo >= logos.value.length) return;

  const copia = [...logos.value];
  [copia[idx], copia[nuevo]] = [copia[nuevo], copia[idx]];
  logos.value = copia.map((l, i) => ({ ...l, stack_order: i + 1 }));

  const items = logos.value.map((l) => ({ id: l.id, stack_order: l.stack_order }));
  await reordenarLogosTopBar(items, userData.value?.accessToken);
}

watch(() => props.topBarId, cargar, { immediate: true });
</script>

<template>
  <div class="subidor-logos-topbar">
    <h4 class="subidor-logos-topbar__subtitulo">Logos de la banda</h4>

    <div v-if="cargando"><GeocontenidosLoader mensaje="Cargando logos..." /></div>

    <ul v-else-if="logos.length" class="subidor-logos-topbar__lista">
      <li v-for="(logo, idx) in logos" :key="logo.id" class="subidor-logos-topbar__item">
        <img
          v-if="logo.icon || logo.icon_url"
          :src="logo.icon ? gnoxyUrl(logo.icon) : logo.icon_url"
          :alt="logo.alt_text || `Logo ${idx + 1}`"
          class="subidor-logos-topbar__preview"
        />
        <div v-else class="subidor-logos-topbar__sin-imagen">Sin imagen</div>

        <div class="subidor-logos-topbar__campos">
          <label :for="`topbar-alt-${logo.id}`" class="formulario-ayuda">Texto alternativo</label>
          <input
            :id="`topbar-alt-${logo.id}`"
            v-model="logo.alt_text"
            type="text"
            placeholder="Ej: Logo SENER"
            @blur="actualizarCampo(logo, 'alt_text')"
          />
          <label :for="`topbar-img-${logo.id}`" class="formulario-ayuda m-t-1"
            >URL imagen externa</label
          >
          <input
            :id="`topbar-img-${logo.id}`"
            v-model="logo.icon_url"
            type="url"
            placeholder="https://ejemplo.com/logo.svg"
            @blur="actualizarCampo(logo, 'icon_url')"
          />
          <label :for="`topbar-link-${logo.id}`" class="formulario-ayuda m-t-1"
            >Enlace al hacer clic</label
          >
          <input
            :id="`topbar-link-${logo.id}`"
            v-model="logo.icon_link"
            type="url"
            placeholder="https://"
            @blur="actualizarCampo(logo, 'icon_link')"
          />
        </div>

        <div class="subidor-logos-topbar__acciones">
          <button
            type="button"
            class="boton boton-secundario boton-chico"
            :disabled="idx === 0"
            @click="mover(idx, -1)"
          >
            ↑
          </button>
          <button
            type="button"
            class="boton boton-secundario boton-chico"
            :disabled="idx === logos.length - 1"
            @click="mover(idx, 1)"
          >
            ↓
          </button>
          <button type="button" class="boton boton-primario boton-chico" @click="quitar(logo.id)">
            <span class="pictograma-eliminar" />
          </button>
        </div>
      </li>
    </ul>

    <p v-else class="formulario-ayuda">No hay logos en la banda todavía.</p>

    <!-- Agregar nuevo logo -->
    <div class="subidor-logos-topbar__nuevo">
      <p class="formulario-etiqueta">Agregar logo</p>

      <div class="subidor-logos-topbar__nuevo-campos">
        <label for="topbar-nuevo-alt" class="formulario-ayuda">Texto alternativo</label>
        <input id="topbar-nuevo-alt" v-model="nuevoAlt" type="text" placeholder="Ej: Logo SENER" />
        <label for="topbar-nuevo-link" class="formulario-ayuda m-t-1">Enlace al hacer clic</label>
        <input id="topbar-nuevo-link" v-model="nuevoLink" type="url" placeholder="https://" />
      </div>

      <div class="subidor-logos-topbar__nuevo-opciones">
        <div class="subidor-logos-topbar__opcion">
          <p class="formulario-ayuda">Opción A — subir archivo</p>
          <input
            ref="inputArchivo"
            type="file"
            accept="image/*"
            :disabled="subiendo"
            @change="subirArchivo"
          />
        </div>

        <div class="subidor-logos-topbar__separador">o</div>

        <div class="subidor-logos-topbar__opcion">
          <label for="topbar-nuevo-url" class="formulario-ayuda"
            >Opción B — URL externa de imagen</label
          >
          <div class="subidor-logos-topbar__url-fila">
            <input
              id="topbar-nuevo-url"
              v-model="nuevaUrlImagen"
              type="url"
              placeholder="https://ejemplo.com/logo.svg"
              :disabled="subiendo"
            />
            <button
              type="button"
              class="boton boton-secundario boton-chico"
              :disabled="subiendo || !nuevaUrlImagen"
              @click="agregarUrlExterna"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      <p v-if="subiendo" class="formulario-ayuda">Guardando...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.subidor-logos-topbar {
  &__subtitulo {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-neutro-2, #e0e0e0);
  }

  &__lista {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
  }

  &__item {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    align-items: start;
    gap: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--color-neutro-2, #e0e0e0);
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }

  &__preview {
    width: 72px;
    height: 48px;
    object-fit: contain;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 4px;
  }

  &__sin-imagen {
    width: 72px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: #999;
    border: 1px dashed #ccc;
    border-radius: 4px;
  }

  &__campos {
    display: flex;
    flex-direction: column;

    input {
      margin-top: 0.15rem;
    }
  }

  &__acciones {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__nuevo {
    padding: 1rem;
    border: 1px dashed var(--color-neutro-2, #e0e0e0);
    border-radius: 6px;
    margin-top: 0.5rem;
  }

  &__nuevo-campos {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  &__nuevo-opciones {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__opcion {
    flex: 1;
    min-width: 200px;
  }

  &__separador {
    font-weight: bold;
    color: #999;
    padding: 0 0.5rem;
  }

  &__url-fila {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-top: 0.15rem;

    input {
      flex: 1;
    }
  }
}
</style>
