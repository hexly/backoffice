<template>
  <v-layout id="rank-card" row wrap>
    <v-card width="100%">
      <v-toolbar color="secondary" dark>
        <v-toolbar-title>Rank Requirements</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <!-- <v-tooltip class="rank-tooltip" slot="append" left>
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
          </v-tooltip> -->
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text v-if="stats && Object.keys(stats).length && !statsDisabled && !$apollo.loading" class="pa-3">
        <v-layout row justify-space-between pb-4>
          <v-flex px-3>
            <div v-if="!rank" class="title">Unranked</div>
            <div v-else class="title">Rank {{rank}}</div>
            <div class="caption grey--text darken-1"> Current Rank </div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right v-if="next && next.rank">
            <div class="title">Rank {{next.rank.rank}}</div>
            <div class="caption grey--text darken-1"> Next Rank </div>
          </v-flex>
        </v-layout>

        <template v-if="next && next.properties">
          <v-layout row justify-space-between wrap v-for="stat in next.properties" :key="stat.property">
            <v-flex px-3>
              <div :class="( stat.necessary  ? '' : 'grey--text') + ' title'">
                {{stat.title}}
                <v-icon color="green" v-if="stat.satisfied && stat.necessary">check_circle</v-icon>
              </div>
              <div class="caption grey--text darken-1"> {{stat.description}} </div>
            </v-flex>
            <v-spacer></v-spacer>
            <v-flex px-3 text-xs-right>
              <div class="title">{{stat.property}}</div>
              <div v-if="stat.necessary" class="caption grey--text darken-1">
                {{Math.round(stat.percentage)}}% <br>
                {{Math.round(stat.value)}} of {{Math.round(stat.required)}}
              </div>
              <div v-else class="caption grey--text darken-1">
                N/A <br>
                {{ Math.round(stat.value)}}
                <v-tooltip slot="append" left>
                    <v-icon slot="activator" small>info</v-icon>
                    <span>Not applicable for next rank</span>
                </v-tooltip>
              </div>
            </v-flex>
            <v-flex xs12 px-3>
              <v-progress-linear :color="stat.necessary ? 'success' : 'grey' " height="5" :value="stat.percentage"></v-progress-linear>
            </v-flex>
          </v-layout>
        </template>

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
// import { COMP_STATS_QUERY } from '@/graphql/CompStats.gql'

// import _ from 'lodash'

export default {
  name: 'RankRequirementsCard',
  props: {
    stats: Object,
    statsDisabled: Boolean
  },
  data() {
    return {
      rank: null,
      current: null,
      nextRankReqs: {},
      nextRankSatisfied: {},
      currentProgress: {},
      year: ~~this.$moment().format('Y'),
      month: ~~this.$moment().format('M'),
      lastRefreshed: null,
      statMapping: {
        personalTotalPoints: {
          title: 'PSV',
          description: 'Personal Sales Volume'
        },
        lifetimeTotalPoints: {
          title: 'CPSV',
          description: 'Career Personal Sales Volume'
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
        }
      }
    }
  },
  methods: {
    parseStats(stats) {
      if (!stats || !stats.length) {
        return
      }
      const { rank: { rank }, nextRank } = stats
      const { deltas, requirements: nextRankReqs, satisfied: nextRankSatisfied } = nextRank

      this.current = stats.rank

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
  // apollo: {
  //   stats: {
  //     query: COMP_STATS_QUERY,
  //     variables() {
  //       return {
  //         input: {
  //           year: this.year,
  //           month: this.month,
  //           membersIn: [1]
  //         }
  //       }
  //     },
  //     update(data) {
  //       // debugger
  //       const result = _.get(data, 'compStatsQuery.results[0]')

  //       this.lastRefreshed = this.$moment().format()

  //       return result
  //     }
  //   }
  // },
  mounted() {
    this.parseStats(this.stats)
  },
  computed: {
    next() {
      if (!this.stats || !this.stats.nextRank) {
        return null
      }
      let { deltas: d, requirements: req, satisfied: sat } = this.stats.nextRank

      const properties = Object.keys(this.statMapping)
        .reduce((carry, property) => {
          const satisfied = sat[property]
          const required = req[property]
          const delta = d[property]
          const missing = satisfied ? required : delta
          const value = required + delta
          const necessary = [null, 0].indexOf(required) < 1
          const { title, description } = this.statMapping[property]
          carry.push({
            title,
            description,
            value,
            missing,
            satisfied,
            required,
            delta,
            necessary,
            percentage: Math.round(100 * (satisfied ? 1 : value / required))
          })
          return carry
        }, [])

      return {
        rank: this.stats.nextRank,
        properties
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
