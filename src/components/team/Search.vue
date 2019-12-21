<template>
  <div class="pa-2">
    <div>
      <form>
        <v-text-field
          solo
          v-model="query"
          placeholder="Influecer Name"
        />
        <v-select
          v-model="sort"
          :items="sorts"
          item-text="label"
          solo
          :return-object="true"
          @change="checkStuff"
        ></v-select>
      </form>
    </div>
    <div v-if="!loading">
      <v-layout row wrap justify-start>
        <v-flex v-for="(i, index) in memberTeamSearch.team" xs12 sm4 md3 :key="index">
          <TeamCard
            :loading="loading"
            :user="i"
            :stats="statsMap[i.id]"
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
      sort: {
        label: 'Levels: Closest - Furthest',
        orderDirection: 'asc',
        orderByColumn: 'depth'
      },
      limit: 25,
      loading: false,
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
  computed: {
    length() {
      return Math.ceil(this.memberTeamSearch.totalCount / this.limit)
    }
  },
  methods: {
    checkStuff() {
      console.log(this.sort)
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
      loadingKey: 'loading'
    }
  }
}
</script>
