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
      <template v-if="selectedPeriod.metadata && selectedPeriod.metadata.version >= 2">
        <v-sheet class="pa-3">
          <v-text-field
            v-model="search"
            outlined
            clearable
            label="Search by name..."
            type="text"
            @click:clear="clearSearch"
            @keydown.enter="searchStats"
          >
            <template v-slot:append-outer>
              <v-btn class="button-fix" large color="primary" @click="searchActivity">
                <v-icon left>mdi-account-search</v-icon>
                Search
              </v-btn>
            </template>
          </v-text-field>
        </v-sheet>
        <v-data-table
          disable-sort
          disable-pagination
          hide-default-footer
          :headers="newHeaders"
          :items="descendants"
          class="elevation-1 mb-12 pb-8"
          :loading="loading > 0"
        >
        <template v-slot:item.avatar="{ item }">
          <div style="position: relative;">
            <v-badge avatar overlap bottom color="white">
              <template v-slot:badge>
                <Flag :name="item.metadata.market" />
              </template>
              <v-avatar :size="$vuetify.breakpoint.xs ? '50px' : '75px'">
                <img v-if="item.metadata.profileAsset" alt="Avatar" :src="item.metadata.profileAsset">
                <v-icon v-else color="primary" dark>mdi-account-circle</v-icon>
              </v-avatar>
            </v-badge>
            <div class="mrn">#{{item.metadata.mrn}}</div>
          </div>
        </template>
        <template v-slot:item.name="{ item }">
          {{item.metadata.name}}
          <br/>
          <small>{{ item.metadata.email }}</small>
          <template v-if="item.metadata.recognizedRank">
            <br/>
            <small>Recognized:</small>
            <v-chip small :color="isGeneration(item.metadata.recognizedRank) ? '#a1213b' : 'gray'" :class="{'white--text': isGeneration(item.metadata.recognizedRank)}">Rank {{item.metadata.recognizedRank}}</v-chip>
          </template>
        </template>
        <template v-slot:item.rank="{ item }">
          <v-chip :color="isGeneration(item.metadata.ranking.rank) ? '#a1213b' : 'gray'" :class="{'white--text': isGeneration(item.metadata.ranking.rank)}">{{item.metadata.ranking.name}}</v-chip>
        </template>
        <template v-slot:item.stats="{ item }">
          <div style="display: inline-block;" class="ma-2 text-center" v-for="(stat, i) in item.metadata.requirements" :key="i">
            <h5>{{ stat.category ? stat.category.toUpperCase() : statsMapping[`${stat.type}_${stat.metric}`]}}</h5>
            <v-progress-circular
              v-if="stat.notApplicable"
              :rotate="-90"
              :size="$vuetify.breakpoint.xs ? 50 : 75"
              :value="100"
              :width="$vuetify.breakpoint.xs ? 2 : 5"
              color="grey"
            >
              <div v-if="stat == null || stat.earned === null || stat.earned === undefined">N/A</div>
              <div v-else>{{format(stat.earned)}}</div>
            </v-progress-circular>
            <v-progress-circular
              v-else
              :rotate="-90"
              :size="$vuetify.breakpoint.xs ? 50 : 75"
              :value="stat.earned/ stat.required * 100"
              :width="$vuetify.breakpoint.xs ? 2 : 5"
              :color="stat.achieved ? 'green' : 'red'"
            >
              <div :class="{'tiny-font': $vuetify.breakpoint.xs}">{{format(stat.earned) || 0}}<hr/>{{format(stat.required)}}</div>
            </v-progress-circular>
          </div>
        </template>
      </v-data-table>
      </template>
      <template v-else>
        <v-data-table hide-default-footer disable-pagination disable-sort :headers="headers" :items="members" class="elevation-1" :loading="loading > 0 ">
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
            <v-chip :color="isGeneration(item.rank) ? '#a1213b' : 'gray'" :class="{'white--text': isGeneration(item.rank)}">Rank {{item.rank}}</v-chip>
          </template>
          <template v-slot:item.recognizedRank="{ item }">
            <v-chip :color="isGeneration(item.current.recognizedRank) ? '#a1213b' : 'gray'" :class="{'white--text': isGeneration(item.current.recognizedRank)}">Rank {{item.current.recognizedRank}}</v-chip>
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
      </template>
    <v-pagination  class="pb-12 mb-12" v-model="page" :length="Math.ceil(totalResults/pageSize)" :total-visible="15"></v-pagination>
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
        <v-expansion-panel v-if="selectedPeriod.metadata && selectedPeriod.metadata.version >= 2">
          <v-expansion-panel-header>Sort By: {{newSortByOptions[sortBy]}}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-radio-group v-model="sortBy">
              <v-radio v-for="(value, key) in newSortByOptions" :label="value" :value="key" :key="key"></v-radio>
            </v-radio-group>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-else>
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
          <v-expansion-panel-header>Filter By Level: {{filterBy}}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <template v-if="selectedPeriod.metadata && selectedPeriod.metadata.version >= 2 && engineStats.metadata">
              <v-checkbox
                v-for="(value, key) in engineStats.metadata.counts.levels"
                :label="`Level ${value.level} (${value.total})`"
                :value="value.level"
                :key="key"
                v-model="filterBy"
              ></v-checkbox>
            </template>
            <template v-else>
              <v-checkbox
                v-for="(value, key) in engineStats.levelCounts"
                :label="`Level ${key.replace('level', '')}`"
                :value="~~key.replace('level', '')"
                :key="key"
                v-model="filterBy"
              ></v-checkbox>
            </template>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-if="selectedPeriod.metadata && selectedPeriod.metadata.version >= 2 && engineStats.metadata">
          <v-expansion-panel-header>Filter By Rank: {{filterByRank}}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-checkbox
              v-for="(value, key) in engineStats.metadata.counts.ranks"
              :label="`Rank ${key} (${value})`"
              :value="key"
              :key="key"
              v-model="filterByRank"
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
import { getCompStats, parseData, ENGINE_TEAM_STATS_QUERY, formatData } from '@/graphql/comp.gql'
import { mapGetters, mapState, mapActions } from 'vuex'
import { CompActions } from '@/stores/CompStore'
import { ENGINE_TEAM_ACTIVITY } from '@/graphql/CompStats.gql'
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
import Flag from '@/components/Flag.vue'

