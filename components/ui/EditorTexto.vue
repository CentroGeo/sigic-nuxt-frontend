<template>
  <ClientOnly>
    <component
      class="editor-texto"
      :is="Ckeditor"
      v-if="editor && config.plugins.length > 0"
      v-model="contenido"
      :editor="editor"
      :config="config"
    />
  </ClientOnly>
</template>

<script setup>
import { Ckeditor } from '@ckeditor/ckeditor5-vue';
import CkeditorConfig from '~/utils/geocontenidos/CkeditorConfig';

const contenido = defineModel({ type: String, default: '' });
const editor = shallowRef(null);
const config = reactive(CkeditorConfig);

onMounted(async () => {
  const {
    ClassicEditor,
    Autosave,
    Essentials,
    Paragraph,
    List,
    TodoList,
    MediaEmbed,
    Link,
    AutoLink,
    BlockQuote,
    HorizontalLine,
    Indent,
    IndentBlock,
    Alignment,
    GeneralHtmlSupport,
    MediaEmbedStyle,
    MediaEmbedToolbar,
    ImageStyle,
    ImageBlock,
    ImageToolbar,
    Highlight,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    Superscript,
    Subscript,
    Code,
    Strikethrough,
    Underline,
    Italic,
    ImageInline,
    Heading,
    CodeBlock,
    Style,
    ImageUpload,
    CloudServices,
    ImageInsertViaUrl,
    AutoImage,
    LinkImage,
    ImageCaption,
    ImageTextAlternative,
    Table,
    TableToolbar,
    TableCaption,
    PlainTableOutput,
    HtmlComment,
    SourceEditing,
    ShowBlocks,
    Bold,
  } = await import('ckeditor5');

  editor.value = ClassicEditor;
  config.plugins = [
    Alignment,
    AutoImage,
    AutoLink,
    Autosave,
    BlockQuote,
    Bold,
    CloudServices,
    Code,
    CodeBlock,
    Essentials,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    GeneralHtmlSupport,
    Heading,
    Highlight,
    HorizontalLine,
    HtmlComment,
    ImageBlock,
    ImageCaption,
    ImageInline,
    ImageInsertViaUrl,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    Indent,
    IndentBlock,
    Italic,
    Link,
    LinkImage,
    List,
    MediaEmbed,
    MediaEmbedStyle,
    MediaEmbedToolbar,
    Paragraph,
    PlainTableOutput,
    ShowBlocks,
    SourceEditing,
    Strikethrough,
    Style,
    Subscript,
    Superscript,
    Table,
    TableCaption,
    TableToolbar,
    TodoList,
    Underline,
  ];
});
</script>

<style lang="scss">
@import 'ckeditor5/ckeditor5.css';

.ck-editor
  .ck-editor__top
  .ck-sticky-panel
  .ck-sticky-panel__content.ck-sticky-panel__content_sticky {
  top: 52px !important;
}
</style>
