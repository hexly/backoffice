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
        <DashCard
          color="white"
          darken="1"
          :display="memberCount"
          subheading="Total Influencers"
          icon="location_city"
          :loading="loadingCount > 0"
        />
        <v-row>
          <v-col cols="12" md="6">
            <DashCard
              color="white"
              darken="1"
              :display="generationCount.all"
              subheading="Your Circle of Influence"
              icon="supervised_user_circle"
              :loading="generationCountLoading > 0"
            />
          </v-col>
          <v-col cols="12" md="6">
            <DashCard
              color="white"
              darken="1"
              :display="generationCount['1']"
              subheading="Personally Sponsored"
              icon="account_tree"
              :loading="generationCountLoading > 0"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6">
            <DashCard
              color="white"
              darken="1"
              :display="generationCount['2']"
              subheading="Second Line Size"
              icon="looks_two"
              :loading="generationCountLoading > 0"
            />
          </v-col>
          <v-col cols="12" md="6">
            <DashCard
              color="white"
              darken="1"
              :display="generationCount['3']"
              subheading="Third Line Size"
              icon="looks_3"
              :loading="generationCountLoading > 0"
            />
          </v-col>
        </v-row>
        <v-card>
          <v-card-text>
            <p class="title">Early Access Incentive</p>
            <p>To qualify, sponsor at least two Influencers during the Early Access period and help them become "Active" (or sell $50) during the first month of sales (you must also be Active). </p>
            <ol>
              <li>$20/£16 for EVERY personally sponsored Active Influencer</li>
              <li>$5/£4 for EVERY Active Influencer on your Second Line.</li>
            </ol>
            <p>The qualification period begins on your enrollment date and ends when the company begins selling product.</p>
            <v-layout row class="incentive">
              <v-flex class="incentive-count" xs6>
                {{generationCount['1']}}
                <br/>
                Personally Sponsored
              </v-flex>
              <v-flex class="incentive-count" xs6>
                {{generationCount['2']}}
                <br/>
                Second Line
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row wrap>
      <v-col col="12" sm="6">
        <v-card id="recent-sales-card">
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Recent Earnings</v-toolbar-title>
          </v-toolbar>
          <v-responsive>
            <v-data-table
              :headers             ="dataTableHeaders"
              :items               ="earnings"
              :loading             ="$apollo.queries.earnings.loading"
            >
              <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                  <td>{{props.item.integrationOid}}</td>
                  <td>{{$moment(props.item.awardedDate).format('L')}}</td>
                  <td v-if="!isMobile">{{props.item.reason}}</td>
                  <td v-if="!isMobile">{{props.item.seller}}</td>
                  <td>{{formatEarning(props.item)}}</td>
                </tr>
              </template>
            </v-data-table>
          </v-responsive>
        </v-card>
      </v-col>
      <v-col col="12" sm="6">
        <RankRequirementsCard
          :stats         ="engineStats"
          :statsDisabled ="statsDisabled"
          :loading       ="loadingRanks > 0"
        />
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

import { COMP_PAYOUTS_QUERY, ENGINE_STATS_QUERY } from '@/graphql/CompStats.gql'
import { MEMBER_STATS_BY_DEPTH, MAX_MRN, TEAM_SIZE_BY_GENERATION } from '@/graphql/MemberStats.gql'
import { mapMutations, mapState, mapGetters } from 'vuex'
import { UserMutations } from '@/stores/UserStore'
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
    RankRequirementsCard
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
      isMobile: isMobile(),
      engineStats: null
    }
  },
  mounted() {
    if (this.isMobile) {
      this.dataTableHeaders = [
        { text: 'Order #', value: 'integrationOid', sortable: false },
        { text: 'Date', value: 'awardedDate', sortable: false },
        { text: 'Payout', value: 'payout', sortable: false }
      ]
    }
  },
  methods: {
    formatEarning(earning) {
      let currency = '$'
      if (earning.payeeMarket === 'gbr') {
        currency = '£'
      }

      return `${currency}${earning.payout.toFixed(2)}`
    },
    ...mapMutations([
      UserMutations.MEMBER_QUERY,
      Mutations.SET_GATE
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
    memberId() {
      return _.get(this, 'user.memberId')
    },
    ...mapState({
      user: state => state.user
    }),
    ...mapGetters(['contactId', 'memberId', 'member', 'slug', 'tenantIntegrations'])
  },
  apollo: {
    earnings: {
      query: COMP_PAYOUTS_QUERY,
      update(data) {
        return _.get(data, 'compRecentEarnings.earnings', [])
      }
    },
    engineStats: {
      query: ENGINE_STATS_QUERY,
      variables() {
        return {
          input: {
            forDate: this.$moment().format('YYYY-MM-DD'),
            membersIn: [this.memberId]
          }
        }
      },
      loadingKey: 'loadingRanks',
      update({ engineStatsByMemberIds }) {
        return engineStatsByMemberIds[0]
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
    },
    generationCount: {
      query: TEAM_SIZE_BY_GENERATION,
      variables() {
        return {
          input: {
            memberId: this.memberId
          }
        }
      },
      loadingKey: 'generationCountLoading',
      update({ membershipTeamSizes }) {
        return membershipTeamSizes.reduce((all, s) => {
          all[s.generation || 'all'] = s.count
          return all
        }, {})
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
