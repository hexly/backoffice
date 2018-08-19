<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <month-selector :year="year" :month="month" @date-changed="dateChanged"/>
    <v-subheader>Sales</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <span>
        </span>
        <v-flex sm4 pa-3>
          <DashCard :loading="$apollo.queries.teamStats.loading" color="light-blue" darken="1" :display="`$${teamStats.personal.totalAmount}`" subheading="Personal" icon="person" />
        </v-flex>
        <v-flex sm4 pa-3>
          <DashCard :loading="$apollo.queries.teamStats.loading" color="indigo" darken="1" :display="`$${team.totalTeamAmount}`" subheading="Team" icon="people" />
        </v-flex>
        <v-flex sm4 pa-3>
          <DashCard :loading="$apollo.queries.teamStats.loading" color="pink" darken="1" :display="teamStats.personal.sales" subheading="Sales" icon="star" />
        </v-flex>
      </v-layout>
    </v-container>
    <v-subheader>Team</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex sm6 pa-3>
          <DashCard :loading="$apollo.queries.teamStats.loading" color="light-blue" darken="2" :display="team.teamSize" subheading="Size" icon="person_outline" />
        </v-flex>
        <v-flex sm6 pa-3>
          <DashCard :loading="$apollo.queries.teamStats.loading" color="indigo" darken="2" :display="teamStats.firstLevel.size" subheading="First Level" icon="people_outline" />
        </v-flex>
      </v-layout>
    </v-container>
    <div v-if="incentiveTrip">
      <v-subheader>Incentive Trip</v-subheader>
      <v-container fluid grid-list-xs>
        <v-layout row wrap>
          <v-flex>
            <IncentiveTrip />
          </v-flex>
        </v-layout>
      </v-container>
    </div>
    <v-subheader>Leaderboards</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex sm6 pa-3>
          <LeaderBoard :leaders="MonthlySalesLeaders" title="Monthly Sales Leaders" :showTotal="false"/>
        </v-flex>
        <v-flex sm6 pa-3>
          <LeaderBoard :leaders="MonthlyFrontlineLeaders" title="Monthly Frontline Leaders"/>
        </v-flex>
      </v-layout>
    </v-container>
    <v-dialog
      v-model="showAddressDialog"
      max-width="290"
      persistent
    >
      <v-card>
        <v-card-title class="headline">We need your address</v-card-title>

        <v-card-text>
          Welcome Back to your backoffice. Since last time you were here we've added the ability to input your address. Please go to your profile page and update your address!
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            flat="flat"
            @click="$router.push('/profile')"
          >
            Profile Page
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import DashCard from '@/components/DashboardCard.vue'
import LeaderBoard from '@/components/Leaderboard.vue'
import MonthSelector from '@/components/MonthSelector.vue'
import IncentiveTrip from '@/components/IncentiveTrip.vue'
import TEAM_STATS_BY_LEVEL from '@/graphql/TeamStatsByLevel.gql'
import {
  MONTHLY_SALES_LEADERBOARD,
  MONTHLY_FRONTLINE_LEADERBOARD
} from '@/graphql/Leaderboard.js'
import { ADDRESS_BY_MEMBER_ID } from '@/graphql/Address.js'
import tenantInfo from '@/tenant.js'
import moment from 'moment'

const { VUE_APP_TENANT_ID } = process.env

export default {
  name: 'dashboard',
  components: {
    DashCard,
    MonthSelector,
    IncentiveTrip,
    LeaderBoard
  },
  data: () => ({
    allSales: [],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: moment()
      .startOf('month')
      .format('YYYY-MM-DD'),
    endDate: moment()
      .endOf('month')
      .format('YYYY-MM-DD'),
    team: {
      totalTeamAmount: 0,
      teamSize: 0
    },
    incentiveTrip: tenantInfo.incentiveTrip,
    MonthlyFrontlineLeaders: [],
    MonthlySalesLeaders: [],
    address: null,
    showAddressDialog: false,
    teamStats: {
      personal: {
        totalAmount: 0,
        sales: 0
      },
      firstLevel: {
        size: 0
      }
    }
  }),
  apollo: {
    teamStats: {
      query: TEAM_STATS_BY_LEVEL,
      variables() {
        return {
          teamInput: {
            memberId: this.$store.state.user.principal.member.id,
            tenantId: process.env.VUE_APP_TENANT_ID,
            startDate: this.startDate,
            endDate: this.endDate,
            month: this.month,
            year: this.year
          }
        }
      },
      update({ TeamStatsByLevel }) {
        this.team.totalTeamAmount =
          TeamStatsByLevel.personal.totalAmount +
          TeamStatsByLevel.firstLevel.totalAmount +
          TeamStatsByLevel.secondLevel.totalAmount +
          TeamStatsByLevel.thirdLevel.totalAmount +
          TeamStatsByLevel.fourthLevel.totalAmount

        this.team.teamSize =
          TeamStatsByLevel.firstLevel.size +
          TeamStatsByLevel.secondLevel.size +
          TeamStatsByLevel.thirdLevel.size +
          TeamStatsByLevel.fourthLevel.size

        return TeamStatsByLevel
      }
    },
    address: {
      query: ADDRESS_BY_MEMBER_ID,
      variables() {
        return {
          addressMemberId: {
            memberId: this.$store.state.user.principal.member.id
          }
        }
      },
      update({ addressByMemberOrTenant }) {
        const a = addressByMemberOrTenant[0]
        this.showAddressDialog = false
        if (!a) {
          this.showAddressDialog = true
        }
        return Object.assign({}, a)
      },
      fetchPolicy: 'cache-and-network'
    },
    MonthlySalesLeaders: {
      query: MONTHLY_SALES_LEADERBOARD,
      variables() {
        return {
          leaderInput: {
            tenantId: VUE_APP_TENANT_ID,
            month: this.month,
            year: this.year
          }
        }
      },
      update({ monthlySalesLeaderboard }) {
        return monthlySalesLeaderboard
      }
    },
    MonthlyFrontlineLeaders: {
      query: MONTHLY_FRONTLINE_LEADERBOARD,
      variables() {
        return {
          leaderInput: {
            tenantId: VUE_APP_TENANT_ID,
            month: this.month,
            year: this.year
          }
        }
      },
      update({ monthlyFrontlineLeaderboard }) {
        return monthlyFrontlineLeaderboard
      }
    }
  },
  methods: {
    dateChanged({ date }) {
      const dateSplit = date.split('-')
      this.month = dateSplit[1]
      this.year = dateSplit[0]
      const monthDate = moment().set({ year: this.year, month: this.month })
      this.startDate = monthDate.startOf('month').format('YYYY-MM-DD')
      this.endDate = monthDate.endOf('month').format('YYYY-MM-DD')
    }
  }
}
</script>

<style scoped>
</style>
