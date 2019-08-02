<template>
  <v-card class="team-card mx-2 my-2">
    <v-card-title primary-title class="secondary white--text">
      <v-flex>
        <h4>{{(user.name).toUpperCase()}}</h4>
        <h4 v-if="hasEmail">{{(user.contacts[0].emails[0].email).toLowerCase()}}</h4>
        </v-flex>
        <!-- <v-flex fill-height>
          <img :src="getAvatar" class="cardImg" height="125px" width="125px"/>
        </v-flex> -->
      </v-card-title>
    <v-container fluid grid-list-lg>
      <v-layout row>
        <v-flex xs12>
          <v-card-text v-if="!loading">
            <span v-if="stats && stats.joinedOn"><br>
            <span>Joined {{formatDate(stats.joinedOn)}}</span><br>
            <span>Tribe Size: {{stats.teamSize || 0}}</span><br>
            <span>Front Line: {{stats.firstLevelSize || 0}}</span><br>
            <span>Total Points: {{stats.totalPoints ? stats.totalPoints.toFixed(2) : 0}}</span>
            </span>
          <span v-else>{{noData}}</span>
          </v-card-text>
        <div v-if="loading">
          <v-progress-circular indeterminate :size="50" :width="5" color="black"></v-progress-circular>
        </div>
        </v-flex>
      </v-layout>
    </v-container>
    <div width=100%>
      <v-card-actions v-if="actions" justify-space-around>
        <v-btn flat color="secondary" block @click="viewTeam">View Team</v-btn>
        <v-btn flat color="primary" block v-if="isQualified">qualified</v-btn>
        <v-btn flat color=white block disabled v-else>unqualified</v-btn>
      </v-card-actions>
    </div>
  </v-card>
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
      if (this.user.contacts[0].emails[0].email) {
        return true
      } else return false
    }
  }
}
</script>

<style scoped>
.team-card {
  margin: 10px;
  /* min-width: 350px; */
  max-width: 500px;
}
.cardImg {
  margin: auto;
  height: 125px;
  widows: 125px;
}
</style>
