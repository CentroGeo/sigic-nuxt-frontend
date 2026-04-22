<script setup>
import { QuillEditor } from '@vueup/vue-quill';

const content = defineModel({
  type: String,
  default: '',
});
</script>

<template>
  <ClientOnly>
    <QuillEditor
      v-model:content="content"
      theme="snow"
      content-type="html"
      placeholder="Escribe el contenido narrativo"
    />
  </ClientOnly>
</template>

<style lang="scss">
.ql-container.ql-snow {
  height: 148px;
}
</style>
