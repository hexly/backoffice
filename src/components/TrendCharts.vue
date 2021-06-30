<template>
  <v-card>
    <v-toolbar color="secondary" dark>
      <v-toolbar-title>Charts & Graphs<sup>Beta</sup></v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <h5>Last 30 Days PSV</h5>
      <line-chart :data="dailyPSV"></line-chart>
      <v-divider></v-divider>
      <h5>Last 6 Periods Stats</h5>
      <line-chart :data="periodSet" :label="'adsfasfd'" :colors="['#75A7E6', '#E675C2', '#E6AD47']"></line-chart>
    </v-card-text>
  </v-card>
</template>

<script>
import _ from 'lodash'
import { TRENDS } from '@/graphql/Trends.gql'
const PERIODIC = 'PERIODIC'
const DAILY = 'DAILY'
export default {
  name: 'TrendCharts',
  props: {
    memberId: Number
  },
  data() {
    return {
      dailyPSV: {},
      periodSet: []
    }
  },
  apollo: {
    trends: {
      query: TRENDS,
      variables() {
        const dateTo = this.$moment().format('YYYY-MM-DD')
        const dateFrom = this.$moment().subtract(30, 'days').format('YYYY-MM-DD')
        return {
          input: {
            datasets: [
              {
                ref: PERIODIC.toLowerCase(),
                scale: PERIODIC,
                metrics: ['AWARDED'],
                filters: {
                  periodMemberIn: [
                    { memberId: this.memberId, periodId: 16 },
                    { memberId: this.memberId, periodId: 15 },
                    { memberId: this.memberId, periodId: 14 },
                    { memberId: this.memberId, periodId: 13 },
                    { memberId: this.memberId, periodId: 12 },
                    { memberId: this.memberId, periodId: 11 }
                  ]
                }
              },
              {
                ref: DAILY.toLowerCase(),
                scale: DAILY,
                metrics: ['STATS'],
                filters: {
                  memberIn: this.memberId,
                  dateFrom,
                  dateTo
                }
              }
            ]
          }
        }
      },
      client: 'federated',
      update({ engine: { bi: { data: { datasets } } } }) {
        const data = _.groupBy(datasets, 'ref')
        data[PERIODIC.toLowerCase()] = data[PERIODIC.toLowerCase()][0].data
        data[DAILY.toLowerCase()] = data[DAILY.toLowerCase()][0].data
        const psv = data.periodic.reduce((s, p) => {
          s[p.periodId] = p.awarded.psv || 0
          return s
        }, {})
        const dsv = data.periodic.reduce((s, p) => {
          s[p.periodId] = p.awarded.dsv || 0
          return s
        }, {})
        const gsv = data.periodic.reduce((s, p) => {
          s[p.periodId] = p.awarded.gsv || 0
          return s
        }, {})
        this.periodSet = [
          {
            label: 'PSV',
            data: psv
          },
          {
            label: 'DSV',
            data: dsv
          },
          {
            label: 'GSV',
            data: gsv
          }
        ]
        console.log(this.periodSet)
        const dailyPSV = data.daily.reduce((s, d) => {
          s[d.date] = d.stats.psv || 0
          return s
        }, {})
        this.dailyPSV = dailyPSV

        return data
      }
    }
  }
}
</script>

<style scoped>

</style>
