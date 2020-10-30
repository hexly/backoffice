<template>
  <div class="profile">
    <v-tabs centered background-color="secondary" dark icons-and-text>
      <v-tabs-slider color="white"></v-tabs-slider>

      <v-tab to="#hierarchy" v-if="GET($tenantInfo, 'features.team.generations', false)">Generations
        <v-icon>portrait</v-icon>
      </v-tab>
      <template v-if="GET($tenantInfo, 'features.team.activity', false)">
        <v-tab to="#activity">Activity
          <v-icon>whatshot</v-icon>
        </v-tab>
      </template>
      <v-tab to="#search" v-if="GET($tenantInfo, 'features.team.search', true)">
        Search
        <v-icon>search</v-icon>
      </v-tab>
      <v-tab to="#directory" v-if="GET($tenantInfo, 'features.team.directory', true)">
        Directory
        <v-icon>chrome_reader_mode</v-icon>
      </v-tab>
      <v-tab to="#graph" v-if="GET($tenantInfo, 'features.team.graph', false)">
        Graph
        <v-icon>scatter_plot</v-icon>
      </v-tab>

      <v-tab-item value="hierarchy" class="py-3">
        <v-lazy>
          <HierarchyCards />
        </v-lazy>
      </v-tab-item>
      <template v-if="$tenantInfo.features.activity">
        <v-tab-item value="activity">
          <v-lazy>
            <TeamActivity />
          </v-lazy>
        </v-tab-item>
      </template>
      <v-tab-item value="search" class="py-3">
        <v-lazy>
          <TeamSearch />
        </v-lazy>
      </v-tab-item>
      <v-tab-item value="directory" class="py-3">
        <v-lazy>
          <Directory class="py-2" title="Your Circle of Influence" membersTypeName="Influencer"/>
        </v-lazy>
      </v-tab-item>
      <v-tab-item value="graph" class="py-3">
        <v-lazy>
          <TeamGraph />
        </v-lazy>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import GET from 'lodash/get'
import HierarchyCards from '@/components/team/HierarchyCards.vue'
import TeamActivity from '@/components/team/TeamActivity.vue'
import Directory from '@/components/dashboard/Directory.vue'
import TeamSearch from '@/components/team/Search.vue'
import TeamGraph from '@/components/team/Graph.vue'

export default {
  name: 'Team',
  components: {
    HierarchyCards,
    TeamSearch,
    TeamGraph,
    TeamActivity,
    Directory
  },
  data() {
    return {
      GET
    }
  }
}
</script>

<style>
.team {
  max-width: 1440px;
  margin: auto;
  padding: 0 25px;
}
</style>
