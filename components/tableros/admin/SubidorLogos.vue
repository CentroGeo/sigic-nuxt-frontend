<script setup>
const props = defineProps({
  siteId: {
    type: Number,
    required: true,
  },
});

const { data: userData } = useAuth();
const { gnoxyUrl } = useGnoxyUrl();
const { fetchLogosDeSitio, crearLogo, actualizarLogo, eliminarLogo, reordenarLogos } =
  useTableroApi();

const logos = ref([]);
const cargando = ref(false);
const subiendo = ref(false);
const inputArchivo = ref(null);
const linkNuevo = ref('');

async function cargar() {
  cargando.value = true;
  try {
    logos.value = await fetchLogosDeSitio(props.siteId);
  } catch (e) {
    console.error('Error al cargar logos:', e);
  } finally {
    cargando.value = false;
  }
}

async function subir(event) {
  const archivo = event.target.files?.[0];
  if (!archivo) return;

  subiendo.value = true;
  try {
    const form = new FormData();
    form.append('site', String(props.siteId));
    form.append('icon', archivo);
    if (linkNuevo.value) form.append('icon_link', linkNuevo.value);
    form.append('stack_order', String(logos.value.length + 1));

    const creado = await crearLogo(form, userData.value?.accessToken);
    if (creado?.id) {
      logos.value.push(creado);
      linkNuevo.value = '';
      if (inputArchivo.value) inputArchivo.value.value = '';
    } else {
      console.error('Error al crear logo – respuesta del servidor:', JSON.stringify(creado));
      alert(`Error al subir logo:\n${JSON.stringify(creado, null, 2)}`);
    }
  } catch (e) {
    console.error('Error al subir logo:', e);
  } finally {
    subiendo.value = false;
  }
}

async function actualizarLink(logo) {
  const form = new FormData();
  form.append('icon_link', logo.icon_link || '');
  await actualizarLogo(logo.id, form, userData.value?.accessToken);
}

async function quitar(id) {
  if (!confirm('¿Eliminar este logo?')) return;
  const ok = await eliminarLogo(id, userData.value?.accessToken);
  if (ok) logos.value = logos.value.filter((l) => l.id !== id);
}

async function mover(idx, dir) {
  const nuevo = idx + dir;
  if (nuevo < 0 || nuevo >= logos.value.length) return;

  const copia = [...logos.value];
  [copia[idx], copia[nuevo]] = [copia[nuevo], copia[idx]];
  logos.value = copia.map((l, i) => ({ ...l, stack_order: i + 1 }));

  const items = logos.value.map((l) => ({ id: l.id, stack_order: l.stack_order }));
  await reordenarLogos(items, userData.value?.accessToken);
}

watch(() => props.siteId, cargar, { immediate: true });
</script>

<template>
  <div class="subidor-logos">
    <div v-if="cargando"><GeocontenidosLoader mensaje="Cargando logos..." /></div>

    <ul v-else-if="logos.length" class="subidor-logos__lista">
      <li v-for="(logo, idx) in logos" :key="logo.id" class="subidor-logos__item">
        <img v-if="logo.icon" :src="gnoxyUrl(logo.icon)" :alt="`Logo ${idx + 1}`" />

        <div class="subidor-logos__datos">
          <label :for="`logo-link-${logo.id}`" class="formulario-ayuda">Enlace</label>
          <input
            :id="`logo-link-${logo.id}`"
            v-model="logo.icon_link"
            type="url"
            placeholder="https://"
            @blur="actualizarLink(logo)"
          />
        </div>

        <div class="subidor-logos__acciones">
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

    <p v-else class="formulario-ayuda">No hay logos cargados todavía.</p>

    <div class="subidor-logos__nuevo">
      <label for="subidor-logos-archivo">
        <span class="pictograma-agregar m-r-1" />
        Agregar logo
      </label>
      <input
        id="subidor-logos-archivo"
        ref="inputArchivo"
        type="file"
        accept="image/*"
        :disabled="subiendo"
        @change="subir"
      />
      <p v-if="subiendo" class="formulario-ayuda">Subiendo...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.subidor-logos {
  &__lista {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
  }

  &__item {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    border: 1px solid var(--color-neutro-2, #e0e0e0);
    border-radius: 6px;
    margin-bottom: 0.5rem;

    img {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }
  }

  &__acciones {
    display: flex;
    gap: 0.25rem;
  }

  &__nuevo {
    padding: 1rem;
    border: 1px dashed var(--color-neutro-2, #e0e0e0);
    border-radius: 6px;
  }
}
</style>
