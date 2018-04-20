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
          <DashCard color="indigo" darken="1" :display="'$' + team.totalTeamAmount" subheading="Team" icon="people" />
        </v-flex>
        <v-flex sm4 pa-3>
          <DashCard color="pink" darken="1" :display="sales" subheading="Orders" icon="star" />
        </v-flex>
      </v-layout>
    </v-container>
    <v-subheader>Team</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex sm6 pa-3>
          <DashCard color="light-blue" darken="2" :display="team.teamSize" subheading="Size" icon="person_outline" />
        </v-flex>
        <v-flex sm6 pa-3>
          <DashCard color="indigo" darken="2" :display="team.firstLevelSize" subheading="First Level" icon="people_outline" />
        </v-flex>
      </v-layout>
    </v-container>
    <!-- <v-container>
      <h2>Monthly Sales</h2>
      <line-chart :data="chartData"></line-chart>
    </v-container> -->
  </div>
</template>

<script>
import getSales from '@/graphql/GetSales'
import DashCard from '@/components/DashboardCard.vue'
import MONTHLY_STATS_QUERY from '@/graphql/GetMonthlyStats.gql'

export default {
  name: 'home',
  components: {
    DashCard
  },
  data: () => ({
    chartData: [['Jan', 4], ['Feb', 2], ['Mar', 10], ['Apr', 5], ['May', 3]],
    allSales: [],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    team: {}
  }),
  apollo: {
    allSales() {
      return getSales({
        sellerId: this.$store.state.user.principal.member.id,
        month: this.month,
        year: this.year
      })
    },
    team: {
      query: MONTHLY_STATS_QUERY,
      variables() {
        return {
          targetCondition: {
            sellerId: this.$store.state.user.principal.member.id,
            month: this.month,
            year: this.year
          },
          firstLevelCondition: {
            sponsorId: this.$store.state.user.principal.member.id,
            month: this.month,
            year: this.year
          }
        }
      },
      update({ targetStats }) {
        return targetStats.nodes[0]
      },
      fetchPolicy: 'cache-and-network'
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
