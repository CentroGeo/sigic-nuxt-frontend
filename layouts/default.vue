<script setup>
import SisdaiNavegacionPrincipal from "@centrogeomx/sisdai-componentes/src/componentes/navegacion-principal/SisdaiNavegacionPrincipal.vue";
import SisdaiMenuAccesibilidad from "@centrogeomx/sisdai-componentes/src/componentes/menu-accesibilidad/SisdaiMenuAccesibilidad.vue";
import { useAccesibilidadStore } from "~/stores/accesibilidad";
const accesibilidadStore = useAccesibilidadStore();
</script>
<template>
  <div>
    <SisdaiNavegacionPrincipal>
      <!--Definiendo el logo del sitio-->
      <template #identidad>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-hiperviculo-logo"
        >
          <img
            src="https://www.centrogeo.org.mx/templates/ja_resume/images/logo_centrogeo_wide.svg"
            class="nav-logo color-invertir"
            alt="logo"
            width="232"
            height="38"
          />
        </a>
      </template>
      <ul class="nav-menu">
        <li>
          <NuxtLink 
            class="nav-hipervinculo"
            to="/" 
            exact-path
            >Inicio
          </NuxtLink>
        </li>
        <li>
          <NuxtLink 
            class="nav-hipervinculo"
            to="/carga" 
            >Carga
          </NuxtLink>
        </li>
        <li>
          <NuxtLink 
            class="nav-hipervinculo"
            to="/visualizacion"
            >Visualización
          </NuxtLink>
        </li>
        <li>
          <NuxtLink 
            class="nav-hipervinculo"
            to="/ia" 
            >IA
          </NuxtLink>
        </li>
      </ul>
    </SisdaiNavegacionPrincipal>
    <slot />
    <!-- parece que boton flotante agrega un id al elemento html que no 
    coincide al hacer server side rendering -->
    <client-only>
      <SisdaiMenuAccesibilidad 
        :objeto-store="accesibilidadStore" 
      />
    </client-only>
  </div>
</template>
