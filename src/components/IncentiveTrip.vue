<template>
  <v-card color="purple" class="white--text">
    <v-card-title primary-title>
      <div class="full">
        <span v-if="!loading" class="display-2">
          <span v-if="!loading" class="display-2">{{totalPoints}}/{{maxPoints}}</span>
          <p class="subheading">ZEN On The High Seas</p>
            <v-progress-linear :value="percentComplete" height="25" color="success"></v-progress-linear>
          </span>
        <span v-if="loading" class="display-2">
          <v-progress-circular indeterminate :size="30" :width="3" color="white"></v-progress-circular>
        </span>
      </div>
    </v-card-title>
  </v-card>
</template>

<script>
import SALES from '@/graphql/Sales.gql'
// ** WARNING **
// THIS IS A HARDCODED HACK! THIS IS NOT HOW WE WANT TO HANDLE INCENTIVE TRIPS
// ** WARNING **
export default {
  name: 'GreenHorizenTrip',
  data() {
    return {
      maxPoints: 50000,
      totalPoints: 0,
      percentComplete: 0,
      loading: true,
      sales: []
    }
  },
  apollo: {
    sales: {
      query: SALES,
      variables() {
        return {
          saleCondition: {
            sellerId: this.$store.state.user.principal.member.id,
            year: '2018'
          }
        }
      },
      update({ allSales }) {
        // Figure out June (6) - October (10)
        const sales = allSales.nodes
        sales.forEach(s => {
          if (s.month >= 6 && s.month <= 10) {
            this.totalPoints += s.commissionablePoints || 0
          }
        })
        this.percentComplete = this.totalPoints / this.maxPoints * 100
        this.loading = false
        return sales
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
v-card {
  overflow: hidden;
}
.full {
  width: 100%;
}
</style>
