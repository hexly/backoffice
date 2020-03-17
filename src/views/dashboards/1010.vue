<template>
  <div class="full-wrapper dashboard">
    <Announcement />
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
        <RankRequirementsCard
          :stats         ="engineStats"
          :statsDisabled ="statsDisabled"
          :loading       ="engineStatsLoading"
        />
      </v-col>
    </v-row>
    <v-row wrap>
      <v-col col="12" sm="6">
        <TeamOverview :stats="engineStats" :total="memberCount" :loading ="engineStatsLoading"/>
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
            <template v-slot:item.payout="{ item }">
              {{formatEarning(item)}}
            </template>
            </v-data-table>
          </v-responsive>
        </v-card>
      </v-col>
    </v-row>
    <Directory class="py-2" :self="personalStats" :frontline="team" title="Your Circle of Influence" membersTypeName="Influencer"/>
    <CompanyMap class="py-2" title="Influencers around the world"/>
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
    DashCard,
    PersonalCard,
    Directory,
    CompanyMap,
    Announcement,
    Badges,
    Social,
    RankRequirementsCard,
    TeamOverview
  },
  data() {
    return {
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
      isMobile: isMobile()
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
      if (this.year === 2020) {
        month = Math.max(month, 2)
      }
      return month
    },
    ...mapState({
      user: state => state.user,
      engineStats: state => state.comp.stats,
      engineStatsLoading: state => state.comp.engineStatsLoading
    }),
    ...mapGetters(['contactId', 'memberId', 'member', 'slug', 'tenantIntegrations'])
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
