<template>
  <v-card
  max-width="320"
  min-width="320"
  class="ma-2 pa-2"
  >

    <v-img
      :src="getAvatar"
      cover
      top
      aspect-ratio="1"
      class="cardImg white--text"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
    >
    <v-card-title class="fill-height align-end">
      <v-flex row>
        <h2>{{(user.name).toUpperCase()}}</h2>
      </v-flex>
    </v-card-title>
    </v-img>

    <div v-if="actions">
      <v-tabs
        hide-slider
        centered
        @change ="handleTabChange"
      >
        <v-tab
          v-for="heading in tabHeadings"
          :key="heading"
        >
          {{ heading }}
        </v-tab>
        <v-tab-item>
          <v-card class="item-container-card" flat>
            <h4 class="text-xs-center" v-if="displayedRank">Current Rank: {{displayedRank}}</h4>
            <v-btn
              @click="getRank(user)"
              class="get-rank-btn primary white--text"
              round
              small
              v-else
            >
              <span v-if="!$apollo.loading">Get Rank</span>
              <v-progress-circular indeterminate v-else size="20" />
            </v-btn>
            <h4 class="text-xs-center" v-if="email">{{(email).toLowerCase()}}</h4>
            <h4 class="text-xs-center" v-if="slug">
              Store: <a target="_blank" :href="$tenantInfo.storeUrl.replace('{slug}', slug)">
              {{slug}}
              </a>
            </h4>
            <div class="generation-container">
              <h4>Generation: {{user.relativeDepth}}</h4>
              <v-layout class="generation-badge-container" align-center row wrap>
                <template v-for="parent in user.relativePathMembers">
                  <v-tooltip top slot="append" :key="parent.profileUrl">
                    <v-avatar class="generation-avatar ma-1 elevation-3" size="60px" slot="activator">
                      <img :src="parent.profileUrl || $tenantInfo.placeholder" alt="Avatar" >
                    </v-avatar>
                    <span>{{parent.name}}</span>
                  </v-tooltip>
                </template>
              </v-layout>
            </div>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <div class="item-container-card">
            <v-card v-if="!$apolloData.loading" flat>
              <v-layout justify-center row wrap class="text-xs-center">
                <v-flex xs3>
                  <span class="font-weight-black title">{{tabContent.teamSize}}</span>
                  <br/>
                  Team Size
                </v-flex>
                <v-flex xs3>
                  <span class="font-weight-black title">{{tabContent.frontLine}}</span>
                  <br/>
                  Front-Line
                </v-flex>
                <v-flex xs3>
                  <span class="font-weight-black title">{{tabContent.secondLine}}</span>
                  <br/>
                  Second line
                </v-flex>
                <v-flex xs3>
                  <span class="font-weight-black title">{{tabContent.thirdLine}}</span>
                  <br/>
                  Third line
                </v-flex>
              </v-layout>
            </v-card>
            <v-flex v-else d-flex justify-center align-center class="text-xs-center">
              <v-progress-circular indeterminate :size="50" :width="5" color="primary"></v-progress-circular>
            </v-flex>
            <v-card flat>
              <v-layout justify-center row wrap class="text-xs-center">
                <v-btn
                  round
                  small
                  color="secondary white--text"
                  @click="viewTeam()"
                  :disabled="$route.hash === '#search'"
                >
                  View Team
                </v-btn>
              </v-layout>
            </v-card>
          </div>
        </v-tab-item>
        <v-tab-item>
          <v-card v-if="user.awards" class="badge-card" d-flex justify-center wrap flat>
            <v-chip
              v-for       ="award in user.awards"
              :class       ="'badge elevation-3' + (awardHover[award.name] ? ' badge-hover' : '')"
              :color      ="award.metadata.color"
              :text-color ="award.metadata.text"
              :key        ="award.name"
              @mouseover  ="handleHover($event, award.name)"
              @mouseleave ="handleHover($event, award.name)"
              @mouseout   ="handleHover($event, award.name)"
            >
              <v-avatar :color="award.metadata.accent">
                <v-icon>{{award.metadata.icon}}</v-icon>
              </v-avatar>
              <transition
                css
                name         ="expand"
                @after-leave ="afterLeaveHandler(award.name)"
              >
                <span v-show="awardHover[award.name]">{{award.name}}</span>
              </transition>
            </v-chip>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </div>

  </v-card>
</template>

<script>
import { get } from 'lodash'

import { TEAM_SIZE_BY_GENERATION } from '@/graphql/MemberStats.gql'
export default {
  name: 'TeamCard',
  data() {
    return {
      displayedRank: null,
      show: false,
      awardHover: {},
      skipTeamQuery: true,
      tabHeadings: [
        'Info',
        'Team',
        'Awards'
      ],
      tabContent: {
        teamSize: null,
        frontLine: null,
        secondLine: null,
        thirdLine: null
      }
    }
  },
  props: {
    user: Object,
    team: Object,
    actions: Boolean,
    stats: Object,
    loading: Boolean,
    noData: String,
    rank: Number
  },
  methods: {
    formatDate (value) {
      return this.$moment(value, 'YYYY-MM-DD').from(this.$moment())
    },
    viewTeam (user = this.user) {
      this.$emit('viewTeam', user)
    },
    getRank (user = this.user) {
      // Query rank here
      // this.displayedRank = 4
    },
    handleTabChange(e) {
      if (e === 1) {
        this.skipTeamQuery = false
      }
    },
    handleHover(e, awardName) {
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
    afterLeaveHandler(awardName) {
      this.awardHover = {}
    }
  },
  computed: {
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
    slug () {
      return get(this, 'user.slugs[0].slug')
    },
    id () {
      return this.user.id
    }
  },
  mounted() {
    this.displayedRank = this.rank
  },
  apollo: {
    counts: {
      query: TEAM_SIZE_BY_GENERATION,
      variables() {
        return {
          input: {
            memberId: this.user.id
          }
        }
      },
      skip() {
        return this.skipTeamQuery
      },
      update({ membershipTeamSizes }) {
        const getTeamDataByDepth = membershipTeamSizes.reduce((all, s) => {
          all[s.generation || 'all'] = s.count
          return all
        }, {})
        this.tabContent = {
          teamSize: getTeamDataByDepth.all || 0,
          frontLine: getTeamDataByDepth['1'] || 0,
          secondLine: getTeamDataByDepth['2'] || 0,
          thirdLine: getTeamDataByDepth['3'] || 0
        }
      }
    }
  }
}
</script>

<style scoped>
.cardImg {
  margin: auto;
  max-height: 100%;
  max-width: 100%;
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
  justify-content: space-evenly;
}
.generation-container {
  flex-direction: column;
  display: flex;
  align-items: center;
}
.generation-badge-container
{
  max-width: 200px;
  justify-content: center;
  position: relative;
  left: -24px;
}
.generation-avatar {
  transform: scale(.5);
  z-index: unset;
  transition: 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
  margin-right: -40px !important;
  margin-bottom: -23px !important;
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
