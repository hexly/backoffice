<template>
  <v-card max-width="320" min-width="320" elevation="auto" class="my-2 team-card">
    <div>
      <v-img
        :src="getAvatar"
        cover
        center
        aspect-ratio="1"
        class="cardImg white--text"
        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      >
        <v-menu v-if="actions" bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn absolute right top dark icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title @click="viewTeam()"><v-btn block>View Team</v-btn></v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title @click="viewSales()">
                <v-dialog content-class="sales-dialog" v-model="salesDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn block v-bind="attrs" v-on="on">View Sales</v-btn>
                </template>
                  <Sales :mId="user.id" :mName="user.name" @close="salesDialog = false"/>
                </v-dialog>
              </v-list-item-title>
            </v-list-item>
            <v-list-item v-if="displaySuccessStart">
              <v-list-item-title @click="showSuccessStartDialog = true"><v-btn block>View Success Start</v-btn></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-card-title class="fill-height align-end">
          <v-flex row>
            <h3>{{(user.name).toUpperCase()}}</h3>
          </v-flex>
        </v-card-title>
        <v-card-subtitle v-if="compStats && compStats.metadata && compStats.metadata.recognizedRank > 0" class="subtitle">
          <small>Recognized Rank: {{compStats.metadata.recognizedRank}}</small>
        </v-card-subtitle>
      </v-img>
      <div v-if="actions">
        <v-tabs @change="handleTabChange" :value="activeTab" :hide-slider="true">
          <v-tab
            class="dense"
            @click="$emit('tabActivated', index)"
            v-for="(heading, index) in tabHeadings"
            :key="heading"
          >{{ heading }}
          </v-tab>
          <v-tab-item>
            <v-card class="item-container-card" flat>
              <template v-if="showTerminated">
                <v-alert type="info" text class="pa-1">{{$tenantInfo.distributorLabel}} Terminated</v-alert>
              </template>
              <v-list two-line>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon color="indigo"> mdi-calendar-today </v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{$moment(joinedOn, 'YYYY-MM-DD').format('ll')}}</v-list-item-title>
                    <v-list-item-subtitle>{{$tenantInfo.distributorLabel}} since</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-divider inset></v-divider>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon color="indigo"> mdi-cake </v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{$moment(birthday, 'YYYY-MM-DD').format('MMMM Do')}}</v-list-item-title>
                    <v-list-item-subtitle>Birthday</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <template v-if="email">
                  <v-divider inset></v-divider>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon color="indigo"> mdi-email </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        <a :href="`mailto:${(email).toLowerCase()}`">
                          {{(email).toLowerCase()}}
                        </a>
                      </v-list-item-title>
                      <v-list-item-subtitle>Email</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <template v-if="address && address.street">
                  <v-divider inset></v-divider>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon color="indigo"> mdi-map-marker </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{address.street}}</v-list-item-title>
                      <v-list-item-subtitle v-if="address.street2">{{address.street2}}</v-list-item-subtitle>
                      <v-list-item-subtitle>{{address.city}}, {{address.province}} {{address.postalCode}} {{address.country}}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <template v-if="slug">
                  <v-divider inset></v-divider>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon color="indigo"> mdi-store </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        <a target="_blank" :href="$tenantInfo.storeUrl.replace('{slug}', slug)">{{slug}}</a>
                      </v-list-item-title>
                      <v-list-item-subtitle>Store Link</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <template v-if="user.relativeDepth">
                  <v-divider inset></v-divider>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon color="indigo"> account_tree </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        <v-layout align-center row wrap>
                          <template v-for="parent in user.ancestors">
                            <v-tooltip top slot="append" :key="parent.profileUrl">
                              <template v-slot:activator="{ on }">
                                <v-avatar class="generation-avatar ma-1 elevation-3" size="60px" v-on="on">
                                  <img :src="parent.profileUrl || $tenantInfo.placeholder" alt="Avatar">
                                </v-avatar>
                              </template>
                              <span>{{parent.name}}</span>
                            </v-tooltip>
                          </template>
                        </v-layout>
                      </v-list-item-title>
                      <v-list-item-subtitle>Generation: {{user.relativeDepth}}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <div class="item-container-card">
              <v-card v-if="!$apolloData.loading" flat style="padding-top: 15px;">
                <TeamDetails :compStats="compStats"/>
              </v-card>
              <v-flex v-else d-flex justify-center align-center class="text-center">
                <v-progress-circular indeterminate :size="50" :width="5" color="primary"></v-progress-circular>
              </v-flex>
            </div>
          </v-tab-item>
          <v-tab-item>
            <div class="item-container-card">
              <EngineRankCard
                v-if="!$apolloData.loading && compStats"
                :stats="compStats"
                :statsDisabled="statsDisabled"
                :tabMode="true"
              />
              <v-flex v-else d-flex justify-center align-center class="text-center">
                <v-progress-circular indeterminate :size="50" :width="5" color="primary"></v-progress-circular>
              </v-flex>
            </div>
          </v-tab-item>
          <v-tab-item>
            <div v-if="!$apolloData.loading">
              <v-card v-if="awards.length" class="badge-card" d-flex justify-center wrap flat>
                <v-chip
                  pill
                  v-for="award in awards"
                  :class="'badge elevation-3' + (awardHover[award.name] ? ' badge-hover' : '')"
                  :color="award.metadata.color"
                  :text-color="award.metadata.text"
                  :key="award.name"
                  @mouseover="handleHover($event, award.name)"
                  @mouseleave="handleHover($event, award.name)"
                  @mouseout="handleHover($event, award.name)"
                >
                  <v-avatar left :color="award.metadata.accent">
                    <v-icon>{{award.metadata.icon}}</v-icon>
                  </v-avatar>
                  <transition css name="expand" @after-leave="afterLeaveHandler(award.name)">
                    <span v-show="awardHover[award.name]">{{award.name}}</span>
                  </transition>
                </v-chip>
              </v-card>
              <v-card v-else class="badge-card" d-flex justify-center wrap flat>
                <div>No Awards Yet!</div>
              </v-card>
            </div>
            <v-flex v-else d-flex justify-center align-center class="badge-card text-center">
              <v-progress-circular indeterminate :size="50" :width="5" color="primary"></v-progress-circular>
            </v-flex>
          </v-tab-item>
        </v-tabs>
      </div>
    </div>
    <v-dialog v-model="showSuccessStartDialog" max-width="500px">
      <InsightsPanel
        :data="successStartSection"
        :teamModalMode="true"
        :displayName="user.displayName"
        @closeModal="showSuccessStartDialog = false"
      />
    </v-dialog>
  </v-card>
