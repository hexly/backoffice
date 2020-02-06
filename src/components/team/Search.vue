<template>
  <div class="pa-2">
    <div>
      <form>
        <h5>Search By Name:</h5>
        <v-text-field
          solo
          v-model="query"
          placeholder="Influecer Name"
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
      <div class="loader-overlay text-xs-center">
        <v-progress-circular class="loader" indeterminate :size="60" :width="6" color="black"></v-progress-circular>
      </div>
      <v-layout wrap align-space-between justify-center row fill-height>
        <v-flex v-for="(i, index) in mergedTeamArr" :key="index">
          <TeamCard
            @viewTeam="showTeam"
            :user="i"
            :stats="statsMap[i.id]"
            :actions="true"
            noData="No data available"
          />
        </v-flex>
      </v-layout>
      <div class="text-xs-center" v-if="length > 0">
        <v-pagination
          v-model="page"
          :length="length"
        ></v-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import TeamCard from '@/components/TeamCard.vue'
import { TEAM_QUERY, TEAM_SEARCH_QUERY } from '@/graphql/Team.gql'

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
      limit: 28,
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
      ]
    }
  },
  methods: {
    showTeam (user) {
      this.lineage.push(user)
      this.currentId = user.id || user.memberId
    },
    hashResultsTeam(results, memberTeamSearch) {
      let matchArr = []

      if (!memberTeamSearch || !results) {
        return
      }

      memberTeamSearch.team.forEach(member => {
        const matchIndex = results.team.findIndex(element => member.id === element.id)
        matchArr.push(matchIndex)
      })

      this.hashResTeam = matchArr

      this.mergeUserTeam()
    },
    mergeUserTeam() {
      let mergedArr = []
      const { results: { team: resTeam }, memberTeamSearch: { team: mtsTeam }, hashResTeam } = this

      if (!hashResTeam || !hashResTeam.length || !mtsTeam) {
        this.mergedTeamArr = mtsTeam
        return
      }

      mtsTeam.forEach((mtsObject, index) => {
        let newMtsObj = { ...mtsObject }
        const resObject = resTeam[hashResTeam[index]]
        if (!resObject) {
          mergedArr.push(newMtsObj)
          return
        }
        const resObjectKeys = Object.keys(resObject)

        resObjectKeys.forEach(resKey => {
          const mtsObjHasProp = mtsObject.hasOwnProperty(resKey)

          if (!mtsObjHasProp) {
            newMtsObj[resKey] = resObject[resKey]
          }
        })
        mergedArr.push(newMtsObj)
      })
      this.mergedTeamArr = mergedArr
    }
  },
  computed: {
    ...mapGetters(['member', 'memberId']),
    length() {
      return Math.ceil(this.memberTeamSearch.totalCount / this.limit)
    }
  },
  watch: {
    results(newVal) {
      const { memberTeamSearch } = this

      this.hashResultsTeam(newVal, memberTeamSearch)
    },
    memberTeamSearch(newVal) {
      const { results } = this

      this.hashResultsTeam(results, newVal)
    }
  },
  apollo: {
    results: {
      query: TEAM_QUERY,
      variables() {
        const id = this.currentId || this.memberId
        return {
          byTarget: { ids: [id] }, // get me the target
          bySponsor: { sponsorIds: [id] } // get me anyone who belongs to the target
        }
      },
      update ({ target, team }) {
        return {
          target: target.nodes[0],
          team: team.nodes
        }
      }
    },
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
        this.$apollo.queries.results.refetch()
        return memberTeamSearch
      },
      loadingKey: 'loading',
      debounce: 500
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
}
</style>
