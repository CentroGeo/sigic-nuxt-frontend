<script setup>
import LayoutIA from "~/components/ia/LayoutIA.vue";
import PanelListas from "~/components/ia/PanelListas.vue";
import ListaChats from "~/components/ia/ListaChats.vue";
import LeyendaInicio from "~/components/ia/LeyendaInicio.vue";
import ContenedorChat from "~/components/ia/ContenedorChat.vue";

import { useIAStore } from "~/stores/ia.js";
const storeIA = useIAStore();
</script>
<template>
  <LayoutIA>
    <div class="grid">
      <div class="columna-4">
        <PanelListas>
          <ListaChats />
        </PanelListas>
      </div>

      <div class="columna-12">
        <LeyendaInicio v-if="!storeIA.existenProyectos" />

        <ContenedorChat v-else />
      </div>
    </div>
  </LayoutIA>
</template>
