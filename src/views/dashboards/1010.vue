<template>
  <div class="full-wrapper dashboard">
    <Announcement />
    <!-- <template v-if="banners">
      <Banner v-for="banner in banners" :key="banner.key" :banner="banner"/>
    </template> -->
    <v-row wrap>
      <v-col cols="12" md="6">
        <v-layout id="personal-card-layout" column>
          <v-flex>
            <PersonalCard memberName="Your Influencer Number:">
              <div slot="footer">
                <Badges :memberId="member.id"/>
                <div v-if="tenantIntegrations.length === 0">
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
        <CompRanksCard
          v-if="selectedPeriod.metadata && selectedPeriod.metadata.version === 2"
          :stats         ="engineStats"
          :statsDisabled ="statsDisabled"
          :loading       ="engineStatsLoading"
        />
        <RankRequirementsCard
          v-else
          :stats         ="engineStats"
          :statsDisabled ="statsDisabled"
          :loading       ="engineStatsLoading"
        />
      </v-col>
    </v-row>
    <v-row wrap>
      <v-col col="12" sm="6">
        <TeamOverview :stats="engineStats" :total="memberCount" :loading="engineStatsLoading"/>
      </v-col>
      <v-col col="12" sm="6">
        <v-card id="recent-sales-card">
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Recent Earnings</v-toolbar-title>
          </v-toolbar>
          <v-responsive>
            <v-data-table
              :headers ="dataTableHeaders"
              :items   ="earnings"
              :loading ="$apollo.queries.earnings.loading"
            >
            <template v-slot:item.issuedOn="{ item }">
              {{$moment(item.issuedOn).format('L')}}
            </template>
            <template v-slot:item.amount="{ item }">
              {{formatEarning(item)}}
            </template>
            </v-data-table>
          </v-responsive>
        </v-card>
      </v-col>
    </v-row>
    <v-row wrap>
      <v-col cols="12" sm="6">
        <LeaderBoard :leaders="companyLeaderboard" title="Top Team Builders (Company)" message="New influencers this period: "/>
      </v-col>
      <v-col cols="12" sm="6">
        <LeaderBoard :leaders="teamLeaderboard" title="Top Team Builders (Your Team)" message="New influencers this period: "/>
      </v-col>
    </v-row>
    <v-card>
      <v-card-title class="secondary white--text headline">
        Your Circle Of Influencer
      </v-card-title>
      <v-card-text>
        <p class="title pt-5">
        Your circle of influence has moved to the team page. <a href="/team#directory">View My Circle Of Influence</a>
        </p>
      </v-card-text>
    </v-card>
    <CompanyMap class="py-2" title="Influencers around the world"/>
  </div>
</template>

<script>

import * as _ from 'lodash'
import { isMobile } from '@/utils/isMobile'

import Social from '@/components/profile/Social.vue'
import PersonalCard from '@/components/dashboard/PersonalCard.vue'
import DashCard from '@/components/DashboardCard.vue'
import CompanyMap from '@/components/dashboard/CompanyMap.vue'
import Announcement from '@/components/dashboard/Announcement.vue'
import Banner from '@/components/dashboard/Banner.vue'
import Badges from '@/components/Badges.vue'
import RankRequirementsCard from '@/components/RankRequirementsCard.vue'
import CompRanksCard from '@/components/CompRanksCard.vue'
import TeamOverview from '@/components/dashboard/TeamOverview.vue'
import LeaderBoard from '@/components/Leaderboard.vue'

import {
  FRONTLINE_LEADERBOARD_BY_RANGE,
  COMPANY_FRONTLINE_LEADERBOARD_BY_RANGE
} from '@/graphql/Leaderboard.js'
import { ENGINE_DASHBOARD_BANNERS } from '@/graphql/CompStats.gql'
import { GET_MEMBER_PAYOUTS } from '@/graphql/Member.gql'
import { MAX_MRN } from '@/graphql/MemberStats.gql'
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
import { UserMutations } from '@/stores/UserStore'
import { CompActions } from '@/stores/CompStore'
import { Mutations } from '@/store'

export default {
  name: 'dashboard',
  components: {
    DashCard,
    PersonalCard,
    CompanyMap,
    Announcement,
    Banner,
    Badges,
    Social,
    RankRequirementsCard,
    TeamOverview,
    LeaderBoard,
    CompRanksCard
  },
  data() {
    return {
      year: ~~this.$moment().format('Y'),
      dataTableHeaders: [
        { text: 'Payout', value: 'amount', sortable: false },
        { text: 'Reason', value: 'note', sortable: false },
        { text: 'Date', value: 'issuedOn', sortable: false }
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
      companyLeaderboard: []
    }
  },
  methods: {
    formatEarning(earning) {
      let currency = '$'
      if (earning.currencyId === 2) {
        currency = '£'
      }

      return `${currency}${earning.amount / 100}`
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
      CompActions.GET_STATS
    ])
  },
  computed: {
    month() {
      let month = ~~this.$moment().format('M')
      if (this.year === 2020) {
        month = Math.max(month, 2)
      }
      return month
    },
    ...mapState({
      user: state => state.user,
      engineStats: state => state.comp.stats,
      engineStatsLoading: state => state.comp.engineStatsLoading,
      openPeriod: state => state.comp.periods.open && state.comp.periods.open[0],
      selectedPeriod: state => state.comp.selectedPeriod
    }),
    ...mapGetters(['contactId', 'memberId', 'member', 'slug', 'tenantIntegrations'])
  },
  watch: {
    openPeriod(newVal) {
      this.loadLeaderboards(newVal)
    }
  },
  apollo: {
    banners: {
      query: ENGINE_DASHBOARD_BANNERS,
      deep: true,
      variables() {
        const date = this.selectedPeriod ? this.selectedPeriod.open || null : null
        return {
          input: {
            memberId: this.memberId,
            date
          }
        }
      },
      update(obj) {
        return _.get(obj, 'banners.results', [])
      }
    },
    earnings: {
      query: GET_MEMBER_PAYOUTS,
      update({ getPrincipal }) {
        return _.get(getPrincipal, 'member.payouts', [])
          .filter(p => p.status !== 'REVERSED' && (p.metadata.origination && p.metadata.origination.type === 'sale'))
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
