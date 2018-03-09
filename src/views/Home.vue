<template>
  <div class="home">
    <h1>Dashboard</h1>
    <v-subheader>Sales</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex sm4 pa-3>
          <DashCard color="blue-grey" darken="1" display="$100" subheading="Personal" icon="person" />
        </v-flex>
        <v-flex sm4 pa-3>
          <DashCard color="cyan" darken="1" display="$450" subheading="Team" icon="people" />
        </v-flex>
        <v-flex sm4 pa-3>
          <DashCard color="purple" darken="1" display="4" subheading="Orders" icon="star" />
        </v-flex>
      </v-layout>
    </v-container>
    <v-subheader>Team</v-subheader>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex sm4 pa-3>
          <DashCard color="blue-grey" darken="2" display="23" subheading="Size" icon="person_outline" />
        </v-flex>
        <v-flex sm4 pa-3>
          <DashCard color="cyan" darken="2" display="8" subheading="First Level" icon="people_outline" />
        </v-flex>
        <v-flex sm4 pa-3>
          <DashCard color="purple" darken="2" display="3" subheading="Joined this Month" icon="perm_contact_calendar" />
        </v-flex>
      </v-layout>
    </v-container>
    <h2>Daily Growth</h2>
    <line-chart :data="chartData"></line-chart>
  </div>
</template>

<script>
import DashCard from '@/components/DashboardCard.vue'

export default {
  name: 'home',
  components: {
    DashCard
  },
  data: () => ({
    chartData: [['Jan', 4], ['Feb', 2], ['Mar', 10], ['Apr', 5], ['May', 3]]
  })
}
</script>

<style scoped>

</style>
