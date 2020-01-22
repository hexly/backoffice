<template>
  <div class="full-wrapper dashboard">
    <v-layout row>
      <v-flex xs12 class="pa-2">
        <Announcement />
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 md6>
        <v-layout column>
          <v-flex  class="pa-2">
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
              :display="personalStats.counts.total"
              subheading="Your Circle of Influence"
              icon="supervised_user_circle"
              :loading="loadingStats > 0"
            />
          </v-flex>
          <v-flex xs12 sm6 class="pa-2">
            <DashCard
              color="white"
              darken="1"
              :display="personalStats.counts.level1"
              subheading="Personally Sponsored"
              icon="account_tree"
              :loading="loadingStats > 0"
            />
          </v-flex>
          <v-flex xs12 sm6 class="pa-2">
            <DashCard
              color="white"
              darken="1"
              :display="personalStats.counts.level2"
              subheading="Second Line Size"
              icon="looks_two"
              :loading="loadingStats > 0"
            />
          </v-flex>
          <v-flex xs12 sm6 class="pa-2">
            <DashCard
              color="white"
              darken="1"
              :display="personalStats.counts.level3"
              subheading="Third Line Size"
              icon="looks_3"
              :loading="loadingStats > 0"
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
                    {{personalStats.counts.level1}}
                    <br/>
                    Personally Sponsored
                  </v-flex>
                  <v-flex class="incentive-count" xs6>
                    {{personalStats.counts.level2}}
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
        <v-card>
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Recent Sales</v-toolbar-title>
          </v-toolbar>
          <v-card-content>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jon Doe</td>
                  <td>12/03/2019</td>
                  <td>$132.87</td>
                  <td>120</td>
                </tr>
                <tr>
                  <td>Jon Doe</td>
                  <td>12/03/2019</td>
                  <td>$132.87</td>
                  <td>120</td>
                </tr>
                <tr>
                  <td>Jon Doe</td>
                  <td>12/03/2019</td>
                  <td>$132.87</td>
                  <td>120</td>
                </tr>
                <tr>
                  <td>Jon Doe</td>
                  <td>12/03/2019</td>
                  <td>$132.87</td>
                  <td>120</td>
                </tr>
              </tbody>
            </table>
          </v-card-content>
        </v-card>
      </v-flex>
      <v-flex xs12 sm6 pa-2>
        <v-layout row wrap>
          <v-card width="100%">
            <v-toolbar color="secondary" dark>
              <v-toolbar-title>Rank Requirements</v-toolbar-title>
            </v-toolbar>
            <v-card-content class="pa-3">
              <v-layout row justify-space-between pb-4>
                <v-flex px-3>
                  <div class="title">Rank</div>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex px-3 text-xs-right>
                  <div class="title">Rank 4</div>
                </v-flex>
              </v-layout>
              <v-layout row justify-space-between wrap>
                <v-flex px-3>
                  <div class="title">PSV</div>
                  <div class="caption grey--text darken-1">Personal Sales Volume</div>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex px-3 text-xs-right>
                  <div class="title">75</div>
                  <div class="caption grey--text darken-1">75% of 100</div>
                </v-flex>
                <v-flex xs12 px-3>
                  <v-progress-linear  color="success" height="5" value="60"></v-progress-linear>
                </v-flex>
              </v-layout>
              <v-layout row justify-space-between wrap>
                <v-flex px-3>
                  <div class="title">CPSV</div>
                  <div class="caption grey--text darken-1">Career PSV</div>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex px-3 text-xs-right>
                  <div class="title">500</div>
                  <div class="caption grey--text darken-1">100% of 500</div>
                </v-flex>
                <v-flex xs12 px-3>
                  <v-progress-linear  color="success" height="5" value="100"></v-progress-linear>
                </v-flex>
              </v-layout>
              <v-layout row justify-space-between wrap>
                <v-flex px-3>
                  <div class="title">GSV</div>
                  <div class="caption grey--text darken-1">Group Sales Volume</div>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex px-3 text-xs-right>
                  <div class="title">683</div>
                  <div class="caption grey--text darken-1">68.3% of 1000</div>
                </v-flex>
                <v-flex xs12 px-3>
                  <v-progress-linear  color="success" height="5" value="68.6"></v-progress-linear>
                </v-flex>
              </v-layout>
              <v-layout row justify-space-between wrap>
                <v-flex px-3>
                  <div class="title">AL</div>
                  <div class="caption grey--text darken-1">Active Legs</div>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex px-3 text-xs-right>
                  <div class="title">3</div>
                  <div class="caption grey--text darken-1">75% of 4</div>
                </v-flex>
                <v-flex xs12 px-3>
                  <v-progress-linear  color="success" height="5" value="75"></v-progress-linear>
                </v-flex>
              </v-layout>
              <v-layout row justify-space-between wrap>
                <v-flex px-3>
                  <div class="title">PABQL</div>
                  <div class="caption grey--text darken-1">Paid-As Bonus Qualified Legs</div>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex px-3 text-xs-right>
                  <div class="title">0</div>
                  <div class="caption grey--text darken-1">
                    N/A
                    <v-tooltip slot="append" left>
                        <v-icon slot="activator" small>info</v-icon>
                        <span>Not applicable for next rank</span>
                    </v-tooltip>
                  </div>
                </v-flex>
                <v-flex xs12 px-3>
                  <v-progress-linear  color="success" height="5" value="0"></v-progress-linear>
                </v-flex>
              </v-layout>
              <v-layout row justify-space-between wrap>
                <v-flex px-3>
                  <div class="title">DSV</div>
                  <div class="caption grey--text darken-1">Downline Sales Volume</div>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex px-3 text-xs-right>
                  <div class="title">685</div>
                  <div class="caption grey--text darken-1">
                    N/A
                    <v-tooltip slot="append" left>
                        <v-icon slot="activator" small>info</v-icon>
                        <span>Not applicable for next rank</span>
                    </v-tooltip>
                  </div>
                </v-flex>
                <v-flex xs12 px-3>
                  <v-progress-linear  color="success" height="5" value="0"></v-progress-linear>
                </v-flex>
              </v-layout>
              <v-layout row justify-space-between wrap>
                <v-flex px-3>
                  <div class="title">ADSV</div>
                  <div class="caption grey--text darken-1">
                    Adjusted Downline Sales Volume
                    <v-tooltip slot="append" right>
                        <v-icon slot="activator" small>help</v-icon>
                        <span>Maximum 60% DSV from any one leg</span>
                    </v-tooltip>
                  </div>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex px-3 text-xs-right>
                  <div class="title">500</div>
                  <div class="caption grey--text darken-1">
                    N/A
                    <v-tooltip slot="append" left>
                        <v-icon slot="activator" small>info</v-icon>
                        <span>Not applicable for next rank</span>
                    </v-tooltip>
                  </div>
                </v-flex>
                <v-flex xs12 px-3>
                  <v-progress-linear  color="success" height="5" value="0"></v-progress-linear>
                </v-flex>
              </v-layout>
            </v-card-content>
          </v-card>
        </v-layout>
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

import { MEMBER_STATS_BY_DEPTH, MAX_MRN } from '@/graphql/MemberStats.gql'
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
    Social
  },
  data() {
    return {
      personalStats: {
        counts: {
          total: 0,
          level1: 0
        }
      },
      memberCount: 0,
      team: [],
      loadingStats: 0,
      loadingCount: 0
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
</style>
