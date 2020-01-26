<template>
  <div class="profile">
    <v-tabs centered color="secondary" dark icons-and-text>
      <v-tabs-slider color="white"></v-tabs-slider>

      <v-tab to="#hierarchy">Generations
        <v-icon>portrait</v-icon>
      </v-tab>
      <v-tab to="#search">Search
        <v-icon>search</v-icon>
      </v-tab>
      <v-tab to="#graph">Graph
        <v-icon>scatter_plot</v-icon>
      </v-tab>

      <v-tab-item lazy value="hierarchy" class="py-3">
        <HierarchyCards />
      </v-tab-item>
      <v-tab-item lazy value="search" class="py-3">
        <TeamSearch />
      </v-tab-item>
      <v-tab-item lazy value="graph" class="py-3">
        <TeamGraph />
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import HierarchyCards from '@/components/team/HierarchyCards.vue'
import TeamSearch from '@/components/team/Search.vue'
import TeamGraph from '@/components/team/Graph.vue'

export default {
  name: 'Team',
  components: {
    HierarchyCards,
    TeamSearch,
    TeamGraph
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
