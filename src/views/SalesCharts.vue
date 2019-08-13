<template>
  <div>
    <v-toolbar>
      <v-toolbar-title>Sales Charts</v-toolbar-title>
    </v-toolbar>
    <div>
      <GChart
      class="pa-2 ma-2"
      type="ColumnChart"
      :data="chartData"
      :options="chartOptions"
      />
    </div>
    <div>
      <GChart
      class="pa-2 ma-2"
      type="ColumnChart"
      :data="chartData"
      :options="chartOptions"
      />
    </div>
    <div>
      <GChart
      class="pa-2 ma-2"
      type="ColumnChart"
      :data="chartData"
      :options="chartOptions"
      />
    </div>
    <div>
      <GChart
      class="pa-2 ma-2"
      type="ColumnChart"
      :data="chartData"
      :options="chartOptions"
      />
    </div>
    <div>
      <GChart
      class="pa-2 ma-2"
      type="ColumnChart"
      :data="chartData"
      :options="chartOptions"
      />
    </div>
    <div>
      <GChart
      class="pa-2 ma-2"
      type="ColumnChart"
      :data="chartData"
      :options="chartOptions"
      />
    </div>
  </div>
</template>

<script>
import { GChart } from 'vue-google-charts'

export default {
  name: 'SalesCharts',
  components: { GChart },
  data () {
    return {
      chartData: [
        ['Year', 'Sales', 'Expenses', 'Profit'],
        ['2014', 1000, 400, 200],
        ['2015', 1170, 460, 250],
        ['2016', 660, 1120, 300],
        ['2017', 1030, 540, 350]
      ],
      chartOptions: {
        title: 'Company Performance'
      }
    }
  }
}
</script>

<style scoped>
.v-card {
  max-width: 500px;
}
</style>
