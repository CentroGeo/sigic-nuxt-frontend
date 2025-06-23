<script setup></script>
<template>
  <div class="grid">
    <div class="columna-4">
      <nav
        class="menu-lateral"
        :class="{ abierto: menu_abierto }"
        aria-label="Menú secundario"
      >
        <button
          type="button"
          class="menu-lateral-boton"
          aria-label="Navegación secundaria"
          :aria-controls="id_aleatorio"
          :aria-expanded="menu_abierto ? 'true' : 'false'"
          @click="menu_abierto = !menu_abierto"
        >
          <span class="pictograma-angulo-derecho" aria-hidden="true"></span>
        </button>

        <div
          :id="id_aleatorio"
          class="menu-lateral-contenedor"
          :aria-hidden="menu_abierto ? 'false' : 'true'"
          ref="contenidoMenuLateral"
        >
          <slot name="contenido-menu-lateral">
            <ul>
              <li>
                <NuxtLink to="/ia/panel/proyectos">Proyectos</NuxtLink>
              </li>
            </ul>
          </slot>
        </div>
      </nav>
    </div>

    <div class="columna-8">
      <main>
        <NuxtPage />
      </main>
    </div>
  </div>
</template>
