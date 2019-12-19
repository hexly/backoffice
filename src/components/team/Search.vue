<template>
  <div>
    <div>
      <h2>Team Search</h2>
      <form>

      </form>
    </div>
    <div v-if="!loading">
      <v-layout row wrap align-center justify-space-around>
        <v-flex v-for="(i, index) in memberTeamSearch.team" xs12 sm4 md3 :key="index">
          <TeamCard
            :loading="loading"
            :user="i"
            :stats="statsMap[i.id]"
            noData="No data available"
          />
        </v-flex>
      </v-layout>
      <div class="text-xs-center">
        <v-pagination
          v-model="page"
          :length="length"
        ></v-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { TEAM_SEARCH_QUERY } from '@/graphql/Team.gql'
import TeamCard from '@/components/team/Card.vue'

export default {
  name: 'TeamSearch',
  components: {
    TeamCard
  },
  data() {
    return {
      page: 1,
      memberTeamSearch: {
        team: [],
        totalCount: 0
      },
      statsMap: {},
      query: null,
      orderDirection: 'asc',
      orderByColumn: 'mrn',
      limit: 25,
      loading: false
    }
  },
  computed: {
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
            orderDirection: this.orderDirection,
            orderByColumn: this.orderByColumn,
            limit: this.limit,
            offset: (this.page - 1) * this.limit
          }
        }
      },
      loadingKey: 'loading'
    }
  }
}
</script>
