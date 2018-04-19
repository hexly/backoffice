<template>
  <div class="home">
    <h1>Dashboard</h1>
    <v-subheader>Sales</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex sm4 pa-3>
          <DashCard color="light-blue" darken="1" :display="'$' + personalSales.totalAmount" subheading="Personal" icon="person" />
        </v-flex>
        <v-flex sm4 pa-3>
          <DashCard color="indigo" darken="1" display="$450" subheading="Team" icon="people" />
        </v-flex>
        <v-flex sm4 pa-3>
          <DashCard color="pink" darken="1" :display="sales" subheading="Orders" icon="star" />
        </v-flex>
      </v-layout>
    </v-container>
    <v-subheader>Team</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex sm4 pa-3>
          <DashCard color="light-blue" darken="2" display="23" subheading="Size" icon="person_outline" />
        </v-flex>
        <v-flex sm4 pa-3>
          <DashCard color="indigo" darken="2" display="8" subheading="First Level" icon="people_outline" />
        </v-flex>
        <v-flex sm4 pa-3>
          <DashCard color="pink" darken="2" display="3" subheading="Joined this Month" icon="perm_contact_calendar" />
        </v-flex>
      </v-layout>
    </v-container>
    <h2>Daily Growth</h2>
    <line-chart :data="chartData"></line-chart>
  </div>
</template>

<script>
import getSales from '@/graphql/GetSales'
import DashCard from '@/components/DashboardCard.vue'

export default {
  name: 'home',
  components: {
    DashCard
  },
  data: () => ({
    chartData: [['Jan', 4], ['Feb', 2], ['Mar', 10], ['Apr', 5], ['May', 3]],
    allSales: []
  }),
  apollo: {
    allSales() {
      return getSales({
        sellerId: this.$store.state.user.principal.member.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      })
    }
  },
  computed: {
    personalSales() {
      return this.allSales.reduce(
        (t, s) => ({
          totalAmount: t.totalAmount + s.totalAmount,
          totalPoints: t.totalPoints + s.totalPoints,
          commissionableAmount: t.commissionableAmount + s.commissionableAmount,
          commissionableTotal: t.commissionableTotal + s.commissionableTotal
        }),
        {
          totalAmount: 0,
          totalPoints: 0,
          commissionableAmount: 0,
          commissionableTotal: 0
        }
      )
    },
    sales() {
      return this.allSales.length
    }
  }
}
</script>

<style scoped>

</style>
