<script setup>
const proyecto = {
  nombre: "Agua",
  privado: true,
};
const listaContexto = [
  {
    nombre: "Contexto 1",
    enlace: "#",
    fuentes: "3 fuentes",
  },
  {
    nombre: "Agua de la región sureste",
    enlace: "/agua-de-la-region-sureste/",
    fuentes: "10 fuentes",
  },
  {
    nombre: "Contexto 3",
    enlace: "#",
    fuentes: "3 fuentes",
  },
  {
    nombre: "Contexto 4",
    enlace: "#",
    fuentes: "10 fuentes",
  },
];
</script>

<template>
  <main>
    <div class="flex">
      <div class="columna-4 columna-1-mov menu-lateral-fondo">
        <nav class="menu-lateral">
          <div class="menu-lateral-contenedor">
            <NuxtLink to="/inteligencia-artificial">
              <span class="pictograma-flecha-izquierda" aria-hidden="true" />
              Regresar al proyecto
            </NuxtLink>
            <p>{{ proyecto.nombre }}</p>
            <p v-if="proyecto.privado">
              Privado <span class="pictograma-ayuda" aria-hidden="true" />
            </p>
            <ul>
              <li v-for="contexto in listaContexto" :key="contexto.nombre">
                <a
                  :href="contexto.enlace"
                  tabindex=""
                  :class="{
                    /*
                'router-link-exact-active router-link-active': isActive(
                  page.relativePath,
                  item.link
                ),*/
                  }"
                >
                  <p>{{ contexto.nombre }}</p>
                  <p class="fuentes">{{ contexto.fuentes }}</p>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <div class="contenedor columna-12 columna-7-mov">
        <div>
          <h1>Chat SIGIC</h1>
          <h2>Proyecto seleccionado: {{ proyecto.nombre }}</h2>
        </div>

        <div>
          <!-- showChatBar -->
          <!-- showDateIncorrect -->
          <!-- chatLog -->
          <!-- showChatLoader -->
        </div>

        <div>
          <form @submit.prevent>
            <label for="area-idcreadoautomaticamente" class="a11y-solo-lectura">
              Nombre de la etiqueta
            </label>

            <textarea
              id="area-idcreadoautomaticamente"
              placeholder="Envía un mensaje"
            />
            <button
              class="boton-pictograma boton-con-contenedor-primario"
              aria-label="Enviar mensaje"
              type="button"
            >
              <span class="pictograma-ayuda" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>