export default {
  name: 'TeamActivity',
  components: {
    PeriodSwitcher,
    Flag
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
      { text: '', align: 'center', value: 'avatar' },
      { text: this.$tenantInfo.distributorLabel, align: 'center', value: 'name' },
      { text: 'Level', align: 'center', value: 'relativeLevel' },
      { text: 'Rank', align: 'center', value: 'rank' },
      { text: 'Downline Size', align: 'center', value: 'metadata.counts.downline' },
      { text: 'Group Size', align: 'center', value: 'metadata.counts.group' },
      { text: 'Active In Downline', align: 'center', value: 'metadata.counts.qualified' },
      { text: 'Stats', align: 'start', value: 'stats' }
    ]

    const newSortByOptions = {
      RANK: 'Rank',
      PSV: 'PSV',
      GSV: 'GSV',
      DLSV: 'DLSV',
      CPSV: 'CPSV',
      LEVEL: 'Level',
      DOWNLINE_SIZE: 'Downline Size',
      GROUP_SIZE: 'Group Size',
      QUALIFIED_COUNT: 'Active In Download',
      RECOGNIZED_RANK: 'Recognized Rank'
    }

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
      sortBy: 'RANK',
      sortByOptions,
      showActive: true,
      filterBy: [],
      filterByRank: [],
      orderBy: 'desc',
      newSortByOptions,
      orderByOptions: {
        desc: 'Greatest => Least',
        asc: 'Least => Greatest'
      },
      search: null,
      descendants: [],
      statsMapping: {
        personal_stat_downline: 'DSV',
        personal_stat_group: 'GSV',
        personal_stat_personal: 'PSV',
        career_stat_undefined: 'CPSV',
        adjusted_downline_volume_downline: 'ADSV'
      }
    }
  },
  async mounted() {
    if (_.isEmpty(this.periods)) {
      const { memberId } = this
      await this.compGetPeriods({ memberId })
    }
    if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 2) {
      await this.getCompStatsPage()
    } else if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 3) {
      await this.getEngineStatsPage()
    }
  },
  methods: {
    isGeneration(rank) {
      if (this.selectedPeriod.metadata.version === 3) {
        return rank > 7
      }
      return rank > 5
    },
    async searchStats() {
      this.page = 1
      if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 2) {
        await this.getCompStatsPage()
      } else if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 3) {
        await this.getEngineStatsPage()
      }
    },
    format(num) {
      num = Math.round(num)
      num = new Intl.NumberFormat('en-US', {}).format(num)
      return num
    },
    async clearSearch() {
      this.search = null
      this.page = 1
      if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 2) {
        await this.getCompStatsPage()
      } else if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 3) {
        await this.getEngineStatsPage()
      }
    },
    async searchActivity() {
      this.page = 1
      if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 2) {
        await this.getCompStatsPage()
      } else if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 3) {
        await this.getEngineStatsPage()
      }
    },
    async getCompStatsPage() {
      this.loading = 1
      const params = {
        memberId: this.memberId,
        type: ['descendant'],
        periodId: this.selectedPeriod.id,
        page: this.page,
        pageSize: this.pageSize,
        qualifiedIn: [this.showActive],
        sortBy: [ { column: this.sortBy, dir: this.orderBy.toUpperCase() } ]
      }
      if (this.filterBy.length > 0) {
        params.levelIn = this.filterBy
      }
      if (this.filterByRank.length > 0) {
        params.rankIn = this.filterByRank
      }
      if (this.search) {
        params.nameIn = [this.search]
      }
      const { data } = await this.$apollo.query(getCompStats(params))
      const paging = _.get(data, 'comp.previewRun.data')
      this.totalResults = paging.totalResults
      this.descendants = parseData(data).members
      this.loading = 0
    },
    async getEngineStatsPage() {
      this.loading = 1
      const payload = {
        memberIn: [{
          memberId: this.memberId,
          periodId: this.selectedPeriod.id
        }]
      }
      const filter = {
        page: this.page,
        pageSize: this.pageSize,
        qualificationIn: [this.showActive],
        sorts: [ { column: this.sortBy, asc: this.orderBy.toUpperCase() === 'ASC' } ]
      }
      if (this.filterBy.length > 0) {
        filter.levelIn = this.filterBy
      }
      if (this.filterByRank.length > 0) {
        filter.rankIn = ~~this.filterByRank
      }
      if (this.search) {
        filter.nameLike = this.search
      }
      const { data: { engine: { rankings: { results } } } } = await this.$apollo.query({
        query: ENGINE_TEAM_STATS_QUERY,
        variables: {
          payload,
          filter
        },
        fetchPolicy: 'network-only',
        client: 'federated'
      })
      const teammates = results[0].team.teammates.results
      const paging = teammates.map(formatData)
      this.totalResults = results[0].team.teammates.totalResults
      this.descendants = paging
      this.loading = 0
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
        return _.isEmpty(this.periods) || this.drawer || (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version >= 2)
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
  watch: {
    page(newVal, oldVal) {
      window.scrollTo(0, 0)
      if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 2) {
        this.getCompStatsPage()
      } else if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 3) {
        this.getEngineStatsPage()
      }
    },
    drawer(newVal, oldVal) {
      if (!newVal) {
        if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 2) {
          this.getCompStatsPage()
        } else if (this.selectedPeriod.metadata && this.selectedPeriod.metadata.version === 3) {
          this.getEngineStatsPage()
        }
      }
    }
  },
  computed: {
    showStatsMaintenance() {
      // all env vars come in as strings! yay!
      return process.env.VUE_APP_STATS_MAINTENANCE === 'true'
    },
    ...mapState({
      engineStats: state => state.comp.stats || {},
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
.button-fix {
  margin-top: -12px;
}
.tiny-font {
  font-size: 11px;
}
.mrn {
  position: absolute;
  background-color: rgb(161, 33, 59);
  color: white;
  line-height: 15px;
  font-weight: bold;
  bottom: -3px;
  right: 65%;
  min-width: 35px;
  font-size: 12px;
  padding: 1px 3px;
  text-align: center;
}
</style>
