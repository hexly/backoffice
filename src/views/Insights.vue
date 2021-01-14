<template>
  <div class="profile">
    <v-tabs
      centered
      background-color="secondary"
      dark
      icons-and-text
    >
      <v-tabs-slider color="white"></v-tabs-slider>

      <v-tab
        to="#dashboard"
        v-if="true"
      >Dashboard
        <v-icon>dashboard</v-icon>
      </v-tab>
      <template v-if="true">
        <v-tab to="#reports">Reports
          <v-icon>trending_up</v-icon>
        </v-tab>
      </template>

      <v-tab-item
        value="dashboard"
        class="py-3"
      >
        <v-lazy>
          <Dasboard />
        </v-lazy>
      </v-tab-item>
      <template v-if="true">
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
