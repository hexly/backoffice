<template>
  <v-flex xs12>
    <div class="team">
      <h1 v-bind:target="currentId">Team</h1>
      <TeamCard @viewTeam="showTeam" :user="results.target" v-if="results.target"/>
      
      <v-breadcrumbs divider="/">
        <v-breadcrumbs-item
          v-for="(user, index) in lineage"
          :key="user.email"
          :disabled="index === (lineage.length - 1)"
        >
          <span @click="updateLineage(user, index)">{{user.displayName}}</span>
        </v-breadcrumbs-item>
      </v-breadcrumbs>
      
      <v-container fluid grid-list-lg>
        <v-layout row wrap>
          <v-flex lg4 v-for="i in results.team" :key="i.email">
            <TeamCard @viewTeam="showTeam" :user="i" :actions="true" />
          </v-flex>
        </v-layout>
      </v-container>
      
    </div>
  </v-flex>
</template>

<script>
import TeamCard from '../components/TeamCard.vue'
import getTeam from '@/graphql/GetTeam'

export default {
  name: 'Team',
  data: () => {
    return {
      lineage: [],
      currentId: undefined,
      results: {
        target: undefined, 
        team: []
      }
    }
  },
  components: {
    TeamCard
  },
  methods: {
    showTeam(user) {
      this.lineage.push(user)
      this.currentId = user.id
    },
    updateLineage(user, index) {
      this.lineage = this.lineage.slice(0, index + 1)
      this.currentId = user.id || user.identityId
    }
  },
  apollo: {
    // TODO only run AFTER mount
    // TODO how to do dynamic variables better?    
    results: getTeam( {
      variables: function() { // must be a stupid function, closures do not live update
        const id = this.$store.state.user.principal.memberId || 1
        return {
          byTarget: {
            memberId: id
          },
          bySponsor: {
            sponsorId: id
          }
        }
      }
    })    
  },
  beforeMount() {    
    this.currentId = this.$store.state.user.principal.memberId
    this.lineage.push(this.$store.state.user.principal)
  }
}
</script>
