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
          <span @click="updateLineage(user, index)">{{user.displayName}}</span>
        </v-breadcrumbs-item>
      </v-breadcrumbs>
      <v-container fluid grid-list-lg>
        <v-layout row wrap>
          <v-flex lg4 v-for="i in allIdentities" :key="i.email">
            <TeamCard @viewTeam="showTeam" :user="i" />
          </v-flex>
        </v-layout>
      </v-container>
    </div>
  </v-flex>
</template>

<script>
import TeamCard from '../components/TeamCard.vue'
import FRONT_LINE_QUERY from '@/graphql/GetIdentity.gql'

export default {
  name: 'Team',
  data: () => {
    return {
      lineage: [],
      currentId: null,
      allIdentities: []
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
    allIdentities: {
      query: FRONT_LINE_QUERY,
      variables() {
        return {
          condition: {
            sponsorId: this.currentId
          }
        }
      },
      update({ allIdentities }) {
        return allIdentities.nodes
      }
    }
  },
  mounted() {
    this.currentId = this.$store.state.user.principal.identityId
    this.lineage.push(this.$store.state.user.principal)
  }
}
</script>
