<template>
  <div class="dashboard">
    <h1>Welcome To your backoffice {{member.displayName}}!</h1>
    <month-selector :year="year" :month="month" @date-changed="dateChanged"/>
    <v-container fluid class="contain">
      <v-layout row wrap>
        <v-flex sm2>
          <img class="image" :src="getAvatar" :style="{ borderColor: `#${currentRank.color}`}"/>
        </v-flex>
        <v-flex sm6>
          <!-- <h3>Current Level: Ambassador</h3> -->
          <h3>Chakra: {{currentRank.name}}</h3>
          <ul>
            <li>Qualified First Level: {{team.personal.qualified}}</li>
            <li>Total Personal Points: {{team.personal.totalPoints}}</li>
            <li>Total Personal Amount: {{team.personal.totalAmount}}</li>
            <li>Total Personal Sales: {{team.personal.sales}}</li>
            <li>Personal Recruites: {{team.personal.recruited}}</li>
            <li><hr/></li>
            <li>Family Size: {{team.teamSize}}</li>
            <li>Total Family Points: {{team.totalTeamAmount}}</li>
          </ul>
        </v-flex>
        <v-spacer/>
      </v-layout>
      <CompPlanLevel
        :level="team.firstLevel"
        levelName="One"
        :percent="calculatePercent(.1, 1)"
        notes="If you have 1 qualifying member in your first level you will receive 10% of your First Level Commissionable Points"
        :color="ranks[2].color"
      />
      <CompPlanLevel
        :level="team.secondLevel"
        levelName="Two"
        :percent="calculatePercent(.05, 2)"
        notes="If you have 2 qualifying members in your first level you will receive 5% of your Second Level Commissionable Points"
        :color="ranks[3].color"
      />
      <CompPlanLevel
        :level="team.thirdLevel"
        levelName="Three"
        :percent="calculatePercent(.05, 3)"
        notes="If you have 3 qualifying members in your first level you will receive 5% of your Third Level Commissionable Points"
        :color="ranks[4].color"
      />
      <CompPlanLevel
        :level="team.fourthLevel"
        levelName="Fourth"
        :percent="calculatePercent(.1, 4)"
        notes="If you have 4 qualifying members in your first level you will receive 10% of your Fourth Level Commissionable Points"
        :color="ranks[5].color"
      />
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
          <LeaderBoard :leaders="MonthlySalesLeaders" title="Top Sellers" :showTotal="false"/>
        </v-flex>
        <v-flex sm6 pa-3>
          <LeaderBoard :leaders="MonthlyFrontlineLeaders" title="Top Recruiters"/>
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
import CompPlanLevel from '@/components/CompPlanLevel.vue'
import MonthSelector from '@/components/MonthSelector.vue'
import IncentiveTrip from '@/components/IncentiveTrip.vue'
import IDENTITY_QUERY from '@/graphql/GetIdentity.gql'
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
    LeaderBoard,
    CompPlanLevel
  },
  data: () => ({
    ranks: {
      0: { name: 'Unqualified', color: 'FFFFFF' },
      1: { name: 'Zen Ambassador', color: 'E53A37' },
      2: { name: 'Zen Guide', color: 'E67C4F' },
      3: { name: 'Zen Guru', color: 'FDEF53' },
      4: { name: 'Zen Sage', color: '7FB75F' },
      5: { name: 'Zen Master', color: '3848A0' }
    },
    rankStyle: {},
    currentRank: { name: 'Unqualified', color: 'FFFFFF' },
    allSales: [],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: moment()
      .startOf('month')
      .format('YYYY-MM-DD'),
    endDate: moment()
      .endOf('month')
      .format('YYYY-MM-DD'),
    incentiveTrip: tenantInfo.incentiveTrip,
    MonthlyFrontlineLeaders: [],
    MonthlySalesLeaders: [],
    address: null,
    showAddressDialog: false,
    team: {
      personal: {
        qualified: 0
      },
      firstLevel: {},
      secondLevel: {},
      thirdLevel: {},
      fourthLevel: {},
      teamSize: 0,
      totalTeamAmount: 0
    },
    member: {}
  }),
  apollo: {
    member: {
      query: IDENTITY_QUERY,
      variables() {
        return {
          condition: {
            memberId: this.$store.state.user.principal.member.id
          }
        }
      },
      update({ allIdentities }) {
        const member = allIdentities.nodes[0]
        return member
      }
    },
    team: {
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
        const totalTeamAmount =
          TeamStatsByLevel.personal.totalAmount +
          TeamStatsByLevel.firstLevel.totalAmount +
          TeamStatsByLevel.secondLevel.totalAmount +
          TeamStatsByLevel.thirdLevel.totalAmount +
          TeamStatsByLevel.fourthLevel.totalAmount

        const teamSize =
          TeamStatsByLevel.firstLevel.size +
          TeamStatsByLevel.secondLevel.size +
          TeamStatsByLevel.thirdLevel.size +
          TeamStatsByLevel.fourthLevel.size

        // Calculate Rank
        let r = 0
        if (TeamStatsByLevel.personal.totalPoints >= 60) {
          r = 1
        }
        if (r >= 1) {
          r += TeamStatsByLevel.personal.qualified
        }

        this.currentRank = this.ranks[r > 5 ? 5 : r]
        this.rankStyle.borderStyle = `#${this.currentRank.color}`
        return { ...TeamStatsByLevel, totalTeamAmount, teamSize }
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
    },
    calculatePercent(percent, qualified) {
      if (this.team.personal.qualified >= qualified) {
        return percent
      }
      return 0
    },
    calculateRank(qualified) {}
  },
  computed: {
    getAvatar() {
      let image =
        'http://res.cloudinary.com/hexly/image/upload/dev/1001/avatar/undefined.jpg'
      if (this.member.profileUrl) {
        image = this.member.profileUrl.replace(
          '/image/upload',
          '/image/upload/w_190,h_190'
        )
      }
      return image
    }
  }
}
</script>

<style scoped>
.image {
  width: 100%;
  border-radius: 100%;
  border: 10px solid white;
}
.comp-plan .contain {
  max-width: 1400px;
}
ul li {
  list-style: none;
}
</style>
