<script setup>
// TODO: añadir selector a tipo de archivo a filtros y mejorar tabla
import { resourceTypeDic } from '~/utils/consulta';
const storeFetched = useFetchedResources2Store();

storeFetched.checkFilling(resourceTypeDic.dataTable);
storeFetched.checkFilling(resourceTypeDic.document);

// // para filtar por los archivos de la usuaria
const { data } = useAuth();
const userEmail = data.value.user.email;
// obteniendo datos por las props de la tabla
const datos = computed(() =>
  storeFetched.all
    .filter((resource) => resource.owner.email === userEmail)
    .map((d) => ({
      pk: d.pk,
      titulo: d.title,
      // tipo_recurso: d.resource_typed.resource_type,
      tipo_recurso: isGeometricExtension(d.extent) ? 'Capa geográfica' : 'Dato tabulado',
      categoria: d.category,
      actualizacion: d.last_updated,
      acciones: 'Editar, Ver, Descargar, Remover',
      enlace_descarga: d.download_url,
    }))
);
// obteniendo las variables keys para la tabla
const variables = ['pk', 'titulo', 'tipo_recurso', 'categoria', 'actualizacion', 'acciones'];
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="contenedor m-b-10 m-t-3">
        <!-- <CatalogoElementoFiltros
          :recursos-lista="recursosFiltrados"
          :recursos-tipo="recursosTipo"
        /> -->

        <div class="flex">
          <h2>Todos mis archivos</h2>
          <UiNumeroElementos :numero="datos.length" />
        </div>
        <div class="flex">
          <div class="columna-15">
            <ClientOnly>
              <UiTablaAccesibleV2 :variables="variables" :datos="datos" />
              <UiPaginador :total-paginas="1" @cambio="1" />
            </ClientOnly>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
