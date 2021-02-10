<template>
  <div class="profile">
    <v-tabs
      centered
      background-color="secondary"
      dark
      icons-and-text
    >
      <v-tabs-slider color="white"></v-tabs-slider>

      <template v-if="GET($tenantInfo, 'features.insights.dashboard')">
        <v-tab to="#dashboard">Dashboard
          <v-icon>dashboard</v-icon>
        </v-tab>
      </template>
      <template v-if="GET($tenantInfo, 'features.insights.reports')">
        <v-tab to="#reports">Reports
          <v-icon>trending_up</v-icon>
        </v-tab>
      </template>

      <template v-if="GET($tenantInfo, 'features.insights.dashboard')">
        <v-tab-item value="dashboard" class="py-3">
          <v-lazy>
            <Dasboard />
          </v-lazy>
        </v-tab-item>
      </template>
      <template v-if="GET($tenantInfo, 'features.insights.reports')">
        <v-tab-item value="reports">
          <v-lazy>
            <Reports />
          </v-lazy>
        </v-tab-item>
      </template>
    </v-tabs>
  </div>
</template>

<script>
import GET from 'lodash/get'
import Dasboard from '@/components/insights/Dashboard.vue'
import Reports from '@/components/insights/Reports.vue'

export default {
  name: 'Insights',
  components: {
    Dasboard,
    Reports
  },
  data () {
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
