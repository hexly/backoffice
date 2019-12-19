<template>
  <div class="profile text-xs-center">
      <v-tabs centered color="secondary" dark icons-and-text>
        <v-tabs-slider color="white"></v-tabs-slider>

        <v-tab to="#hierarchy">Team By Generation
          <v-icon>portrait</v-icon>
        </v-tab>
        <v-tab to="#search">Search Team
          <v-icon>search</v-icon>
        </v-tab>

        <v-tab-item value="hierarchy" class="py-3">
          <HierarchyCards />
        </v-tab-item>
        <v-tab-item value="search" class="py-3">
          <TeamSearch />
        </v-tab-item>
      </v-tabs>
  </div>
</template>

<script>
import HierarchyCards from '@/components/team/HierarchyCards.vue'
import TeamSearch from '@/components/team/Search.vue'

export default {
  name: 'Team',
  components: {
    HierarchyCards,
    TeamSearch
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
