<template>
  <div class="profile">
    <v-tabs centered background-color="secondary" dark icons-and-text>
      <v-tabs-slider color="white"></v-tabs-slider>

      <v-tab to="#hierarchy">Generations
        <v-icon>portrait</v-icon>
      </v-tab>
      <template v-if="$tenantInfo.features.activity">
        <v-tab to="#activity">Activity
          <v-icon>whatshot</v-icon>
        </v-tab>
      </template>
      <v-tab to="#search">Search
        <v-icon>search</v-icon>
      </v-tab>
      <v-tab to="#graph">Graph
        <v-icon>scatter_plot</v-icon>
      </v-tab>

      <v-tab-item value="hierarchy" class="py-3">
        <v-lazy>
          <HierarchyCards />
        </v-lazy>
      </v-tab-item>
      <template v-if="$tenantInfo.features.activity">
        <v-tab-item value="activity" class="py-3">
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
      <v-tab-item value="graph" class="py-3">
        <v-lazy>
          <TeamGraph />
        </v-lazy>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import HierarchyCards from '@/components/team/HierarchyCards.vue'
import TeamActivity from '@/components/team/TeamActivity.vue'
import TeamSearch from '@/components/team/Search.vue'
import TeamGraph from '@/components/team/Graph.vue'

export default {
  name: 'Team',
  components: {
    HierarchyCards,
    TeamSearch,
    TeamGraph,
    TeamActivity
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
