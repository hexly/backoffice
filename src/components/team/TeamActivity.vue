<template>
  <div style="height: calc(100vh - 128px);">
    <v-row justify="space-between">
      <v-col>
        <h2>Team Activity</h2>
      </v-col>
      <v-spacer/>
      <v-col class="text-right">
        <v-btn class="mx-2" small fab dark color="teal" @click="drawer = !drawer">
          <v-icon dark>mdi-format-list-bulleted-square</v-icon>
        </v-btn>
      </v-col>
    </v-row>
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
        <small class="pl-5">{{item.member.contacts[0].emails[0].email}}</small>
      </template>
      <template v-slot:item.rank="{ item }">
        <v-chip :color="item.rank > 5 ? '#a1213b' : 'gray'" :class="{'white--text': item.rank > 5}">Rank {{item.rank}}</v-chip>
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
      <template v-slot:item.stats="{ item }">
        <v-row class="the-grid">
          <v-col cols="6" class="bottom-border right-border grid-cell" :class="{'satisfied': item.next.stats.personalTotalPoints.satisfied}">
            <h6>PSV</h6>
            <div class="text-center">{{item.psv}}</div>
          </v-col>
          <v-col cols="6" class="bottom-border grid-cell"  :class="{'satisfied': item.next.stats.groupPoints.satisfied}">
            <h6>GSV</h6>
            <div class="text-center">{{item.gsv}}</div>
          </v-col>
          <v-col cols="6" class="right-border grid-cell"  :class="{'satisfied': item.next.stats.downlinePoints.satisfied}">
            <h6>DSV</h6>
            <div class="text-center">{{item.dsv}}</div>
          </v-col>
          <v-col cols="6" class="grid-cell"  :class="{'satisfied': item.next.stats.activeLeg.satisfied}">
            <h6>Active Legs</h6>
            <div class="text-center">{{item.legs}}</div>
          </v-col>
        </v-row>
      </template>
      <template v-slot:item.pabql="{ item }">
        <v-chip v-for="(value, key) in item.current.stats.anyRankCount.earned" :key="`${key}${item.mrn}`">
          <v-avatar dark left color="#FFFFFF"> {{value}} </v-avatar>
          Rank {{key}}
        </v-chip>
      </template>
    </v-data-table>
    <v-pagination class="py-4" v-model="page" :length="Math.ceil(totalResults/pageSize)"></v-pagination>
    <v-navigation-drawer v-model="drawer" absolute right temporary>
      <v-expansion-panels>
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
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters, mapState, mapActions } from 'vuex'
import { CompActions } from '@/stores/CompStore'
import { ENGINE_TEAM_ACTIVITY } from '@/graphql/CompStats.gql'
export default {
  name: 'TeamActivity',
  data() {
    return {
      headers: [
        {
          text: 'Influencer',
          align: 'start',
          value: 'name'
        },
        { text: 'Level', value: 'depth' },
        { text: 'Upline', value: 'memberPath' },
        { text: 'Rank', value: 'rank' },
        { text: 'Downline Size', value: 'downlineCount.total' },
        { text: 'Active In Downline', value: 'downlineCount.qualified' },
        // let's add this back in once breakouts are a thing
        // { text: 'Group Size', value: 'groupCount' },
        { text: 'Stats', value: 'stats' },
        { text: 'Career Total', value: 'cpsv' },
        { text: 'PABQL', value: 'pabql' }
      ],
      members: [],
      page: 1,
      pageSize: 25,
      totalResults: 0,
      loading: 0,
      drawer: false,
      sortBy: 'rank',
      sortByOptions: {
        psv: 'PSV',
        gsv: 'GSV',
        dsv: 'DSV',
        rank: 'Rank',
        legs: 'Active Legs'
      },
      filterBy: [],
      orderBy: 'desc',
      orderByOptions: {
        desc: 'Greatest => Least',
        asc: 'Least => Greatest'
      }
    }
  },
  async mounted() {
    if (_.isEmpty(this.periods)) {
      await this.compGetPeriods({ when: this.$moment(this.getCompanyTime()).format('YYYY-MM-DD') })
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
            qualified: true,
            psvGte: null,
            levelsIn: this.filterBy.length ? this.filterBy : null,
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
        this.totalResults = engineStatsGetTeamActivity.totalResults
        return this.totalResults ? engineStatsGetTeamActivity.results : []
      }
    }
  },
  computed: {
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