</template>

<script>
import { get, omit } from 'lodash'

import { mapState } from 'vuex'
import CompRanksCard from '@/components/CompRanksCard.vue'
import TeamDetails from '@/components/TeamDetails.vue'
import { AWARDS_BY_ID } from '@/graphql/Team.gql'
import { INSIGHTS_COLLECTION } from '@/graphql/comp.gql'
import InsightsPanel from '@/components/insights/InsightsPanel.vue'
import EngineRankCard from '@/components/EngineRankCard.vue'
import Sales from '@/views/Sales.vue'
export default {
  name: 'TeamCard',
  components: {
    TeamDetails,
    CompRanksCard,
    InsightsPanel,
    EngineRankCard,
    Sales
  },
  data () {
    return {
      statsDisabled: false,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      displayedRank: null,
      show: false,
      awardHover: {},
      skipTeamQuery: true,
      skipAwardsQuery: true,
      skipRankQuery: true,
      awards: [],
      engineStats: null,
      tabHeadings: [
        'Info',
        'Team',
        'Rank',
        'Awards'
      ],
      tabContent: {
        teamSize: null,
        frontLine: null,
        secondLine: null,
        thirdLine: null
      },
      successStartSection: null,
      showSuccessStartDialog: false,
      salesDialog: false
    }
  },
  props: {
    user: Object,
    team: Object,
    actions: Boolean,
    stats: Object,
    loading: Boolean,
    noData: String,
    rank: Number,
    compStats: Object,
    teamSearchMode: Boolean,
    activeTab: Number,
    dashboardMode: Boolean,
    total: Number
  },
  methods: {
    filterRanks (ranks) {
      return omit(ranks, ['0'])
    },
    formatDate (value) {
      return this.$moment(value, 'YYYY-MM-DD').from(this.$moment())
    },
    viewTeam (user = this.user) {
      this.$emit('viewTeam', user)
    },
    viewSales(user = this.user) {
      // Load Sales Screen
    },
    getRank (user = this.user) {
      // Query rank here
      // this.displayedRank = 4
    },
    handleTabChange (e) {
      switch (e) {
      case 1:
        if (!this.teamSearchMode) {
          break
        }
        this.skipRankQuery = false
        break
      case 2:
        this.skipTeamQuery = false
        break
      case 3:
        if (!this.teamSearchMode) {
          break
        }
        this.skipAwardsQuery = false
        break

      default:
        break
      }
    },
    handleHover (e, awardName) {
      let awardHoverClone = { ...this.awardHover }
      const awardAlreadyHovering = awardHoverClone.hasOwnProperty(awardName)
      const objKeysLength = Object.keys(awardHoverClone).length
      const { type } = e

      switch (type) {
      case 'mouseover':
        if (objKeysLength) {
          break
        }
        awardHoverClone[awardName] = true
        this.awardHover = { ...awardHoverClone }
        break

      case 'mouseleave' || 'mouseout':
        if (!awardAlreadyHovering) {
          break
        }
        if (awardHoverClone[awardName] === false) {
          this.awardHover = {}
          break
        }
        awardHoverClone[awardName] = false
        this.awardHover = { ...awardHoverClone }
        break

      default:
        break
      }
    },
    afterLeaveHandler (awardName) {
      this.awardHover = {}
    }
  },
  watch: {
    user ({ awards }) {
      const { teamSearchMode } = this
      if (teamSearchMode) {
        return
      }
      this.awards = awards
    },
    activeTab (index) {
      this.handleTabChange(index)
    }
  },
  computed: {
    ...mapState({
      selectedPeriod: state => state.comp.selectedPeriod,
      member: state => state.user.principal.member
    }),
    showTerminated() {
      const canViewStatus = this.member.tags.find(t => t === 'preview:status')
      if (canViewStatus) {
        return this.user.status.key === 'member:terminated'
      }
      return false
    },
    showStatsMaintenance() {
      // all env vars come in as strings! yay!
      return process.env.VUE_APP_STATS_MAINTENANCE === 'true'
    },
    birthday () {
      let birthday = this.user.birthdate
      if (this.user.member) {
        birthday = this.user.member.birthdate
      }
      return birthday
    },
    joinedOn () {
      return this.user.joinedOn || (this.stats && this.stats.joinedOn)
    },
    displaySuccessStart() {
      const { joinedOn } = this.user

      if (!joinedOn) {
        return false
      }
      const cutoffDate = this.$moment(joinedOn).add(100, 'days')
      const isInRange = this.$moment(joinedOn).isBetween('2021-01-01', cutoffDate)
      return isInRange
    },
    getAvatar () {
      return (
        (this.user && this.user.profileUrl) ||
        this.$tenantInfo.placeholder
      )
    },
    isQualified () {
      if (this.stats) {
        let joined = new Date(this.stats.joinedOn)
        let today = new Date()
        joined = `${joined.getFullYear()}-${joined.getMonth()}`
        today = `${today.getFullYear()}-${today.getMonth()}`
        const joinedThisMonth = joined === today
        return this.stats.totalPoints >= 60 || joinedThisMonth
      }
      return false
    },
    email () {
      return get(this.user, 'contacts[0].emails[0].email', this.user.email)
    },
    address () {
      return get(this.user, 'addresses[0]', 'address', null)
    },
    slug () {
      return get(this, 'user.slugs[0].slug')
    },
    id () {
      return this.user.id
    }
  },
  mounted () {
    this.displayedRank = this.rank
    if (!this.teamSearchMode) {
      if (this.user) {
        this.awards = this.user.awards
      }
    }
  },
  apollo: {
    awardsRes: {
      query: AWARDS_BY_ID,
      variables () {
        return {
          input: {
            ids: [this.id]
          }
        }
      },
      skip () {
        return this.skipAwardsQuery
      },
      update (data) {
        const awards = get(data, 'members.nodes[0].awards')
        this.awards = awards
        return awards
      }
    },
    collection: {
      query: INSIGHTS_COLLECTION,
      variables() {
        return {
          input: {
            memberId: this.id,
            date: this.$moment().format('YYYY-MM-DD'),
            key: 'backoffice_insights'
          }
        }
      },
      skip () {
        return !this.displaySuccessStart
      },
      update({ comp: { insightCollection } }) {
        const { sections } = insightCollection
        this.successStartSection = sections.find(el => el.type === 'PANEL' && el.display)

        return insightCollection
      },
      client: 'federated',
      loadingKey: 'loadingInsightsCollection'
    }
  }
}
</script>

