<template>
  <div class="dashboard py-4">
    <v-layout row wrap justify-space-between class="px-2">
        <v-flex xs12 sm6>
          <h1>Dashboard</h1>
        </v-flex>
        <v-flex xs12 sm3 md2>
          <month-selector
            :year="year"
            :month="month"
            @date-changed="dateChanged"
          />
        </v-flex>
    </v-layout>
    <v-subheader>Rank</v-subheader>
    <v-layout row wrap justify-center class="pa-3">
      <v-flex xs12 sm5 md5 lg4>
        <v-card class="py-4">
          <div class="text-center">
            <div class="rank-icon intern" :class="{'active': team.personal.totalPoints >= 60}"></div>
            <div class="rank-icon manager" :class="{'active': calculateRank(1)}"></div>
            <div class="rank-icon vp" :class="{'active': calculateRank(2)}"></div>
            <div class="rank-icon seniorvp" :class="{'active': calculateRank(3)}"></div>
            <div class="rank-icon ceo" :class="{'active': calculateRank(4)}"></div>
          </div>
          <h2 class="text-center headline">{{currentRank.name}}</h2>
        </v-card>
      </v-flex>
    </v-layout>
    <v-subheader>Monthly Personal Stats</v-subheader>
    <v-layout row wrap justify-center fill-height>
      <v-flex xs12 sm4 md4 lg3 class="pa-3">
        <DashCard
          color="white"
          darken="1"
          :display="team.personal.sales"
          subheading="Sales"
          icon="shopping_basket"
          :trend="currentMonth ? salesTrend : null"
        />
      </v-flex>
      <v-flex xs12 sm4 md4 lg3 class="pa-3">
        <DashCard
          color="white"
          darken="1"
          :display="team.personal.qualified"
          subheading="Qualified Front Line"
          icon="how_to_reg"
          :trend="currentMonth ? frontLineTrend : null"
        />
      </v-flex>
      <v-flex xs12 sm4 md4 lg3 class="pa-3">
        <DashCard
          color="white"
          darken="1"
          :display="team.personal.totalPoints ? team.personal.totalPoints.toFixed(2) : 0"
          subheading="Points"
          icon="group_work"
          :trend="currentMonth ? pointsTrend : null"
        />
      </v-flex>
      </v-layout>
    <v-subheader>Monthly Family Stats</v-subheader>
    <v-layout row wrap justify-center>
      <v-flex xs12 sm4 md4 lg3 class="pa-3">
        <DashCard
          color="white"
          darken="1"
          :display="team.teamSize"
          subheading="Size"
          icon="group"
        />
      </v-flex>
      <v-flex xs12 sm4 md4 lg3 class="pa-3">
        <DashCard
          color="white"
          darken="1"
          :display="team.totalTeamAmount.toFixed(2)"
          subheading="Points"
          icon="group_work"
        />
      </v-flex>
    </v-layout>
    <v-subheader>Qualifications</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap align-start justify-center>
        <v-flex xs12 sm6 px-3 my-3>
          <FrontlineQualifiers :personal="personalProgress" :ranks="ranks" :leaders="teamLeaders"/>
        </v-flex>
        <v-flex xs12 sm6 px-3 my-3>
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Level Qualification</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu :close-on-content-click="false" offset-x left >
              <v-btn icon slot="activator">
                <v-icon>info</v-icon>
              </v-btn>
              <v-card class="pa-4">
                <ul>
                  <li>1 qualifying front line member: 10% of first level points</li>
                  <li>2 qualifying front line member: 5% of second level points</li>
                  <li>3 qualifying front line member: 5% of third level points</li>
                  <li>4 qualifying front line member: 10% of fourth level points</li>
                </ul>
              </v-card>
            </v-menu>
          </v-toolbar>
          <v-layout row wrap>
            <v-flex>
            <div class="my-2">
              <div class="pa-1 grey lighten-4 d-flex align-top">
                <div class="flex xs3 text-left">
                  <div class="header grey--text text--darken-1">Level</div>
                </div>
                <div class="flex xs2 text-left">
                  <div class="header grey--text text--darken-1">Size</div>
                </div>
                <div class="flex xs3 text-left">
                  <div class="header grey--text text--darken-1">Points</div>
                </div>
                <div class="flex xs2 text-left">
                  <div class="header grey--text text--darken-1">Recruited</div>
                </div>
                <div class="flex xs2 text-left">
                  <div class="header grey--text text--darken-1">Sales</div>
                </div>
              </div>
            </div>
            </v-flex>
          </v-layout>
          <CompPlanLevel
            :level="team.firstLevel"
            levelName="One"
            :percent="calculatePercent(.1, 1)"
            :color="ranks[2].color"
          />
          <CompPlanLevel
            :level="team.secondLevel"
            levelName="Two"
            :percent="calculatePercent(.05, 2)"
            :color="ranks[3].color"
          />
          <CompPlanLevel
            :level="team.thirdLevel"
            levelName="Three"
            :percent="calculatePercent(.05, 3)"
            :color="ranks[4].color"
          />
          <CompPlanLevel
            :level="team.fourthLevel"
            levelName="Four"
            :percent="calculatePercent(.1, 4)"
            :color="ranks[5].color"
          />
          <br/>
        </v-flex>
      </v-layout>
    </v-container>
    <v-subheader>Team Leaderboards</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex sm6 pa-3>
          <LeaderBoard
            :leaders="MonthlySalesLeaders"
            title="Team Top Sellers"
            :currency="true"
          />
        </v-flex>
        <v-flex sm6 pa-3>
          <LeaderBoard
            :leaders="MonthlyFrontlineLeaders"
            title="Team Top Recruiters"
          />
        </v-flex>
      </v-layout>
    </v-container>
    <v-subheader>Company Leaderboards</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex sm6 pa-3>
          <LeaderBoard
            :leaders="CompanyMonthlySalesLeaders"
            title="Top Sellers"
            :showTotal="false"
          />
        </v-flex>
        <v-flex sm6 pa-3>
          <LeaderBoard
            :leaders="CompanyMonthlyFrontlineLeaders"
            title="Top Recruiters"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { TEAM_STATS_BY_LEVEL } from '@/graphql/Team.gql'
