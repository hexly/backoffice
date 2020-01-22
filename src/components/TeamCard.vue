<template>
  <v-card
  max-width="350"
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
          <v-card flat>
            <h4 class="text-xs-center" v-if="email">{{(email).toLowerCase()}}</h4>
            <h4 class="text-xs-center" v-if="slug">{{(slug).toLowerCase()}}</h4>
          </v-card>
        </v-tab-item>
        <v-tab-item>
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
              <v-btn flat color="secondary" @click="viewTeam">View Team</v-btn>
            </v-layout>
          </v-card>
          <v-flex v-else d-flex justify-center align-center class="text-xs-center">
            <v-progress-circular indeterminate :size="50" :width="5" color="primary"></v-progress-circular>
          </v-flex>
        </v-tab-item>
        <v-tab-item>
          <v-card class="badge-card" d-flex justify-center wrap flat>
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
    <v-card-actions v-if="actions" class="justify-space-between">
    </v-card-actions>

  </v-card>
</template>

<script>
import { get } from 'lodash'

import { MEMBER_STATS_BY_DEPTH } from '@/graphql/MemberStats.gql'
export default {
  name: 'TeamCard',
  data() {
    return {
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
    actions: Boolean,
    stats: Object,
    loading: Boolean,
    noData: String
  },
  methods: {
    formatDate (value) {
      return this.$moment(value, 'YYYY-MM-DD').from(this.$moment())
    },
    viewTeam () {
      this.$emit('viewTeam', this.user)
    },
    handleTabChange(e) {
      if (e === 1) {
        this.skipTeamQuery = false
      }
    },
    handleHover(e, awardName) {
      let awardHoverClone = {...this.awardHover}
      const awardAlreadyHovering = awardHoverClone.hasOwnProperty(awardName)
      const objKeysLength = Object.keys(awardHoverClone).length
      const { type } = e

      switch (type) {
      case 'mouseover':
        if (objKeysLength) {
          break
        }
        awardHoverClone[awardName] = true
        this.awardHover = {...awardHoverClone}
        break

      case 'mouseleave' || 'mouseout':
        if (!awardAlreadyHovering) {
          break
        }
        awardHoverClone[awardName] = false
        this.awardHover = {...awardHoverClone}
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
      return this.user.slug
    },
    id () {
      return this.user.id
    }
  },
  apollo: {
    counts: {
      query: MEMBER_STATS_BY_DEPTH,
      variables() {
        return {
          input: {
            relativeDepthIn: [0],
            targetId: this.user.id
          }
        }
      },
      skip() {
        return this.skipTeamQuery
      },
      update(data) {
        if (!data) {
          return
        }
        const { getTeamDataByDepth } = data

        this.tabContent = {
          teamSize: getTeamDataByDepth[0].counts.total,
          frontLine: getTeamDataByDepth[0].counts.level1,
          secondLine: getTeamDataByDepth[0].counts.level2,
          thirdLine: getTeamDataByDepth[0].counts.level3
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
}
.badge {
  max-width: 29px;
  transition: ease-out 350ms;
}
.badge-hover {
  max-width: 100%;
  transition: ease-out 700ms;
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
</style>
