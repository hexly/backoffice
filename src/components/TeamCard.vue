<template>
  <v-card class="team-card">
    <v-container
      fluid
      grid-list-lg
    >
      <v-layout row>
        <v-flex xs7>
          <div v-if="!loading">
            <div class="headline">{{user.name}}</div>
            <div>{{user.contactEmail}}</div>
            <div>{{user.displayName}}</div>
            <div>Date Joined: {{stats.joinedOn | formatDate}}</div>
            <div>Team Size: {{stats.teamSize || 0}}</div>
            <div>Front Line: {{stats.firstLevelSize || 0}}</div>
            <!-- <div>Total Points: {{stats.totalPoints || 0}}</div>
            <div>Total Amount: {{stats.totalAmount || 0}}</div> -->
          </div>
          <div v-if="loading">
            <v-progress-circular
              indeterminate
              :size="50"
              :width="5"
              color="black"
            ></v-progress-circular>
          </div>
        </v-flex>
        <v-flex xs5>
          <v-card-media
            height="125px"
            width="125px"
          >
            <img :src="getAvatar" />
          </v-card-media>
        </v-flex>
      </v-layout>
    </v-container>
    <div width=100%>
      <v-card-actions v-if="actions">
        <v-btn
          flat
          color="blue"
          block
          @click="viewTeam"
        >View Team</v-btn>
        <v-btn
          flat
          color="white"
          block
          disabled
        ></v-btn>
        <v-btn
          flat
          color="green"
          block
          v-if="isQualified"
        >qualified</v-btn>
        <v-btn
          flat
          color=white
          block
          disabled
          v-else
        >unqualified</v-btn>
      </v-card-actions>
    </div>
  </v-card>

</template>

<script>
export default {
  name: 'TeamCard',
  data: () => ({
    show: false
  }),
  props: {
    user: Object,
    actions: Boolean,
    stats: Object,
    loading: Boolean
  },
  filters: {
    formatDate (value) {
      const joinedDate = new Date(value)
      return `${joinedDate.getMonth() +
        1}/${joinedDate.getDate()}/${joinedDate.getFullYear()}`
    }
  },
  methods: {
    viewTeam () {
      this.$emit('viewTeam', this.user)
    }
  },
  computed: {
    getAvatar () {
      return (
        (this.user && this.user.profileUrl) ||
        'http://res.cloudinary.com/hexly/image/upload/dev/1001/avatar/undefined.jpg'
      )
    },
    isQualified () {
      console.log(this);

      let joined = new Date(this.stats.joinedOn)
      let today = new Date()
      joined = `${joined.getFullYear()}-${joined.getMonth()}`
      today = `${today.getFullYear()}-${today.getMonth()}`
      const joinedThisMonth = joined === today
      return this.stats.totalPoints >= 60 || joinedThisMonth
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
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
