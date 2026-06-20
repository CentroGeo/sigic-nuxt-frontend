import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  BarChart,
  PieChart,
  TreemapChart,
  LineChart,
  ScatterChart,
  GaugeChart,
  RadarChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  RadarComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

use([
  CanvasRenderer,
  BarChart,
  PieChart,
  TreemapChart,
  LineChart,
  ScatterChart,
  GaugeChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  RadarComponent,
]);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VChart', VChart);
});
