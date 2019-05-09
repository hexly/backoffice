<template>
  <div class="dashboard">
    <v-layout row wrap justify-space-between="">
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
    <v-container fluid class="contain">
      <v-subheader>Rank</v-subheader>
      <h2>{{currentRank.name}}</h2>
      <div class="text-xs-center">
        <div
          class="chakra ambassador"
          :class="{'active': team.personal.totalPoints >= 60}"
        ></div>
        <div
          class="chakra guide"
          :class="{'active': calculateRank(1)}"
        ></div>
        <div
          class="chakra guru"
          :class="{'active': calculateRank(2)}"
        ></div>
        <div
          class="chakra sage"
          :class="{'active': calculateRank(3)}"
        ></div>
        <div
          class="chakra master"
          :class="{'active': calculateRank(4)}"
        ></div>
      </div>
      <v-subheader>Personal Stats</v-subheader>
      <v-layout row wrap justify-center>
        <v-flex xs12 sm4 md4 lg3 class="pa-3">
          <DashCard
            color="white"
            darken="1"
            :display="team.personal.sales"
            subheading="Monthly Sales"
            icon="shopping_basket"
          />
        </v-flex>
        <v-flex xs12 sm4 md4 lg3 class="pa-3">
          <DashCard
            color="white"
            darken="1"
            :display="team.personal.qualified"
            subheading="Qualified First Level"
            icon="how_to_reg"
          />
        </v-flex>
        <v-flex xs12 sm4 md4 lg3 class="pa-3">
          <DashCard
            color="white"
            darken="1"
            :display="team.personal.totalPoints.toFixed(2)"
            subheading="Monthly Points"
            icon="group_work"
          />
        </v-flex>
        </v-layout>
      <v-subheader>Family Stats</v-subheader>
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
      <v-subheader>Plan</v-subheader>
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
        levelName="Four"
        :percent="calculatePercent(.1, 4)"
        notes="If you have 4 qualifying members in your first level you will receive 10% of your Fourth Level Commissionable Points"
        :color="ranks[5].color"
      />
    </v-container>
    <!-- <v-subheader>Team Leaderboards</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex sm6 pa-3>
          <p>First Level qualifiers</p>
          <FrontlineQualifiers :leaders="teamLeaders"/>
        </v-flex>
      </v-layout>
    </v-container> -->
    <v-subheader>Leaderboards</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex sm6 pa-3>
          <LeaderBoard
            :leaders="MonthlySalesLeaders"
            title="Top Sellers"
            :showTotal="false"
          />
        </v-flex>
        <v-flex sm6 pa-3>
          <LeaderBoard
            :leaders="MonthlyFrontlineLeaders"
            title="Top Recruiters"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import TEAM_STATS_BY_LEVEL from '@/graphql/TeamStatsByLevel.gql'
import {
  MONTHLY_SALES_LEADERBOARD,
  MONTHLY_FRONTLINE_LEADERBOARD
} from '@/graphql/Leaderboard.js'
import { ADDRESS_BY_MEMBER_ID } from '@/graphql/Address.js'
import MONTHLY_STATS_QUERY from '@/graphql/GetMonthlyStats.gql'

import DashCard from '@/components/DashboardCard.vue'
import LeaderBoard from '@/components/Leaderboard.vue'
import FrontlineQualifiers from '@/components/FrontlineQualifiers.vue'
import CompPlanLevel from '@/components/CompPlanLevel.vue'
import MonthSelector from '@/components/MonthSelector.vue'
import GET_MEMBERS from '@/graphql/GetMembers.gql'