<style scoped>
.team-card {
  margin-left: auto;
  margin-right: auto;
}
.team-card .subtitle{
  margin-top: -19px;
  margin-left: -12px;
}
.cardImg {
  margin: auto;
  max-height: 200px;
  max-width: 100%;
}
.dense {
  font-size: 13.5px;
  min-width: 43px;
}
.badge-card {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  min-height: 215px;
  align-items: center;
}
.badge {
  max-width: 29px;
  transition: ease-out 350ms;
}
.badge .v-avatar {
  height: 29px !important;
  min-width: 29px !important;
  width: 29px !important;
}
.badge-hover {
  max-width: 100%;
  transition: ease-in 250ms;
}
.expand-enter-active {
  transition: opacity ease-out 350ms;
}
.expand-enter, .expand-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.expand-leave-active {
  transition: ease-out 350ms;
}
.item-container-card {
  min-height: 215px;
  display: flex;
  flex-direction: column;
  font-size: 12px;
}
.generation-container {
  flex-direction: column;
  display: flex;
  align-items: center;
}
.generation-badge-container {
  max-width: 200px;
  justify-content: center;
  position: relative;
  left: -24px;
}
.generation-avatar {
  transform: scale(0.5);
  z-index: unset;
  transition: 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
  margin-right: -40px !important;
}
.generation-avatar:hover {
  transform: scale(1) translateY(-5px);
  z-index: 1;
  transition: 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
}
.get-rank-btn {
  align-self: center;
}
</style>
<style>
.sales-dialog{
  background-color: white;
}
</style>
