<template>
  <div class="full-wrapper dashboard">
    <Announcement v-if="features.announcements"/>
    <v-row wrap>
      <v-col cols="12" md="6">
        <v-layout id="personal-card-layout" column>
          <v-flex>
            <PersonalCard :memberName="`Your ${$tenantInfo.distributorLabel}  Number:`" v-if="features.personalCard">
              <div slot="footer">
                <Badges v-if="features.personalCardAwards" :memberId="member.id"/>
                <div v-if="features.personalCardSocial && (tenantIntegrations.length === 0 && this.$tenantInfo.features.social)">
                  <h3 class="text-center">Social Accounts<sup>*</sup></h3>
                  <div class="text-center">
                    <small> Once linked, you can access your social accounts in your profile page </small>
                  </div>
                  <Social :key="tenantIntegrations.length"/>
                </div>
              </div>
            </PersonalCard>
          </v-flex>
        </v-layout>
      </v-col>
      <v-col cols="12" md="6">
        <template v-for="p in progresses">
          <div :key="p.id">
            <ProgressCard :id="p.id" :title="p.title" :rows="p.rows"/>
            <br>
          </div>
        </template>
        <template v-for="incentive in features.incentives">
          <component :is="incentive" :key="incentive"></component>
        </template>
        <RankRequirementsCard
          v-if="features.rankRequirements"
          :stats         ="engineStats"
          :statsDisabled ="statsDisabled"
          :loading       ="engineStatsLoading"
        />
        <br>
        <TeamOverview
          v-if="features.teamOverview"
          :stats="engineStats"
          :total="memberCount"
          :loading="engineStatsLoading"
        />
      </v-col>
    </v-row>
    <v-row wrap>
      <v-col cols="12" sm="6">
        <LeaderBoard
          v-if="features.companyLeaders"
          :leaders="companyLeaderboard"
          title="Top Team Builders (Company)"
          :message="`New ${$tenantInfo.distributorsLabel} this period: `"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <LeaderBoard
          v-if="features.teamLeaders"
          :leaders="teamLeaderboard"
          title="Top Team Builders (Your Team)"
          :message="`New ${$tenantInfo.distributorsLabel} this period: `"
        />
      </v-col>
    </v-row>
    <Directory
      v-if="features.directory"
      class="py-2"
      :self="personalStats"
      :frontline="team"
      title="Your Circle of Influence"
      membersTypeName="Influencer"
    />
    <CompanyMap
      v-if="features.map"
      class="py-2"
      :title="`${$tenantInfo.distributorsLabel} around the world`"
    />
  </div>
</template>

<script>

import * as _ from 'lodash'
import { isMobile } from '@/utils/isMobile'

import Social from '@/components/profile/Social.vue'
import PersonalCard from '@/components/dashboard/PersonalCard.vue'
import Directory from '@/components/dashboard/Directory.vue'
import DashCard from '@/components/DashboardCard.vue'
import CompanyMap from '@/components/dashboard/CompanyMap.vue'
import Announcement from '@/components/dashboard/Announcement.vue'
import Badges from '@/components/Badges.vue'
import RankRequirementsCard from '@/components/RankRequirementsCard.vue'
import TeamOverview from '@/components/dashboard/TeamOverview.vue'
import LeaderBoard from '@/components/Leaderboard.vue'

import ProgressCard from '@/components/incentives/ProgressCard.vue'

import {
  FRONTLINE_LEADERBOARD_BY_RANGE,
  COMPANY_FRONTLINE_LEADERBOARD_BY_RANGE
} from '@/graphql/Leaderboard.js'
import { COMP_PAYOUTS_QUERY } from '@/graphql/CompStats.gql'
import {
  MEMBER_STATS_BY_DEPTH,
  MAX_MRN
} from '@/graphql/MemberStats.gql'
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
import { UserMutations } from '@/stores/UserStore'
import { CompActions } from '@/stores/CompStore'
import { Mutations } from '@/store'