import moment from 'moment'
import _ from 'lodash'
import { pathOr } from 'rambda'
import { mapMutations, mapState } from 'vuex'
import { UserMutations } from '@/stores/UserStore'
import { Mutations } from '@/store'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'dashboard',
  components: {
    DashCard,
    MonthSelector,
    LeaderBoard,
    CompPlanLevel,
    FrontlineQualifiers
  },
  data: () => ({
    teamLeaders: [],
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
    MonthlyFrontlineLeaders: [],
    MonthlySalesLeaders: [],
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
    }
  }),
  apollo: {
    member: {
      query: GET_MEMBERS,
      variables () {
        return {
          input: {
            ids: [this.$store.state.user.principal.memberId]
          }
        }
      },
      update ({ members }) {
        this.memberQuery(members.nodes[0])
      }
    },
    team: {
      query: TEAM_STATS_BY_LEVEL,
      variables () {
        return {
          teamInput: {
            memberId: this.$store.state.user.principal.memberId,
            tenantId,
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
    address: {
      query: ADDRESS_BY_MEMBER_ID,
      variables () {
        return {
          addressMemberId: {
            memberId: this.$store.state.user.principal.memberId,
            tenantId
          }
        }
      },
      update ({ addressByMemberOrTenant }) {
        const a = addressByMemberOrTenant[0]
        if (!a) {
          this.setGate(true)
        }
        return Object.assign({}, a)
      },
      fetchPolicy: 'cache-and-network'
    },
    MonthlySalesLeaders: {
      query: MONTHLY_SALES_LEADERBOARD,
      variables () {
        return {
          leaderInput: {
            tenantId,
            month: this.month,
            year: this.year,
            omitTagIds: [8]
          }
        }
      },
      update ({ monthlySalesLeaderboard }) {
        return monthlySalesLeaderboard
      }
    },
    MonthlyFrontlineLeaders: {
      query: MONTHLY_FRONTLINE_LEADERBOARD,
      variables () {
        return {
          leaderInput: {
            tenantId,
            month: this.month,
            year: this.year,
            omitTagIds: [8]
          }
        }
      },
      update ({ monthlyFrontlineLeaderboard }) {
        return monthlyFrontlineLeaderboard
      }
    }// ,
    // teamLeaders: {
    //   query: MONTHLY_STATS_QUERY,
    //   variables () {
    //     return {
    //       targetCondition: {
    //         tenantId,
    //         sellerId: this.currentId,
    //         month: this.month,
    //         year: this.year
    //       },
    //       firstLevelCondition: {
    //         tenantId,
    //         sponsorId: this.$store.state.user.principal.memberId,
    //         month: this.month,
    //         year: this.year
    //       }
    //     }
    //   },
    //   update ({ targetStats, firstLevelStats }) {
    //     const firstLevelQualifiers = firstLevelStats.nodes.filter(stats => stats.totalAmount > 0)
    //     return _.orderBy(firstLevelQualifiers, 'totalAmount', 'desc')
    //   },
    //   fetchPolicy: 'cache-and-network'
    // }
  },
  methods: {
    dateChanged ({ date }) {
      const dateSplit = date.split('-')
      this.month = parseInt(dateSplit[1])
      this.year = parseInt(dateSplit[0])
      const monthDate = moment().set({ year: this.year, month: this.month })
      this.startDate = monthDate.startOf('month').format('YYYY-MM-DD')
      this.endDate = monthDate.endOf('month').format('YYYY-MM-DD')
    },
    calculatePercent (percent, qualified) {
      const { qualified: _qualified, totalPoints } = this.team.personal
      return _qualified >= qualified && totalPoints >= 60 ? percent : 0
    },
    calculateRank (qualified) {
      const { qualified: _qualified, totalPoints } = this.team.personal
      return _qualified >= qualified && totalPoints >= 60
    },
    ...mapMutations([UserMutations.MEMBER_QUERY, Mutations.SET_GATE])
  },
  computed: {
    ...mapState({
      user: state => state.user
    })
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

.chakra {
  width: 105px;
  height: 105px;
  display: inline-block;
  filter: grayscale(100%) opacity(50%);
  background-image: url("/img/1004/chakras.png");
}

.ambassador {
  background-position: -15px 0px;
}
.guide {
  background-position: -135px 0px;
}
.guru {
  background-position: -249px 0;
}
.sage {
  background-position: -367px 0px;
}
.master {
  background-position: -605px 0;
}

.active {
  filter: grayscale(0%) opacity(100%);
}

/* .chakra6 {
  background-position: -209px -10px;
}

.chakra7 {
  background-position: -10px -10px;
} */
</style>
