<template>
  <div style="height: calc(100vh - 128px);">
    <v-toolbar color="secondary" dark>
      <v-toolbar-title>Team Activity</v-toolbar-title>
      <v-spacer></v-spacer>
      <PeriodSwitcher></PeriodSwitcher>
      <v-btn icon @click="drawer = !drawer">
        <v-icon dark>mdi-format-list-bulleted-square</v-icon>
      </v-btn>
    </v-toolbar>
    <!-- <v-row justify="space-between">
      <v-col>
        <h2>Team Activity</h2>
      </v-col>
      <v-spacer/>
      <v-col class="text-right">

      </v-col>
    </v-row> -->
    <template v-if="showStatsMaintenance">
      <v-alert
        class="inner-alert"
        icon="mdi-calendar-check"
        text
        dense
        type="info">
        Our system is currently undergoing maintenance. We will be back up shortly
      </v-alert>
    </template>
    <template v-else>
      <v-data-table hide-default-footer disable-pagination disable-sort :headers="newHeaders" :items="descendants" class="elevation-1" :loading="loading > 0" v-if="selectedPeriod.metadata && selectedPeriod.metadata.version === 2">
        <template v-slot:item.name="{ item }">
          <v-tooltip top slot="append">
            <template v-slot:activator="{ on }">
              <v-avatar size="24px" v-on="on">
                <img v-if="item.metadata.profileAsset" alt="Avatar" :src="item.metadata.profileAsset">
                <v-icon v-else color="primary" dark>mdi-account-circle</v-icon>
              </v-avatar>
            </template>
            <span>#{{item.metadata.mrn}}</span>
          </v-tooltip>
          {{item.metadata.name}} ({{item.metadata.market}})
          <br/>
          <small class="pl-5">{{ item.metadata.email }}</small>
          <br/>
          <v-chip :color="item.metadata.ranking.rank > 5 ? '#a1213b' : 'gray'" :class="{'white--text': item.metadata.ranking.rank > 5}">{{item.metadata.ranking.name}}</v-chip>
        </template>
        <template v-slot:item.rank="{ item }">
          <v-chip :color="item.metadata.ranking.rank > 5 ? '#a1213b' : 'gray'" :class="{'white--text': item.metadata.ranking.rank > 5}">{{item.metadata.ranking.name}}</v-chip>
        </template>
        <template v-slot:item.stats="{ item }">
          <div style="display: inline-block;" class="ma-2 text-center" v-for="(stat, i) in item.metadata.requirements" :key="i">
            <h5>{{statsMapping[`${stat.type}_${stat.metric}`]}}</h5>
            <v-progress-circular
              :rotate="-90"
              :size="85"
              :value="stat.earned/ stat.required * 100"
              :width="5"
              :color="stat.achieved ? 'green' : 'red'"
            >
              <div>{{stat.earned}}<hr/>{{stat.required}}</div>
            </v-progress-circular>
          </div>
        </template>
      </v-data-table>
      <v-data-table hide-default-footer disable-pagination disable-sort :headers="headers" :items="members" class="elevation-1" :loading="loading > 0 " v-else>
      <template v-slot:item.name="{ item }">
        <v-tooltip top slot="append">
          <template v-slot:activator="{ on }">
            <v-avatar size="24px" v-on="on">
              <img v-if="item.member.profileUrl" alt="Avatar" :src="item.member.profileUrl">
              <v-icon v-else color="primary" dark>mdi-account-circle</v-icon>
            </v-avatar>
          </template>
          <span>#{{item.mrn}}</span>
        </v-tooltip>
        {{item.name}}
        <br/>
        <small class="pl-5">{{ GET(item, 'member.contacts[0].emails[0].email', 'N/A') }}</small>
      </template>
      <template v-slot:item.rank="{ item }">
        <v-chip :color="item.rank > 5 ? '#a1213b' : 'gray'" :class="{'white--text': item.rank > 5}">Rank {{item.rank}}</v-chip>
      </template>
      <template v-slot:item.recognizedRank="{ item }">
        <v-chip :color="item.current.recognizedRank > 5 ? '#a1213b' : 'gray'" :class="{'white--text': item.current.recognizedRank > 5}">Rank {{item.current.recognizedRank}}</v-chip>
      </template>
      <template v-slot:item.memberPath="{ item }">
        <v-layout class="generation-badge-container" align-center row wrap>
          <template v-for="(parent, index) in item.ancestors">
            <v-tooltip v-if="index > 0 && (index + 1) !== item.ancestors.length" top slot="append" :key="parent.profileUrl">
              <template v-slot:activator="{ on }">
                <v-avatar class="generation-avatar ma-0 elevation-3" size="24px" v-on="on">
                  <img :src="parent.profileUrl || $tenantInfo.placeholder" alt="Avatar" >
                </v-avatar>
              </template>
              <span>{{parent.displayName}}</span>
            </v-tooltip>
          </template>
        </v-layout>
      </template>
      <template v-slot:item.cpsv="{ item }">
        <v-chip :color="item.next.stats.lifetimeTotalPoints.satisfied ? '#4CAF50' : '#EF5350'" :class="{'white--text': true}">{{ Math.floor(item.cpsv) }}</v-chip>
      </template>
      <template v-slot:item.stats="{ item }">
        <v-row class="the-grid" v-if="$tenantInfo.id == 1010">
          <v-col v-if="$tenantInfo.statMapping.personalTotalAmount" cols="6" class="bottom-border right-border grid-cell" :class="{'satisfied': item.next.stats.personalTotalAmount.satisfied}">
            <h6>{{$tenantInfo.statMapping.personalTotalAmount.title}}</h6>
            <div class="text-center">{{Math.floor(item.next.stats.personalTotalAmount.earned)}}</div>
          </v-col>
          <v-col v-if="$tenantInfo.statMapping.personalTotalPoints" cols="6" class="bottom-border right-border grid-cell" :class="{'satisfied': item.next.stats.personalTotalPoints.satisfied}">
            <h6>{{$tenantInfo.statMapping.personalTotalPoints.title}}</h6>
            <div class="text-center">{{Math.floor(item.psv)}}</div>
          </v-col>
          <v-col v-if="$tenantInfo.statMapping.groupPoints" cols="6" class="bottom-border grid-cell"  :class="{'satisfied': item.next.stats.groupPoints.satisfied}">
            <h6>{{$tenantInfo.statMapping.groupPoints.title}}</h6>
            <div class="text-center">{{Math.floor(item.gsv)}}</div>
          </v-col>
          <v-col v-if="$tenantInfo.statMapping.downlinePoints" cols="6" class="right-border grid-cell"  :class="{'satisfied': item.next.stats.downlinePoints.satisfied}">
            <h6>{{$tenantInfo.statMapping.downlinePoints.title}}</h6>
            <div class="text-center">{{Math.floor(item.dsv)}}</div>
          </v-col>
          <v-col v-if="$tenantInfo.statMapping.activeLeg" cols="6" class="grid-cell"  :class="{'satisfied': item.next.stats.activeLeg.satisfied}">
            <h6>{{$tenantInfo.statMapping.activeLeg.title}}</h6>
            <div class="text-center">{{Math.floor(item.legs)}}</div>
          </v-col>
        </v-row>
        <v-row class="the-grid" v-else-if="$tenantInfo.id == 1011">
          <v-col v-if="$tenantInfo.statMapping.personalTotalAmount" cols="6" class="bottom-border right-border grid-cell" :class="{'satisfied': item.next.stats.personalTotalAmount.satisfied}">
            <h6>{{$tenantInfo.statMapping.personalTotalAmount.title}}</h6>
            <div class="text-center">{{Math.floor(item.next.stats.personalTotalAmount.earned)}}</div>
          </v-col>
          <v-col v-if="$tenantInfo.statMapping.personalCommissionablePoints" cols="6" class="bottom-border grid-cell" :class="{'satisfied': item.next.stats.personalCommissionablePoints.satisfied}">
            <h6>{{$tenantInfo.statMapping.personalCommissionablePoints.title}}</h6>
            <div class="text-center">{{Math.floor(item.next.stats.personalCommissionablePoints.earned)}}</div>
          </v-col>
          <v-col v-if="$tenantInfo.statMapping.groupPoints" cols="6" class="right-border grid-cell"  :class="{'satisfied': item.next.stats.groupPoints.satisfied}">
            <h6>{{$tenantInfo.statMapping.groupPoints.title}}</h6>
            <div class="text-center">{{Math.floor(item.gsv)}}</div>
          </v-col>
          <v-col v-if="$tenantInfo.statMapping.activeLeg" cols="6" class="grid-cell"  :class="{'satisfied': item.next.stats.activeLeg.satisfied}">
            <h6>{{$tenantInfo.statMapping.activeLeg.title}}</h6>
            <div class="text-center">{{Math.floor(item.legs)}}</div>
          </v-col>
        </v-row>
        <v-row class="the-grid" v-else>
          <v-col cols="12" class="grid-cell" >
            <p> We're sorry, but it looks like there is a configuration error. </p>
          </v-col>
        </v-row>
      </template>
      <template v-slot:item.pabql="{ item }">
          <template v-if="Object.keys(item.next.stats.anyRankCount.required).length == 0">
            <v-chip color="#4CAF50">N/A</v-chip>
          </template>
          <template v-else>
            <v-chip
              v-for="(value, key) in item.next.stats.anyRankCount.earned"
              :color="item.next.stats.anyRankCount.satisfied ? '#4CAF50' : '#EF5350'"
              :key="`${key}${item.mrn}`"
            >
              <v-avatar dark left color="#FFFFFF"> {{value}} </v-avatar>
              Rank {{key}}
            </v-chip>
          </template>
        </template>
    </v-data-table>
    <v-pagination class="py-4" v-model="page" :length="Math.ceil(totalResults/pageSize)"></v-pagination>
    <v-navigation-drawer v-model="drawer" absolute right temporary>
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-header>Show Active: {{showActive}}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-checkbox
              label="Show Active"
              :value="!showActive"
              v-model="showActive"
            ></v-checkbox>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Sort By: {{sortByOptions[sortBy]}}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-radio-group v-model="sortBy">
              <v-radio v-for="(value, key) in sortByOptions" :label="value" :value="key" :key="key"></v-radio>
            </v-radio-group>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Order By: {{orderByOptions[orderBy]}}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-radio-group v-model="orderBy">
              <v-radio v-for="(value, key) in orderByOptions" :label="value" :value="key" :key="key"></v-radio>
            </v-radio-group>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Filter By: {{filterBy}}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-checkbox
              v-for="(value, key) in engineStats.levelCounts"
              :label="`Level ${key.replace('level', '')}`"
              :value="~~key.replace('level', '')"
              :key="key"
              v-model="filterBy"
            ></v-checkbox>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-btn class="ma-2" color="green" @click="drawer = !drawer">Ok</v-btn>
    </v-navigation-drawer>

    </template>
  </div>
