<template>
  <v-card class="team-card">
    <v-container fluid grid-list-lg>
      <v-layout row>
        <v-flex xs7>
          <div>
            <div class="headline">{{user.name}}</div>
            <div>{{user.email}}</div>
            <div>{{user.displayName}}</div>
          </div>
        </v-flex>
        <v-flex xs5>
          <v-card-media
            height="125px"
            width="125px"
          >
            <img v-if="user.profileUrl" :src="user.profileUrl" />
            <gravatar v-if="!user.profileUrl" :email="user.email" />
          </v-card-media>
        </v-flex>
      </v-layout>
    </v-container>
    <v-card-actions v-if="actions">
      <v-btn flat color="orange" @click="viewTeam">View Team</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import Gravatar from '@/components/Gravatar'

export default {
  name: 'TeamCard',
  components: {
    Gravatar
  },
  data: () => ({
    show: false
  }),
  props: {
    user: Object,
    actions: Boolean
  },
  methods: {
    viewTeam() {
      this.$emit('viewTeam', this.user)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.team-card {
  margin: 10px;
  min-width: 350px;
  max-width: 500px;
}
.team-card img {
  width: 125px;
  height: 125px;
  margin: auto;
}
</style>
