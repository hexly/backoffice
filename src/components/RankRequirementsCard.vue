<template>
  <v-layout id="rank-card" row wrap>
    <v-card width="100%" :class="tabMode ? 'elevation-0 item-container-card' : null">
      <v-toolbar v-if="!tabMode" color="secondary" dark>
        <v-toolbar-title>Rank Requirements</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text v-if="stats && Object.keys(stats).length && !statsDisabled && !loading" class="py-1 px-3">
        <v-layout row justify-space-between :class="tabMode ? 'rank-row' : 'py-4'">
          <v-flex px-3>
            <div v-if="!currentRank" class="title">Unranked</div>
            <div v-else class="title">Rank {{currentRank}}</div>
            <div class="caption grey--text darken-1"> Current Rank </div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-right v-if="nextRank">
            <div class="title">Rank {{nextRank}}</div>
            <div class="caption grey--text darken-1"> Next Rank </div>
          </v-flex>
        </v-layout>

        <template class="stats-container" v-if="current">
          <v-layout :class="tabMode ? 'rank-data-row' : null" row justify-space-between wrap v-for="stat in Object.keys(statMapping)" :key="stat.property">
            <template v-if="next[stat].required !== null">
            <v-flex px-3>
              <div v-if="!tabMode" :class="( next[stat].required  ? '' : 'grey--text') + ' title'">
                {{statMapping[stat].title}}
                <v-icon color="green" v-if="next[stat].satisfied && next[stat].required">check_circle</v-icon>
              </div>
              <div class="caption grey--text darken-1"> {{statMapping[stat].description}} </div>
            </v-flex>
            <v-spacer></v-spacer>
            <v-flex px-3 text-right v-if="stat !== 'anyRankCount'">
              <div class="title">{{next[stat].earned}}</div>
              <div v-if="next[stat].required && parseInt(next[stat].earned)" class="caption grey--text darken-1">
                {{Math.round(next[stat].earned/next[stat].required*100)}}%
                <br>
                <span v-if="!tabMode">{{Math.round(next[stat].earned)}} of {{Math.round(next[stat].required)}}</span>
              </div>
              <div v-else class="caption grey--text darken-1">
                N/A
                <br>
                <span v-if="!tabMode">
                  {{ Math.round(next[stat].required)}}
                  <v-tooltip slot="append" left>
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on" small>info</v-icon>
                    </template>
                      <span>Not applicable for next rank</span>
                  </v-tooltip>
                </span>
              </div>
            </v-flex>
            <v-flex px-3 text-xs-right v-else>
              <template v-if="current[stat].satisfied">
                <div class="title" >Achieved</div>
                <div class="caption grey--text darken-1"> 100% </div>
              </template>
              <template v-else>
                <div class="title">Unachieved</div>
                <div class="caption grey--text darken-1"> 0% </div>
              </template>
            </v-flex>
            <v-flex xs12 px-3 v-if="stat !== 'anyRankCount'">
              <v-progress-linear :class="tabMode ? 'progress-bar' : null" :color="next[stat].required ? 'success' : 'grey' " :height="tabMode ? 2 : 5" :value="Math.round(next[stat].earned/next[stat].required*100)"></v-progress-linear>
            </v-flex>
            </template>
          </v-layout>
        </template>

      </v-card-text>
      <v-card-text v-else-if="!statsDisabled && !loading" class="pa-3">
        <v-layout row justify-space-between :class="tabMode ? null : 'pb-4'">
          <v-flex px-3>
            <div class="title text-center">No Rank Data Found</div>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-text v-else-if="statsDisabled && !loading" class="pa-3">
        <v-layout row justify-space-between pb-4>
          <v-flex px-3>
            <div class="title text-center">Realtime Stats Temporarily Unavailable</div>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-text v-else-if="loading" class="pa-3">
        <v-layout row justify-space-between pb-4>
          <v-flex id="loading-container" px-3>
            <v-progress-circular indeterminate />
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script>
// import { COMP_STATS_QUERY } from '@/graphql/CompStats.gql'

// import _ from 'lodash'

export default {
  name: 'RankRequirementsCard',
  props: {
    stats: Object,
    statsDisabled: Boolean,
    tabMode: Boolean,
    loading: Boolean
  },
  data() {
    return {
      rank: null,
      current: null,
      next: null,
      nextRank: null,
      currentRank: null,
      nextRankReqs: {},
      nextRankSatisfied: {},
      currentProgress: {},
      year: ~~this.$moment().format('Y'),
      month: ~~this.$moment().format('M'),
      lastRefreshed: null,
      statMapping: {
        lifetimeTotalPoints: {
          title: 'CPSV',
          description: 'Career Personal Sales Volume'
        },
        personalTotalPoints: {
          title: 'PSV',
          description: 'Personal Sales Volume'
        },
        groupPoints: {
          title: 'GSV',
          description: 'Group Sales Volume'
        },
        activeLeg: {
          title: 'Active Legs',
          description: 'Active Legs'
        },
        downlinePoints: {
          title: 'DSV',
          description: 'Downline Sales volume'
        },
        anyRankCount: {
          title: 'PABQL',
          description: 'Paid-As Bonus Qualified Legs'
        },
        downlineAdjustedPoints: {
          title: 'ADSV',
          description: 'Adjusted Downline Sales volume'
        }
      }
    }
  },
  methods: {
    parseStats(stats) {
      const { current, next } = stats.rank
      this.currentRank = current.rank
      this.nextRank = next.rank
      this.current = current.metrics.reduce((carry, stat) => {
        carry[stat.prop] = stat
        return carry
      }, {})

      this.next = next.metrics.reduce((carry, stat) => {
        carry[stat.prop] = stat
        return carry
      }, {})
    }
  },
  mounted() {
    if (this.stats) {
      this.parseStats(this.stats)
    }
  },
  watch: {
    stats(newVal) {
      this.parseStats(newVal)
    }
  }
}
</script>

<style scoped>
#rank-card {
  height: 100%;
  width: 100%;
  margin: auto;
}
.rank-tooltip span{
  display: flex;
  align-items: center;
}
#loading-container {
  justify-content: center;
  display: flex;
}
.item-container-card {
  min-height: 215px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}
.progress-bar {
  margin: 0;
  margin-bottom: 11px;
}
.stats-container {
  max-height: unset;
}
.rank-row {
  padding-bottom: 10px;
}
</style>