</template>

<script>
import _ from 'lodash'
import { getCompStats, parseData } from '@/graphql/comp.gql'
import { mapGetters, mapState, mapActions } from 'vuex'
import { CompActions } from '@/stores/CompStore'
import { ENGINE_TEAM_ACTIVITY } from '@/graphql/CompStats.gql'
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
export default {
  name: 'TeamActivity',
  components: {
    PeriodSwitcher
  },
  data() {
    const headers = [
      {
        text: this.$tenantInfo.distributorLabel,
        align: 'start',
        value: 'name'
      },
      { text: 'Level', value: 'depth' },
      { text: 'Upline', value: 'memberPath' },
      { text: 'Rank', value: 'rank' },
      { text: 'Lifetime Rank', value: 'recognizedRank' },
      { text: 'Downline Size', value: 'downlineCount.total' },
      { text: 'Active In Downline', value: 'downlineCount.qualified' },
      // let's add this back in once breakouts are a thing
      // { text: 'Group Size', value: 'groupCount' },
      { text: 'Stats', value: 'stats' }
    ]

    if (this.$tenantInfo.statMapping.lifetimeTotalPoints) {
      headers.push({ text: 'Career Total', value: 'cpsv' })
    }

    if (this.$tenantInfo.statMapping.anyRankCount) {
      headers.push({ text: this.$tenantInfo.statMapping.anyRankCount.title, value: 'pabql' })
    }

    const newHeaders = [
      {
        text: this.$tenantInfo.distributorLabel,
        align: 'center',
        value: 'name'
      },
      { text: 'Level', align: 'center', value: 'relativeLevel' },
      { text: 'Rank', align: 'center', value: 'rank' },
      { text: 'Downline Size', align: 'center', value: 'metadata.counts.downline' },
      { text: 'Group Size', align: 'center', value: 'metadata.counts.group' },
      { text: 'Active In Downline', align: 'center', value: 'metadata.counts.qualified' },
      { text: 'Stats', align: 'start', value: 'stats' }
    ]

    const sortByOptions = {
      rank: 'Rank'
    }

    if (this.$tenantInfo.statMapping.personalTotalPoints) {
      sortByOptions.psv = this.$tenantInfo.statMapping.personalTotalPoints.title
    }

    if (this.$tenantInfo.statMapping.personalTotalAmount) {
      sortByOptions.psa = this.$tenantInfo.statMapping.personalTotalAmount.title
    }

    if (this.$tenantInfo.statMapping.personalCommissionablePoints) {
      sortByOptions.csv = this.$tenantInfo.statMapping.personalCommissionablePoints.title
    }

    if (this.$tenantInfo.statMapping.personalCommissionableTotal) {
      sortByOptions.csa = this.$tenantInfo.statMapping.personalCommissionableTotal.title
    }

    if (this.$tenantInfo.statMapping.groupPoints) {
      sortByOptions.gsv = this.$tenantInfo.statMapping.groupPoints.title
    }

    if (this.$tenantInfo.statMapping.downlinePoints) {
      sortByOptions.dsv = this.$tenantInfo.statMapping.downlinePoints.title
    }

    if (this.$tenantInfo.statMapping.activeLeg) {
      sortByOptions.legs = this.$tenantInfo.statMapping.activeLeg.title
    }

    return {
      GET: _.get,
      headers,
      newHeaders,
      members: [],
      page: 1,
      pageSize: 25,
      totalResults: 0,
      loading: 0,
      drawer: false,
      sortBy: 'rank',
      sortByOptions,
      showActive: true,
      filterBy: [],
      orderBy: 'desc',
      orderByOptions: {
        desc: 'Greatest => Least',
        asc: 'Least => Greatest'
      },
      descendants: [],
      statsMapping: {
        personal_stat_downline: 'DSV',
        personal_stat_group: 'GSV',
        personal_stat_personal: 'PSV',
        career_stat_undefined: 'DSV',
        adjusted_downline_volume_downline: 'ADSV'
      }
    }
  },
  async mounted() {
    if (_.isEmpty(this.periods)) {
      await this.compGetPeriods({ when: this.$moment(this.getCompanyTime()).format('YYYY-MM-DD') })
    }
    if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 2) {
      const { data } = await this.$apollo.query(getCompStats(this.memberId, ['descendant']))
      this.descendants = parseData(data).members
    }
  },
  methods: {
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
    ...mapActions([CompActions.GET_PERIODS])
  },
  apollo: {
    members: {
      query: ENGINE_TEAM_ACTIVITY,
      variables() {
        return {
          input: {
            orderBy: [`${this.sortBy},${this.orderBy}`],
            qualified: this.showActive,
            psvGte: null,
            levelsIn: _.get('filterBy', this, []),
            page: this.page,
            pageSize: this.pageSize,
            periodDate: this.selectedPeriod.open,
            memberId: this.memberId
          }
        }
      },
      loadingKey: 'loading',
      skip() {
        return _.isEmpty(this.periods) || this.drawer
      },
      update({ engineStatsGetTeamActivity }) {
        const activity = engineStatsGetTeamActivity || {
          totalResults: 0,
          page: this.page,
          pageSize: this.pageSize,
          results: []
        }
        this.totalResults = activity.totalResults
        // Filtering out nulls
        return activity.results.filter(r => r)
      }
    }
  },
  computed: {
    showStatsMaintenance() {
      // all env vars come in as strings! yay!
      return process.env.VUE_APP_STATS_MAINTENANCE === 'true'
    },
    ...mapState({
      engineStats: state => state.comp.stats,
      periods: state => state.comp.periods,
      selectedPeriod: state => state.comp.selectedPeriod
    }),
    ...mapGetters(['memberId'])
  }
}
</script>

<style scoped>
.the-grid {
  border: 1px solid black;
  width: 135px;
  margin: 3px auto;
}
.the-grid .bottom-border{
  border-bottom: 1px solid black;
}
.the-grid .right-border{
  border-right: 1px solid black;
}
.the-grid .grid-cell{
  padding: 2px 5px;
  background-color: #EF5350;
  background-clip: padding-box;
}
.the-grid .grid-cell.satisfied{
  background-color: #4CAF50;
}

</style>