export default {
  name: 'dashboard',
  components: {
    ProgressCard,
    DashCard,
    PersonalCard,
    Directory,
    CompanyMap,
    Announcement,
    Badges,
    Social,
    RankRequirementsCard,
    TeamOverview,
    LeaderBoard
  },
  created() {
    this.$tenantInfo.features.dashboard.incentives.forEach(fileName => {
      console.log(fileName)
    //   debugger
    //   this.$options.components[fileName] = () => import(`@/components/incentives/${fileName}.vue`)
    })
  },
  data() {
    return {
      GET: _.get,
      year: ~~this.$moment().format('Y'),
      personalStats: {
        counts: {
          total: 0,
          level1: 0
        }
      },
      dataTableHeaders: [
        { text: 'Order #', value: 'integrationOid', sortable: false },
        { text: 'Date', value: 'awardedDate', sortable: false },
        { text: 'Reason', value: 'reason', sortable: false },
        { text: 'Seller', value: 'seller', sortable: false },
        { text: 'Payout', value: 'payout', sortable: false }
      ],
      memberCount: 0,
      team: [],
      generationCount: {},
      loadingStats: 0,
      loadingRanks: 0,
      loadingCount: 0,
      generationCountLoading: 0,
      statsDisabled: false,
      isMobile: isMobile(),
      teamLeaderboard: [],
      companyLeaderboard: [],
      progresses: [{
        id: 'bonus-programs',
        title: 'Bonus Programs',
        rows: [{
          id: 'top',
          cols: [
            {
              id: 'g3gf',
              title: 'Get 3 Get Free <br> (G3GF)',
              type: 'circular',
              progress: 85,
              label: '263 / 300',
              hint: 'Get That Bonus!**'
            },
            {
              id: 'cab',
              title: 'Customer Acquisition (CAB)',
              type: 'circular',
              progress: 17,
              label: '2 / 3',
              hint: 'Earn $20 + $20!'
            },
            {
              id: 'pcab',
              title: 'Preferred Customer Acquisition (CAB)',
              type: 'circular',
              progress: 1,
              label: '1 / 10',
              hint: 'Earn $1000!'
            }
          ]
        }]
      }, {
        id: 'fast-start',
        title: 'Fast Start Program',
        rows: [{
          id: 'top',
          cols: [
            {
              id: 'day30',
              title: '30 Day Goal',
              type: 'circular',
              progress: 85,
              label: '263 / 300',
              hint: '$250 Earned on day 27!'
            },
            {
              id: 'day60',
              title: '60 Day Goal',
              type: 'circular',
              progress: 17,
              label: '8 / 9 <br> Level 2',
              hint: 'So close! Only 8 of the 9 qualified by day 90!'
            },
            {
              id: 'day120',
              title: '120 Day Goal',
              type: 'circular',
              progress: 1,
              label: '27 / 27',
              hint: 'Earned $2250 on day 103!'
            }
          ]
        }, {
          id: 'timeleft',
          cols: [
            {
              id: 'remaining',
              // title: 'Time Remaining',
              type: 'linear',
              progress: 80,
              label: '12 Days Remaining',
              hint: 'Your fast start day ends on June 2, 2020 at 11:59 PM Pacific Time'
            }]
        }]
      }]
    }
  },
  async mounted() {
    if (this.isMobile) {
      this.dataTableHeaders = [
        { text: 'Order #', value: 'integrationOid', sortable: false },
        { text: 'Date', value: 'awardedDate', sortable: false },
        { text: 'Payout', value: 'payout', sortable: false }
      ]
    }
    await this.compGetPeriods({ when: this.$moment(this.getCompanyTime()).format('YYYY-MM-DD') })
  },
  methods: {
    formatEarning(earning) {
      let currency = '$'
      if (earning.payeeMarket === 'gbr') {
        currency = '£'
      }

      return `${currency}${earning.payout.toFixed(2)}`
    },
    getCompanyTime(time) {
      const date = time ? new Date(time) : new Date()
      return new Intl.DateTimeFormat('en-US', {
        timeZone: this.$tenantInfo.companyTime,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }).format(date)
    },
    async loadLeaderboards(period) {
      const variables = {
        input: {
          tenantId: this.$tenantInfo.id,
          start: period.open,
          end: period.close,
          omitTagIds: [34]
        }
      }
      const { data: { rangedFrontlineLeaderboardByTeam } } = await this.$apollo.query({
        query: FRONTLINE_LEADERBOARD_BY_RANGE,
        variables
      })

      const { data: { rangedFrontlineLeaderboard } } = await this.$apollo.query({
        query: COMPANY_FRONTLINE_LEADERBOARD_BY_RANGE,
        variables
      })
      this.teamLeaderboard = rangedFrontlineLeaderboardByTeam
      this.companyLeaderboard = rangedFrontlineLeaderboard
    },
    ...mapMutations([
      UserMutations.MEMBER_QUERY,
      Mutations.SET_GATE
    ]),
    ...mapActions([
      CompActions.GET_PERIODS,
      CompActions.GET_STATS
    ])
  },
  computed: {
    month() {
      let month = ~~this.$moment().format('M')
      // if (this.year === 2020) {
      //   month = Math.max(month, 2)
      // }
      return month
    },
    ...mapState({
      user: state => state.user,
      engineStats: state => state.comp.stats,
      engineStatsLoading: state => state.comp.engineStatsLoading,
      openPeriod: state => state.comp.periods.open && state.comp.periods.open[0]
    }),
    features() {
      return this.$tenantInfo.features.dashboard
    },
    ...mapGetters(['contactId', 'memberId', 'member', 'slug', 'tenantIntegrations'])
  },
  watch: {
    openPeriod(newVal) {
      this.loadLeaderboards(newVal)
    }
  },
  apollo: {
    earnings: {
      query: COMP_PAYOUTS_QUERY,
      variables: {
        input: {
          page: 1,
          pageSize: 25
        }
      },
      update({ compRecentEarnings }) {
        return _.get(compRecentEarnings, 'results', [])
      }
    },
    team: {
      query: MEMBER_STATS_BY_DEPTH,
      variables () {
        return {
          input: {
            relativeDepthIn: [1],
            targetId: this.memberId
          }
        }
      },
      loadingKey: 'loadingStats',
      update ({ getTeamDataByDepth }) {
        // Frist one is always personal stats
        const [personal, ...rest] = getTeamDataByDepth
        this.personalStats = personal
        return rest
      }
    },
    memberCount: {
      query: MAX_MRN,
      variables: {
        input: {
          typeId: null
        }
      },
      loadingKey: 'loadingCount',
      update({ memberGetMaxMrnForTenant }) {
        return memberGetMaxMrnForTenant
      }
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding-bottom: 45px;
}
section {
  margin-top: 8px;
}

section .name {
  font-size: 12px;
  color: #666666;
  font-weight: normal;
  text-transform: uppercase;
}

section .stat {
  font-size: 24px;
  color: #000000;
  font-weight: normal;
}
.dashboard .incentive{
  margin: 16px -16px -16px -16px;
}
.dashboard .incentive-count{
  border: 1px solid #a1213b;
  text-align: center;
  background-color: #a1213b;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  padding: 5px 0;
}
#recent-sales-card {
  height: 100%;
  min-height: 554px;
}
#personal-card-layout {
  height: 100%;
}
</style>