import {
  SALES_LEADERBOARD,
  FRONTLINE_LEADERBOARD,
  COMPANY_SALES_LEADERBOARD,
  COMPANY_FRONTLINE_LEADERBOARD
} from '@/graphql/Leaderboard.js'
import { GET_MEMBER_STATS } from '@/Sales/Api.js'
import { MONTHLY_STATS_QUERY } from '@/graphql/MemberStats.gql'

import DashCard from '@/components/DashboardCard.vue'
import LeaderBoard from '@/components/Leaderboard.vue'
import FrontlineQualifiers from '@/components/FrontlineQualifiers.vue'
import CompPlanLevel from '@/components/CompPlanLevel.vue'
import MonthSelector from '@/components/MonthSelector.vue'

import { pathOr } from 'rambda'
import { mapMutations, mapState, mapGetters } from 'vuex'
import { UserMutations } from '@/stores/UserStore'
import { Mutations } from '@/store'

export default {
  name: 'dashboard',
  components: {
    DashCard,
    MonthSelector,
    LeaderBoard,
    CompPlanLevel,
    FrontlineQualifiers
  },
  data() {
    return {
      currentMonth: true,
      pointsTrend: null,
      salesTrend: null,
      frontLineTrend: null,
      teamLeaders: [],
      ranks: {
        0: { name: 'Unqualified', color: 'FFFFFF' },
        1: { name: 'Intern', color: 'F59895' },
        2: { name: 'Manager', color: 'F3C789' },
        3: { name: 'VP', color: 'F7E8AB' },
        4: { name: 'Senior VP', color: 'B8D886' },
        5: { name: 'CEO', color: '9BD2EF' }
      },
      rankStyle: {},
      personalProgress: null,
      currentRank: { name: 'Unqualified', color: 'FFFFFF' },
      allSales: [],
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      startDate: this.$moment()
        .startOf('month')
        .format('YYYY-MM-DD'),
      endDate: this.$moment()
        .endOf('month')
        .format('YYYY-MM-DD'),
      MonthlyFrontlineLeaders: [],
      MonthlySalesLeaders: [],
      CompanyMonthlySalesLeaders: [],
      CompanyMonthlyFrontlineLeaders: [],
      address: null,
      team: {
        personal: {
          qualified: 0,
          totalPoints: 0
        },
        firstLevel: {},
        secondLevel: {},
        thirdLevel: {},
        fourthLevel: {},
        teamSize: 0,
        totalTeamAmount: 0
      },
      memberSalesStats: []
    }
  },
  async mounted() {
    this.calculateTrends()
  },
  watch: {
    '$apollo.loading'(newVal) {
      this.setLoading(newVal)
    }
  },
  apollo: {
    team: {
      query: TEAM_STATS_BY_LEVEL,
      variables () {
        return {
          teamInput: {
            memberId: this.memberId,
            tenantId: this.$tenantId,
            startDate: this.startDate,
            endDate: this.endDate,
            month: this.month,
            year: this.year
          }
        }
      },
      update ({ teamStatsByLevel }) {
        const totalTeamAmount =
          pathOr(0, ['personal', 'totalAmount'], teamStatsByLevel) +
          pathOr(0, ['firstLevel', 'totalAmount'], teamStatsByLevel) +
          pathOr(0, ['secondLevel', 'totalAmount'], teamStatsByLevel) +
          pathOr(0, ['thirdLevel', 'totalAmount'], teamStatsByLevel) +
          pathOr(0, ['fourthLevel', 'totalAmount'], teamStatsByLevel)

        const teamSize =
          pathOr(0, ['firstLevel', 'size'], teamStatsByLevel) +
          pathOr(0, ['secondLevel', 'size'], teamStatsByLevel) +
          pathOr(0, ['thirdLevel', 'size'], teamStatsByLevel) +
          pathOr(0, ['fourthLevel', 'size'], teamStatsByLevel)

        // Calculate Rank
        let r = 0
        if (pathOr(-1, ['personal', 'totalPoints'], teamStatsByLevel) >= 60) {
          r = 1
        }
        if (r >= 1) {
          r += pathOr(0, ['personal', 'qualified'], teamStatsByLevel)
        }

        this.currentRank = this.ranks[r > 5 ? 5 : r]
        this.rankStyle.borderStyle = `#${this.currentRank.color}`
        return { ...this.team, ...teamStatsByLevel, totalTeamAmount, teamSize }
      }
    },
    MonthlySalesLeaders: {
      query: SALES_LEADERBOARD,
      variables () {
        return {
          leaderInput: {
            tenantId: this.$tenantId,
            month: this.month,
            year: this.year,
            omitTagIds: [7]
          }
        }
      },
      update ({ monthlySalesLeaderboardByTeam }) {
        return monthlySalesLeaderboardByTeam
      }
    },
    MonthlyFrontlineLeaders: {
      query: FRONTLINE_LEADERBOARD,
      variables () {
        return {
          leaderInput: {
            tenantId: this.$tenantId,
            month: this.month,
            year: this.year,
            omitTagIds: [7]
          }
        }
      },
      update ({ monthlyFrontlineLeaderboardByTeam }) {
        return monthlyFrontlineLeaderboardByTeam
      }
    },
    CompanyMonthlySalesLeaders: {
      query: COMPANY_SALES_LEADERBOARD,
      variables () {
        return {
          leaderInput: {
            tenantId: this.$tenantId,
            month: this.month,
            year: this.year,
            omitTagIds: [7]
          }
        }
      },
      update ({ monthlySalesLeaderboard }) {
        return monthlySalesLeaderboard
      }
    },
    CompanyMonthlyFrontlineLeaders: {
      query: COMPANY_FRONTLINE_LEADERBOARD,
      variables () {
        return {
          leaderInput: {
            tenantId: this.$tenantId,
            month: this.month,
            year: this.year,
            omitTagIds: [8]
          }
        }
      },
      update ({ monthlyFrontlineLeaderboard }) {
        return monthlyFrontlineLeaderboard
      }
    },
    teamLeaders: {
      query: MONTHLY_STATS_QUERY,
      variables () {
        return {
          targetCondition: {
            tenantId: this.$tenantId,
            sellerId: this.memberId,
            month: this.month,
            year: this.year
          },
          firstLevelCondition: {
            tenantId: this.$tenantId,
            sponsorId: this.memberId,
            month: this.month,
            year: this.year
          }
        }
      },
      update ({ targetStats, firstLevelStats }) {
        this.personalProgress = targetStats.nodes[0]
        return firstLevelStats.nodes
      },
      fetchPolicy: 'cache-and-network'
    }
  },
  methods: {
    dateChanged ({ date }) {
      const dateSplit = date.split('-')
      this.month = parseInt(dateSplit[1])
      this.year = parseInt(dateSplit[0])
      const monthDate = this.$moment().set({ year: this.year, month: this.month })
      this.startDate = monthDate.startOf('month').format('YYYY-MM-DD')
      this.endDate = monthDate.endOf('month').format('YYYY-MM-DD')
      if (this.month === this.$moment().month() + 1 && this.year === this.$moment().year()) {
        this.currentMonth = true
        this.calculateTrends()
      } else {
        this.currentMonth = false
      }
    },
    async calculateTrends() {
      const currentMonthVars = {
        memberIds: [this.memberId],
        startDate: this.$moment().startOf('month').format('YYYY-MM-DD'),
        endDate: this.$moment().format('YYYY-MM-DD'),
        mode: 'YEAR_AND_MONTH'
      }
      const lastMonthVars = {
        ...currentMonthVars,
        startDate: this.$moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        endDate: this.$moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
      }
      const [curr, last] = await Promise.all([
        this.$apollo.query({
          query: GET_MEMBER_STATS,
          variables: { input: currentMonthVars }
        }),
        this.$apollo.query({
          query: GET_MEMBER_STATS,
          variables: { input: lastMonthVars }
        })
      ])
      this.calculatePersonalTrends(curr, last)
      this.calculateTeamTrends(curr, last)
    },
    calculatePersonalTrends(curr, last) {
      const past = last.data.saleStatsByDateRange[0].stats[0]
      const current = curr.data.saleStatsByDateRange[0].stats[0]
      this.pointsTrend = (past.totalAmount - current.totalAmount) / past.totalAmount * -100
      this.salesTrend = (past.saleCount - current.saleCount) / past.saleCount * -100
    },
    calculateTeamTrends(curr, last) {
      const pastFrontLine = last.data.saleStatsByDateRange.filter(this.checkQualification)
      const currFrontLine = curr.data.saleStatsByDateRange.filter(this.checkQualification)
      this.frontLineTrend = (pastFrontLine.length - currFrontLine.length) / pastFrontLine.length * -100
    },
    calculatePercent (percent, qualified) {
      const { qualified: _qualified, totalPoints } = this.team.personal
      return _qualified >= qualified && totalPoints >= 60 ? percent : 0
    },
    calculateRank (qualified) {
      const { qualified: _qualified, totalPoints } = this.team.personal
      return _qualified >= qualified && totalPoints >= 60
    },
    checkQualification(member) {
      if (member.stats[0].totalAmount >= 60 || this.$moment(member.joinedOn).isAfter(this.$moment().startOf('month'))) {
        return true
      }
      return false
    },
    ...mapMutations([UserMutations.MEMBER_QUERY, Mutations.SET_GATE, Mutations.SET_LOADING])
  },
  computed: {
    ...mapState({
      user: state => state.user
    }),
    ...mapGetters(['contactId', 'memberId'])
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1440px;
  margin: auto;
  padding: 0 25px;
}

@media only screen and (max-width: 959px){
  .dashboard {
    padding: 0;
  }
}
.image {
  width: 100%;
  border-radius: 100%;
  border: 10px solid white;
}
.comp-plan .contain {
  max-width: 1400px;
}

.rank-icon {
  width: 70px;
  height: 70px;
  margin: 0 5px;
  display: inline-block;
  filter: grayscale(100%) opacity(50%) contrast(0%);
  background-image: url("/img/1000/vd-ranks.svg");
  background-size: 312px;
}

.intern {
  background-position: 26px -15px;
  background-size: 387px;
}
.manager {
  background-position: -50px -13px;
  background-size: 375px;
}
.vp {
  background-position: -98px 0;
}
.seniorvp {
  background-position: -169px 0;
}
.ceo {
  background-position: -238px 0;
}
</style>
