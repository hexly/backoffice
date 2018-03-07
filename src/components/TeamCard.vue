<template>
  <v-card class="team-card">
    <v-container fluid grid-list-lg>
      <v-layout row>
        <v-flex xs7>
          <div>
            <div class="headline">{{user.name}} {{user.surname}}</div>
            <div>{{user.email}}</div>
            <div>{{user.region}}</div>
          </div>
        </v-flex>
        <v-flex xs5>
          <v-card-media
            :src="user.photo"
            height="125px"
            contain
          ></v-card-media>
        </v-flex>
      </v-layout>
    </v-container>
    <v-card-actions>
      <v-btn flat color="orange">View Team</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'TeamCard',
  data: () => ({
    show: false
  }),
  props: {
    user: Object
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.team-card {
  margin: 10px;
  width: 250px;
}
</style>
