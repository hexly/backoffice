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
import { COMP_PREVIEW_QUERY, parseData } from '@/graphql/comp.gql'
import { TEAM_SEARCH_QUERY } from '@/graphql/Team.gql'

export default {
  name: 'TeamSearch',
  components: {
    TeamCard
  },
  data() {
    return {
      lineage: [],
      currentId: null,
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
      limit: 14,
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
      const currentId = user.id || user.memberId
      this.lineage.push(user)
      this.currentId = currentId
    },
    getMember(user) {
      return { ...user, addresses: user.member.addresses }
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
            query: this.query,
            orderDirection: this.sort.orderDirection,
            orderByColumn: this.sort.orderByColumn,
            limit: this.limit,
            offset: (this.page - 1) * this.limit
          }
        }
      },
      update({ memberTeamSearch }) {
        this.teamIds = []
        memberTeamSearch.team.forEach(member => {
          this.teamIds.push(member.id)
        })
        return memberTeamSearch
      },
      loadingKey: 'loading',
      debounce: 500
    },
    compStats: {
      query: COMP_PREVIEW_QUERY,
      variables() {
        return {
          payload: {
            input: {
              memberId: this.currentId,
              periodId: this.openPeriod.id,
              rowTypeIn: ['descendant'],
              page: 1,
              pageSize: 500,
              memberIn: this.teamIds
            }
          }
        }
      },
      skip() {
        return !this.openPeriod
      },
      update(res) {
        const stats = parseData(res)
        return stats.members.reduce((orig, s) => {
          orig[s.awardeeId] = s
          return orig
        }, {})
      },
      client: 'federated'
    }
  },
  mounted () {
    this.currentId = this.member.memberId || this.member.id
    this.lineage.push({ memberId: this.currentId, displayName: this.member.displayName })
  }
}
</script>

<style scoped>
.search-results{
  position: relative;
  min-height: calc(100vh - 272px);
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
