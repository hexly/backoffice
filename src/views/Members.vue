<template>
  <v-flex xs12>
    <div class="team">
      <h1>Team</h1>
      <v-container fluid grid-list-lg>
        <v-layout row wrap justify-center align-center>
          <TeamCard v-for="t in team" :key="t.email" :user="t" />
        </v-layout>
      </v-container>
    </div>
  </v-flex>
</template>

<script>
import TeamCard from '../components/TeamCard.vue'

export default {
  name: 'Team',
  components: {
    TeamCard
  },
  mounted() {
    this.$store.dispatch('getTeam')
  },
  computed: {
    team() {
      return this.$store.state.team.team
    }
  }
}
</script>
