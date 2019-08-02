<template>
      <v-card
      class="mx-2 my-2 px-2 py-2"
      max-width="400"
    >
    <v-responsive :aspect-ratio="16/9">
      <v-img
        class="white--text"
        :src="getAvatar"
        height="400px"
        width="400px"
        contain
        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      >
        <v-card-title class="align-end fill-height"><h4>{{user.name}}</h4></v-card-title>
      </v-img>
    </v-responsive>
      <v-card-text>
        <span></span><br>
        <span class="text--primary">
          <span>{{stats.joinedOn}}</span><br>
          <span></span>
        </span>
      </v-card-text>
      <v-card-actions>
        <v-btn
        >
          Share
        </v-btn>
        <v-btn
        >
          Explore
        </v-btn>
      </v-card-actions>
    </v-card>
        <!-- <v-flex xs7>
          <div v-if="!loading">
            <div class="headline">{{user.name}}</div>
            <div v-if="hasEmail">{{user.contacts[0].emails[0].email}}</div>
            <div v-if="stats && stats.joinedOn">
              <div>Joined {{formatDate(stats.joinedOn)}}</div>
              <div>Tribe Size: {{stats.teamSize || 0}}</div>
              <div>Front Line: {{stats.firstLevelSize || 0}}</div>
              <div>Total Points: {{stats.totalPoints ? stats.totalPoints.toFixed(2) : 0}}</div>
            </div>
            <div v-else>
              {{noData}}
            </div>
          </div>
          <div v-if="loading">
            <v-progress-circular indeterminate :size="50" :width="5" color="black"></v-progress-circular>
          </div>
        </v-flex>
        <v-flex xs5>
          <v-card-media>
            <img :src="getAvatar" />
          </v-card-media>
        </v-flex> -->
    <!-- <div width=100%> -->
      <!--<v-card-actions v-if="actions">
        <v-btn flat color="secondary" block @click="viewTeam">View Team</v-btn>
        <v-btn flat color="white" block disabled></v-btn>
        <v-btn flat color="primary" block v-if="isQualified">qualified</v-btn>
        <v-btn flat color=white block disabled v-else>unqualified</v-btn>
      </v-card-actions> -->
    <!-- </div> -->
  <!--</v-card>-->

</template>

<script>
export default {
  name: 'TeamCard',
  data() {
    return {
      show: false
    }
  },
  props: {
    user: Object,
    actions: Boolean,
    stats: Object,
    loading: Boolean,
    noData: String
  },
  methods: {
    formatDate (value) {
      return this.$moment(value, 'YYYY-MM-DD').from(this.$moment())
    },
    viewTeam () {
      this.$emit('viewTeam', this.user)
    }
  },
  computed: {
    getAvatar () {
      return (
        (this.user && this.user.profileUrl) ||
        this.$tenantInfo.placeholder
      )
    },
    isQualified () {
      if (this.stats) {
        let joined = new Date(this.stats.joinedOn)
        let today = new Date()
        joined = `${joined.getFullYear()}-${joined.getMonth()}`
        today = `${today.getFullYear()}-${today.getMonth()}`
        const joinedThisMonth = joined === today
        return this.stats.totalPoints >= 60 || joinedThisMonth
      }
      return false
    },
    hasEmail () {
      return this.user.contacts[0].emails[0].email
    }
  }
}
</script>

<style scoped>
/* .team-card {
} */
 .team-card v-img {
  width: 125px;
  height: 125px;
  margin: auto;
}
</style>
