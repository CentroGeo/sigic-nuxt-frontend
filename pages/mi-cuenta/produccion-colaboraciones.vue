<script setup>
definePageMeta({
  middleware: 'auth',
});
const lista_proyectos = ref([
  {
    titulo: 'Biodiversidad marina en el Golfo de México',
    rol: 'Investigadora',
    anio_periodo: '2020-2022',
    enlace: 'https://proyectos.ejemplo.com/mx/biodiversidad-marina-golfo-mex',
  },
  {
    titulo: 'Monitoreo comunitario de manglares en la costa norte de Yucatán',
    rol: 'Representante de CONABIO',
    anio_periodo: '2024',
    enlace: 'https://conabio.gob.mx/proyectos/manglares-yucatan',
  },
]);
const lista_publicaciones = ref([
  {
    titulo: 'Restauración ecológica en sistemas de manglar del sureste de México',
    medio: 'Revista Mexicana de Biodiversidad',
    anio_periodo: '2023',
    enlace: 'https://publicacion.ejemplo.com/mx/biodiversidad/restauracion-manglares-2023',
  },
  {
    titulo: 'Indicadores espaciales para la conservación de ecosistemas prioritarios en México',
    medio: 'Ecología Aplicada Latinoamericana',
    anio_periodo: '2022',
    enlace: 'https://ecolatam.org/publicaciones/conservacion-ecosistemas-prioritarios-mx-2022',
  },
]);
const lista_colaboraciones = ref([
  {
    titulo: 'Programa Interinstitucional para la Restauración de Manglares',
    rol: 'Representante de CONABIO',
    anio_periodo: '2020-2023',
    instituciones: 'CONABIO, SEMARNAT, Universidad Veracruzana, WWF México',
    enlace: 'https://colaboraciones.ejemplo.com/mx/programa-restauracion-manglares',
  },
]);
</script>
<template>
  <div>
    <h2>Producción y colaboraciones</h2>
    <div class="p-x-7">
      <h3>Proyectos y fondos SECIHTI</h3>

      <MiCuentaProductosTarjeta
        v-for="(proyecto, i) in lista_proyectos"
        :key="i"
        :titulo="proyecto.titulo"
        :rol="proyecto.rol"
        :anio_periodo="proyecto.anio_periodo"
        :enlace="proyecto.enlace"
      ></MiCuentaProductosTarjeta>
      <h3>Publicaciones</h3>
      <MiCuentaProductosTarjeta
        v-for="(proyecto, i) in lista_publicaciones"
        :key="i"
        :titulo="proyecto.titulo"
        :medio="proyecto.medio"
        :anio_periodo="proyecto.anio_periodo"
        :enlace="proyecto.enlace"
      ></MiCuentaProductosTarjeta>
      <h3>Colaboraciones</h3>
      <MiCuentaProductosTarjeta
        v-for="(proyecto, i) in lista_colaboraciones"
        :key="i"
        :titulo="proyecto.titulo"
        :rol="proyecto.rol"
        :anio_periodo="proyecto.anio_periodo"
        :instituciones="proyecto.instituciones"
        :enlace="proyecto.enlace"
      ></MiCuentaProductosTarjeta>
    </div>
  </div>
</template>
