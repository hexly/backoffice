<template>
  <v-flex xs12>
    <div class="sales">
      <h1>Sales</h1>
      <date-selector :year="year" :month="month" @date-changed="dateChanged"/>
      <v-data-table
        :headers="headers"
        :items="items"
        hide-actions
        class="elevation-1 "
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.date }}</td>
          <td>{{ props.item.total }}</td>
          <td>{{ props.item.points }}</td>
          <td>{{ props.item.comTotal }}</td>
          <td>{{ props.item.comPoints }}</td>
        </template>
      </v-data-table>
    </div>
  </v-flex>
</template>

<script>
import DateSelector from '@/components/DateSelector.vue'
import SALES from '@/graphql/Sales.gql'
import map from 'rambda/lib/map'

export default {
  components: {
    DateSelector
  },
  data() {
    return {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      allSales: [],
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Sale Total', value: 'total' },
        { text: 'Total Points', value: 'points' },
        { text: 'Commissionable Total', value: 'comTotal' },
        { text: 'Commissionable Points', value: 'comPoints' }
      ]
    }
  },
  apollo: {
    allSales: {
      query: SALES,
      variables() {
        return {
          saleCondition: {
            sellerId: this.$store.state.user.principal.member.id,
            month: this.month,
            year: this.year
          }
        }
      },
      update({ allSales }) {
        return allSales.nodes
      }
    }
  },
  methods: {
    dateChanged({ date }) {
      const dateSplit = date.split('-')
      this.month = dateSplit[1]
      this.year = dateSplit[0]
    }
  },
  computed: {
    items() {
      return map(sale => {
        return {
          date: `${sale.month}/${sale.day}/${sale.year}`,
          total: sale.totalAmount,
          points: sale.totalPoints,
          comTotal: sale.commissionableAmount,
          comPoints: sale.commissionablePoints
        }
      }, this.allSales)
    }
  }
}
</script>
