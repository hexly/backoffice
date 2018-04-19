<template>
  <v-flex xs12>
    <div class="team" v-if="!!results.target">
      <h1 v-bind:target="currentId">Team</h1>
      <v-layout row wrap justify-center>
        <TeamCard @viewTeam="showTeam" :user="results.target"/>
      </v-layout>
      <v-breadcrumbs divider="/">
        <v-breadcrumbs-item
          v-for="(user, index) in lineage"
          :key="user.email"
          :disabled="index === (lineage.length - 1)"
        >
          <span @click="updateLineage(user, index)">{{user.displayName}}</span>
        </v-breadcrumbs-item>
      </v-breadcrumbs>
      <v-layout row wrap>
        <v-flex lg4 v-for="i in results.team" :key="i.email">
          <TeamCard @viewTeam="showTeam" :user="i" :actions="true" />
        </v-flex>
      </v-layout>
    </div>
  </v-flex>
</template>

<script>
import TeamCard from '../components/TeamCard.vue'
import getTeamByMemberId from '@/graphql/GetTeam'

export default {
  name: 'Team',
  data: () => ({
    root: {},
    lineage: [],
    currentId: undefined,
    results: {
      target: undefined,
      team: []
    }
  }),
  components: {
    TeamCard
  },
  methods: {
    showTeam(user) {
      this.lineage.push(user)
      this.currentId = user.memberId
    },
    updateLineage(user, index) {
      this.lineage = this.lineage.slice(0, index + 1)
      this.currentId = user.memberId
    }
  },
  apollo: {
    results: getTeamByMemberId('currentId')
  },
  mounted() {
    const { member } = this.$store.state.user.principal
    this.currentId = member.id
    this.lineage.push({ memberId: member.id, displayName: member.name })
  }
}
</script>
