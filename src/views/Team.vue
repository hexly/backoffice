<template>
  <div class="profile">
    <v-tabs centered background-color="secondary" dark icons-and-text>
      <v-tabs-slider color="white"></v-tabs-slider>

      <v-tab to="#team" v-if="GET($tenantInfo, 'features.team.search', false)">Team
        <v-icon>portrait</v-icon>
      </v-tab>
      <template v-if="GET($tenantInfo, 'features.team.activity', false)">
        <v-tab to="#activity">Activity
          <v-icon>whatshot</v-icon>
        </v-tab>
      </template>
      <!-- <v-tab to="#directory" v-if="GET($tenantInfo, 'features.team.directory', true)">
        Directory
        <v-icon>chrome_reader_mode</v-icon>
      </v-tab> -->
      <v-tab to="#graph" v-if="GET($tenantInfo, 'features.team.graph', false)">
        Graph
        <v-icon>scatter_plot</v-icon>
      </v-tab>

      <v-tab-item value="team" class="py-3">
        <v-lazy>
          <TeamSearch />
        </v-lazy>
      </v-tab-item>
      <template v-if="$tenantInfo.features.activity">
        <v-tab-item value="activity">
          <v-lazy>
            <TeamActivity />
          </v-lazy>
        </v-tab-item>
      </template>
      <!-- <v-tab-item value="directory" class="py-3">
        <v-lazy>
          <Directory class="py-2" title="Your Circle of Influence" membersTypeName="Influencer"/>
        </v-lazy>
      </v-tab-item> -->
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
import TeamActivity from '@/components/team/TeamActivity.vue'
import Directory from '@/components/dashboard/Directory.vue'
import TeamSearch from '@/components/team/Search.vue'
import TeamGraph from '@/components/team/Graph.vue'

export default {
  name: 'Team',
  components: {
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
