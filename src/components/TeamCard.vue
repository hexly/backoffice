<template>
  <v-card class="team-card">
    <v-layout class="pa-4" row wrap align-center justify-space-between>
      <div v-if="!loading" style="flex: 2; min-width: 150px;" class="text-xs-center text-sm-left">
        <div class="headline">{{user.name}}</div>
        <div>{{user.contactEmail}}</div>
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
      <div v-else style="flex: 2;">
        <v-progress-circular indeterminate :size="50" :width="5" color="black"></v-progress-circular>
      </div>
      <img :src="getAvatar" />
    </v-layout>
    <div width=100%>
      <v-card-actions v-if="actions">
        <v-btn flat color="secondary" block @click="viewTeam">View Team</v-btn>
        <v-spacer />
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.team-card {
  margin: 10px;
  max-width: 500px;
}
.team-card img {
  width: 125px;
  height: 125px;
  margin: auto;
}
</style>
