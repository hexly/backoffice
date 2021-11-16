<template>
  <div class="pa-2">
    <div>
      <form>
        <h5>Search By Name:</h5>
        <v-text-field
          solo
          v-model="query"
          :placeholder="`${$tenantInfo.distributorLabel} Name`"
        />
        <h5>Sort Name By:</h5>
        <v-select
          v-model="sort"
          :items="sorts"
          item-text="label"
          solo
          :return-object="true"
        ></v-select>
        <v-checkbox
          v-model="onlyPendingRecon"
          label="Only show accounts that will be reconciled next month"
          color="red"
          value="true"
          hide-details
        ></v-checkbox>
        <v-alert text dense type="info" v-if="currentUser">
          You are currently viewing {{currentUser.name}}'s Team
          <br/>
          <a @click="currentUser = null">Go Back To My Team</a>
        </v-alert>
      </form>
    </div>
    <div class="search-results" :class="{'loading': !!loading}">
      <div class="loader-overlay text-center">
        <v-progress-circular class="loader" indeterminate :size="60" :width="6" color="black"></v-progress-circular>
      </div>
      <v-layout wrap align-space-between justify-center row fill-height>
        <v-flex v-for="(i, index) in memberTeamSearch.team" :key="index">
          <TeamCard
            @viewTeam="showTeam"
            :user="getMember(i)"
            :stats="statsMap[i.id]"
            :compStats="compStats[i.id]"
            :actions="true"
            noData="No data available"
            teamSearchMode
            @tabActivated="tabActivated"
            :activeTab="activeTab"
          />
        </v-flex>
      </v-layout>
      <div class="text-center" v-if="length > 0">
        <v-pagination
          v-model="page"
          :length="length"
        ></v-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import TeamCard from '@/components/TeamCard.vue'
import { ENGINE_STATS_QUERY, formatData } from '@/graphql/comp.gql'
import { TEAM_SEARCH_QUERY } from '@/graphql/Team.gql'

export default {
  name: 'TeamSearch',
  components: {
    TeamCard
  },
  data() {
    return {
      currentUser: null,
      onlyPendingRecon: false,
      mergedTeamArr: [],
      hashResTeam: [],
      page: 1,
      teamIds: [],
      compStats: {},
      memberTeamSearch: {
        team: [],
        totalCount: 0
      },
      statsMap: {},
      query: null,
      sort: {
        label: 'Levels: Closest - Furthest',
        orderDirection: 'asc',
        orderByColumn: 'depth'
      },
      limit: 25,
      loading: 0,
      sorts: [
        {
          label: 'Levels: Closest - Furthest',
          orderDirection: 'asc',
          orderByColumn: 'depth'
        },
        {
          label: 'Levels: Furthest - Closest',
          orderDirection: 'desc',
          orderByColumn: 'depth'
        },
        {
          label: 'Joined Date: Oldest - Newest',
          orderDirection: 'asc',
          orderByColumn: 'mrn'
        },
        {
          label: 'Joined Date: Newest - Oldest',
          orderDirection: 'desc',
          orderByColumn: 'mrn'
        }
      ],
      activeTab: null
    }
  },
  methods: {
    tabActivated(tab) {
      this.activeTab = tab
    },
    showTeam (user) {
      this.currentUser = user
    },
    getMember(user) {
      return { ...user, addresses: [user.address] }
    }
  },
  computed: {
    ...mapGetters(['member', 'memberId']),
    ...mapState({
      openPeriod: state => {
        return state.comp.periods.open && state.comp.periods.open[0]
      }
    }),
    length() {
      return Math.ceil(this.memberTeamSearch.totalCount / this.limit)
    }
  },
  apollo: {
    memberTeamSearch: {
      query: TEAM_SEARCH_QUERY,
      variables() {
        return {
          input: {
            memberId: this.currentUser ? this.currentUser.id : this.memberId,
            query: this.query,
            orderDirection: this.sort.orderDirection,
            orderByColumn: this.sort.orderByColumn,
            limit: this.limit,
            offset: (this.page - 1) * this.limit,
            periodId: this.openPeriod && this.openPeriod.id,
            tagsIn: this.onlyPendingRecon ? ['acct_reconcile:release_pending'] : null
          }
        }
      },
      update({ membership: { teamMemberSearch: memberTeamSearch } }) {
        this.teamIds = []
        if (memberTeamSearch.team) {
          memberTeamSearch.team.forEach(member => {
            this.teamIds.push(member.id)
            member.ancestors = member.ancestors.reverse()
          })
        }
        return memberTeamSearch
      },
      skip() {
        return !this.openPeriod
      },
      loadingKey: 'loading',
      debounce: 500,
      client: 'federated'
    },
    compStats: {
      query: ENGINE_STATS_QUERY,
      variables() {
        const { teamIds } = this
        const memberIn = teamIds.map(t => {
          return {
            memberId: t,
            periodId: this.openPeriod && this.openPeriod.id
          }
        })
        return {
          payload: {
            memberIn
          }
        }
      },
      skip() {
        return !this.openPeriod || this.teamIds.length === 0
      },
      update ({ engine: { rankings: { results } } }) {
        const team = results.map(formatData)
        const parsedStats = team.reduce((orig, s) => {
          orig[s.memberId] = s
          return orig
        }, {})
        return parsedStats
      },
      fetchPolicy: 'network-only',
      client: 'federated'
    }
  }
}
</script>

<style scoped>
.search-results{
  position: relative;
  min-height: calc(100vh - 272px);
  padding: 15px 0;
}

.loader-overlay {
  display: none;
}

.loading .loader-overlay {
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  border: 10px solid purple;
}
</style>
