<template>
  <div>
    <v-toolbar>
      <v-spacer/>
      <v-toolbar-title>Sales Charts</v-toolbar-title>
      <v-spacer/>
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
        :settings="{packages: ['bar']}"
        :data="chartData"
        :options="chartOptions"
        :createChart="(el, google) => new google.charts.Bar(el)"
        @ready="onChartReady"
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
      chartsLib: null,
      chartData: [
        ['Year', 'Sales', 'Expenses', 'Profit'],
        ['2014', 1000, 400, 200],
        ['2015', 1170, 460, 250],
        ['2016', 660, 1120, 300],
        ['2017', 1030, 540, 350]
      ]
    }
  },
  computed: {
    chartOptions () {
      if (!this.chartsLib) return null
      return this.chartsLib.charts.Bar.convertOptions({
        chart: {
          title: 'Company Performance',
          subtitle: 'Sales, Expenses, and Profit: 2014-2017'
        },
        bars: 'horizontal',
        hAxis: { format: 'decimal' },
        height: 400,
        colors: ['#1b9e77', '#d95f02', '#7570b3']
      })
    }
  },
  methods: {
    onChartReady (chart, google) {
      this.chartsLib = google
    }
  }
}
</script>

<style scoped>

</style>
