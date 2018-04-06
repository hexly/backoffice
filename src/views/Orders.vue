<template>
  <v-flex xs12>
    <div class="about">
      <h1>Sales</h1>
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
import ALL_SALES from '@/graphql/Sales.gql'
import map from 'rambda/lib/map'

export default {
  data() {
    return {
      allSales: [],
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Sale Total', value: 'total' },
        { text: 'Commissionable Total', value: 'comTotal' },
        { text: 'Total Points', value: 'points' },
        { text: 'Commissionable Points', value: 'comPoints' }
      ]
    }
  },
  apollo: {
    allSales: {
      query: ALL_SALES,
      variables() {
        return {
          saleCondition: {
            sellerId: this.$store.state.user.principal.member.id,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
          }
        }
      },
      update({ allSales }) {
        return allSales.nodes
      }
    }
  },
  computed: {
    items() {
      return map(sale => {
        return {
          date: `${sale.month}/${sale.day}/${sale.year}`,
          total: sale.totalAmount,
          comTotal: sale.commissionableAmount,
          points: sale.totalPoints,
          comPoints: sale.commissionablePoints
        }
      }, this.allSales)
    }
  }
}
</script>
