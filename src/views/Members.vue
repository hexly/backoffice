<template>
  <v-flex xs12>
    <div class="team">
      <h1>Team</h1>
      <v-breadcrumbs divider="/">
        <v-breadcrumbs-item
          v-for="(user, index) in lineage"
          :key="user.email"
          :disabled="index === (lineage.length - 1)"
        >
          <span @click="updateLineage(user, index)">{{user.name}} {{user.surname}}</span>
        </v-breadcrumbs-item>
      </v-breadcrumbs>
      <v-container fluid grid-list-lg>
        <v-layout row wrap>
          <v-flex lg4 v-for="t in team" :key="t.email">
            <TeamCard @viewTeam="showTeam" :user="t" />
          </v-flex>
        </v-layout>
      </v-container>
    </div>
  </v-flex>
</template>

<script>
import TeamCard from '../components/TeamCard.vue'

export default {
  name: 'Team',
  data: () => {
    return {
      lineage: []
    }
  },
  components: {
    TeamCard
  },
  methods: {
    showTeam(user) {
      this.lineage.push(user)
      this.$store.dispatch('getTeam')
    },
    updateLineage(user, index) {
      this.$store.dispatch('getTeam')
      this.lineage = this.lineage.slice(0, index + 1)
    }
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
