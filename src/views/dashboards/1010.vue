<template>
  <div class="full-wrapper dashboard">
    <v-layout row>
      <v-flex xs12 class="pa-2">
        <Announcement />
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 md6>
        <v-layout id="personal-card-layout" column>
          <v-flex class="pa-2">
            <PersonalCard memberName="Your Influencer Number:">
              <div slot="footer">
                <Badges :memberId="member.id"/>
                <div v-if="tenantIntegrations.length === 0">
                  <h3 class="text-xs-center">Social Accounts<sup>*</sup></h3>
                  <div class="text-xs-center">
                    <small> Once linked, you can access your social accounts in your profile page </small>
                  </div>
                  <Social :key="tenantIntegrations.length"/>
                </div>
              </div>
            </PersonalCard>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs12 md6>
        <v-layout row wrap justify-space-between>
          <v-flex xs12 class="pa-2">
            <DashCard
              color="white"
              darken="1"
              :display="memberCount"
              subheading="Total Influencers"
              icon="location_city"
              :loading="loadingCount > 0"
            />
          </v-flex>
          <v-flex xs12 sm6 class="pa-2">
            <DashCard
              color="white"
              darken="1"
              :display="generationCount.all"
              subheading="Your Circle of Influence"
              icon="supervised_user_circle"
              :loading="generationCountLoading > 0"
            />
          </v-flex>
          <v-flex xs12 sm6 class="pa-2">
            <DashCard
              color="white"
              darken="1"
              :display="generationCount['1']"
              subheading="Personally Sponsored"
              icon="account_tree"
              :loading="generationCountLoading > 0"
            />
          </v-flex>
          <v-flex xs12 sm6 class="pa-2">
            <DashCard
              color="white"
              darken="1"
              :display="generationCount['2']"
              subheading="Second Line Size"
              icon="looks_two"
              :loading="generationCountLoading > 0"
            />
          </v-flex>
          <v-flex xs12 sm6 class="pa-2">
            <DashCard
              color="white"
              darken="1"
              :display="generationCount['3']"
              subheading="Third Line Size"
              icon="looks_3"
              :loading="generationCountLoading > 0"
            />
          </v-flex>
          <v-flex class="pa-2">
            <v-card style="height: 100%;">
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
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 sm6 pa-2>
        <v-card id="recent-sales-card">
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Recent Sales</v-toolbar-title>
          </v-toolbar>
          <v-card-media>
            <v-data-table
              :headers ="dataTableHeaders"
              :items   ="dataTableItems"
              hide-actions
            >
              <template
                slot="items"
                slot-scope="props"
              >
                <tr @click="props.expanded = !props.expanded">
                  <td>{{props.item.name}}</td>
                  <td>{{props.item.date}}</td>
                  <td>{{props.item.amount}}</td>
                  <td>{{props.item.points}}</td>
                </tr>
              </template>
            </v-data-table>
          </v-card-media>
        </v-card>
      </v-flex>
      <v-flex xs12 sm6 pa-2>
        <RankRequirementsCard
          :stats         ="rankRequirementsStats"
          :statsDisabled ="statsDisabled"
        />
      </v-flex>
    </v-layout>
    <Directory class="pa-2" :self="personalStats" :frontline="team" title="Your Circle of Influence" membersTypeName="Influencer"/>
    <CompanyMap class="pa-2" title="Influencers around the world"/>
  </div>
</template>

<script>
import Social from '@/components/profile/Social.vue'
import PersonalCard from '@/components/dashboard/PersonalCard.vue'
import Directory from '@/components/dashboard/Directory.vue'
import DashCard from '@/components/DashboardCard.vue'
import CompanyMap from '@/components/dashboard/CompanyMap.vue'
import Announcement from '@/components/dashboard/Announcement.vue'
import Badges from '@/components/Badges.vue'
import RankRequirementsCard from '@/components/RankRequirementsCard.vue'

import { MEMBER_STATS_BY_DEPTH, MAX_MRN, TEAM_SIZE_BY_GENERATION } from '@/graphql/MemberStats.gql'
import { mapMutations, mapState, mapGetters } from 'vuex'
import { UserMutations } from '@/stores/UserStore'
import { Mutations } from '@/store'

// const tenantId = ~~process.env.VUE_APP_TENANT_ID

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
      personalStats: {
        counts: {
          total: 0,
          level1: 0
        }
      },
      dataTableHeaders: [
        { text: 'Customer', value: 'name', sortable: false },
        { text: 'Date', value: 'date', sortable: false },
        { text: 'Amount', value: 'amount', sortable: false },
        { text: 'Points', value: 'points', sortable: false }
      ],
      dataTableItems: [
        {
          name: 'Jon Doe',
          date: '12/03/2019',
          amount: '$132.87',
          points: '120'
        },
        {
          name: 'Jon Doe',
          date: '12/03/2019',
          amount: '$132.87',
          points: '120'
        },
        {
          name: 'Jon Doe',
          date: '12/03/2019',
          amount: '$132.87',
          points: '120'
        },
        {
          name: 'Jon Doe',
          date: '12/03/2019',
          amount: '$132.87',
          points: '120'
        }
      ],
      rankRequirementsStats: {
        rank: 0,
        psv: 0,
        psvMax: 50,
        cpsv: 0,
        cpsvMax: -1,
        gsv: 0,
        gsvMax: -1,
        al: 0,
        alMax: -1,
        pabql: 0,
        pabqlMax: -1,
        dsv: 0,
        dsvMax: -1,
        adsv: 0,
        adsvMax: -1
      },
      memberCount: 0,
      team: [],
      generationCount: {},
      loadingStats: 0,
      loadingCount: 0,
      generationCountLoading: 0,
      statsDisabled: false
    }
  },
  async mounted() {

  },
  watch: {
    '$apollo.loading'(newVal) {
      this.setLoading(newVal)
    }
  },
  methods: {
    ...mapMutations([
      UserMutations.MEMBER_QUERY,
      Mutations.SET_GATE,
      Mutations.SET_LOADING
    ])
  },
  computed: {
    ...mapState({
      user: state => state.user
    }),
    ...mapGetters(['contactId', 'memberId', 'member', 'slug', 'tenantIntegrations'])
  },
  apollo: {
    team: {
      query: MEMBER_STATS_BY_DEPTH,
      variables () {
        return {
          input: {
            relativeDepthIn: [1],
            targetId: this.$store.state.user.principal.memberId
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
            memberId: this.$store.state.user.principal.memberId
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
}
#personal-card-layout {
  height: 100%;
}
</style>
