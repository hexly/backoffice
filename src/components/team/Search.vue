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
      <v-layout wrap align-space-between justify-center row fill-height pb-2>
        <v-flex v-for="(i, index) in memberTeamSearch.team" :key="index">
          <TeamCard
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
            orderDirection: this.sort.orderDirection,
            orderByColumn: this.sort.orderByColumn,
            limit: this.limit,
            offset: (this.page - 1) * this.limit
          }
        }
      },
      loadingKey: 'loading',
      debounce: 500
    }
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
