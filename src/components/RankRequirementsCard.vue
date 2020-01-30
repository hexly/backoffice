<template>
  <v-layout id="rank-card" row wrap>
    <v-card width="100%">
      <v-toolbar color="secondary" dark>
        <v-toolbar-title>Rank Requirements</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-tooltip class="rank-tooltip" slot="append" left>
            <v-btn
              slot   ="activator"
              @click ="handleRefreshClick"
              small
              fab
              class="findme primary darken-2"
            >
              <v-icon>refresh</v-icon>
            </v-btn>
            <span>{{'Stats refreshed ' + $moment(lastRefreshed).fromNow()}}</span>
          </v-tooltip>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text v-if="Object.keys(stats).length && !statsDisabled && !$apollo.loading" class="pa-3">
        <v-layout row justify-space-between pb-4>
          <v-flex px-3>
            <div class="title">Rank</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">Rank {{rank}}</div>
          </v-flex>
        </v-layout>
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div :class="(nextRankSatisfied.personalTotalPoints === null ? 'grey--text' : '') + ' title'">PSV<v-icon color="green" v-if="nextRankSatisfied.personalTotalPoints">check_circle</v-icon></div>
            <div class="caption grey--text darken-1">Personal Sales Volume</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{currentProgress.personalTotalPoints}}</div>
            <div v-if="nextRankSatisfied.personalTotalPoints === null" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat((nextRankSatisfied.personalTotalPoints ? nextRankReqs.personalTotalPoints : currentProgress.personalTotalPoints ) / nextRankReqs.personalTotalPoints).toFixed(2) * 100}}% of {{nextRankReqs.personalTotalPoints}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear :color="nextRankSatisfied.downlinePoints === null ? 'grey' : 'success'" height="5" :value="(currentProgress.personalTotalPoints / nextRankReqs.personalTotalPoints) * 100"></v-progress-linear>
          </v-flex>
        </v-layout>
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div :class="(nextRankSatisfied.lifetimeTotalPoints === null ? 'grey--text' : '') + ' title'">CPSV<v-icon color="green" v-if="nextRankSatisfied.lifetimeTotalPoints">check_circle</v-icon></div>
            <div class="caption grey--text darken-1">Career PSV</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{currentProgress.lifetimeTotalPoints}}</div>
            <div v-if="nextRankSatisfied.lifetimeTotalPoints === null" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat((nextRankSatisfied.lifetimeTotalPoints ? nextRankReqs.lifetimeTotalPoints : currentProgress.lifetimeTotalPoints ) / nextRankReqs.lifetimeTotalPoints).toFixed(2) * 100}}% of {{nextRankReqs.lifetimeTotalPoints}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear :color="nextRankSatisfied.lifetimeTotalPoints === null ? 'grey' : 'success'" height="5" :value="(currentProgress.lifetimeTotalPoints / nextRankReqs.lifetimeTotalPoints) * 100"></v-progress-linear>
          </v-flex>
        </v-layout>
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div :class="(nextRankSatisfied.groupPoints === null ? 'grey--text' : '') + ' title'">GSV<v-icon color="green" v-if="nextRankSatisfied.groupPoints">check_circle</v-icon></div>
            <div class="caption grey--text darken-1">Group Sales Volume</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{currentProgress.groupPoints}}</div>
            <div v-if="nextRankSatisfied.groupPoints === null" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat((nextRankSatisfied.groupPoints ? nextRankReqs.groupPoints : currentProgress.groupPoints ) / nextRankReqs.groupPoints).toFixed(2) * 100}}% of {{nextRankReqs.groupPoints}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear :color="nextRankSatisfied.groupPoints === null ? 'grey' : 'success'" height="5" :value="(currentProgress.groupPoints / nextRankReqs.groupPoints) * 100"></v-progress-linear>
          </v-flex>
        </v-layout>
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div class="title">AL<v-icon color="green" v-if="nextRankSatisfied.activeLeg">check_circle</v-icon></div>
            <div class="caption grey--text darken-1">Active Legs</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{currentProgress.activeLeg}}</div>
            <div v-if="nextRankSatisfied.activeLeg === null" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat((nextRankSatisfied.activeLeg ? nextRankReqs.activeLeg : currentProgress.activeLeg ) / nextRankReqs.activeLeg).toFixed(2) * 100}}% of {{nextRankReqs.activeLeg}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear :color="nextRankSatisfied.activeLeg === null ? 'grey' : 'success'" height="5" :value="(currentProgress.activeLeg / nextRankReqs.activeLeg) * 100"></v-progress-linear>
          </v-flex>
        </v-layout>
        <!-- <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div class="title">PABQL</div>
            <div class="caption grey--text darken-1">Paid-As Bonus Qualified Legs</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{stats.pabql}}</div>
            <div v-if="stats.pabqlMax < 0" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat(stats.pabql / stats.pabqlMax).toFixed(2) * 100}}% of {{stats.pabqlMax}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear  color="success" height="5" value="0"></v-progress-linear>
          </v-flex>
        </v-layout> -->
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div :class="(nextRankSatisfied.downlinePoints === null ? 'grey--text' : '') + ' title'">DSV<v-icon color="green" v-if="nextRankSatisfied.downlinePoints">check_circle</v-icon></div>
            <div class="caption grey--text darken-1">Downline Sales Volume</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{currentProgress.downlinePoints}}</div>
            <div v-if="true || nextRankSatisfied.downlinePoints === null" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat((nextRankSatisfied.downlinePoints ? nextRankReqs.downlinePoints : currentProgress.downlinePoints ) / nextRankReqs.downlinePoints).toFixed(2) * 100}}% of {{nextRankReqs.downlinePoints}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear :color="nextRankSatisfied.downlinePoints === null ? 'grey' : 'success'" height="5" :value="currentProgress.downlinePoints / nextRankReqs.downlinePoints * 100"></v-progress-linear>
          </v-flex>
        </v-layout>
        <!-- <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div class="title">ADSV<v-icon color="green" v-if="nextRankSatisfied.downlineAdjustedPoints">check_circle</v-icon></div>
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
            <div class="title">{{currentProgress.downlineAdjustedPoints}}</div>
            <div v-if="nextRankSatisfied.downlineAdjustedPoints === null || nextRankReqs.downlineAdjustedPoints === 0" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat((nextRankSatisfied.downlineAdjustedPoints ? nextRankReqs.downlineAdjustedPoints : currentProgress.downlineAdjustedPoints ) / nextRankReqs.downlineAdjustedPoints).toFixed(2) * 100}}% of {{nextRankReqs.downlineAdjustedPoints}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear  color="success" height="5" :value="currentProgress.downlineAdjustedPoints / nextRankReqs.downlineAdjustedPoints"></v-progress-linear>
          </v-flex>
        </v-layout> -->
      </v-card-text>
      <v-card-text v-else-if="!statsDisabled && !$apollo.loading" class="pa-3">
        <v-layout row justify-space-between pb-4>
          <v-flex px-3>
            <div class="title text-xs-center">No Rank Data Found</div>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-text v-else-if="statsDisabled && !$apollo.loading" class="pa-3">
        <v-layout row justify-space-between pb-4>
          <v-flex px-3>
            <div class="title text-xs-center">Realtime Stats Temporarily Unavailable</div>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-text v-else-if="$apollo.loading" class="pa-3">
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
import { COMP_STATS_QUERY } from '@/graphql/CompStats.gql'

import _ from 'lodash'

export default {
  name: 'RankRequirementsCard',
  props: {
    statsDisabled: Boolean
  },
  data() {
    return {
      rank: null,
      nextRankReqs: {},
      nextRankSatisfied: {},
      currentProgress: {},
      year: ~~this.$moment().format('Y'),
      month: ~~this.$moment().format('M'),
      lastRefreshed: null
    }
  },
  methods: {
    parseStats(stats) {
      const { rank: { rank }, nextRank } = stats
      const { deltas, requirements: nextRankReqs, satisfied: nextRankSatisfied } = nextRank

      this.rank = rank
      this.nextRankReqs = nextRankReqs
      this.nextRankSatisfied = nextRankSatisfied
      Object.keys(nextRankReqs).forEach(reqKey => {
        this.currentProgress[reqKey] = nextRankReqs[reqKey] + deltas[reqKey]
      })
    },
    handleRefreshClick() {
      this.$apollo.queries.stats.refetch()
    }
  },
  apollo: {
    stats: {
      query: COMP_STATS_QUERY,
      variables() {
        return {
          input: {
            year: this.year,
            month: this.month,
            membersIn: [1]
          }
        }
      },
      update(data) {
        const result = _.get(data, 'compStatsQuery.results[0]')

        this.lastRefreshed = this.$moment().format()

        return result
      }
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
}
.rank-tooltip span{
  display: flex;
  align-items: center;
}
#loading-container {
  justify-content: center;
  display: flex;
}
</style>
