<template>
  <v-card
    max-width="500"
    class="ma-2 pa-2"
  >
    <div v-if="loading">
      <v-progress-circular indeterminate :size="50" :width="5" color="primary"></v-progress-circular>
    </div>

    <v-img
      :src="getAvatar"
      class="cardImg white--text"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
    >
    <v-card-title class="fill-height align-end">
      <h2>{{(user.name).toUpperCase()}}</h2>
      <h4>{{(user.contacts[0].emails[0].email).toLowerCase()}}</h4>
    </v-card-title>
    </v-img>

    <v-card-text v-if="!loading">
      <span v-if="stats && stats.joinedOn"><br>
        <span>Joined {{formatDate(stats.joinedOn)}}</span><br>
        <span>Tribe Size: {{stats.teamSize || 0}}</span><br>
        <span>Front Line: {{stats.firstLevelSize || 0}}</span><br>
        <span>Total Points: {{stats.totalPoints ? stats.totalPoints.toFixed(2) : 0}}</span>
        </span>
      <span v-else>{{noData}}</span>
    </v-card-text>
    <div width=100%>
      <v-card-actions v-if="actions" class="justify-space-between">
        <v-btn flat color="secondary" @click="viewTeam">View Team</v-btn>
        <v-btn flat color="secondary" v-if="isQualified">Qualified</v-btn>
        <v-btn flat color=white disabled v-else>Unqualified</v-btn>
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
.cardImg {
  margin: auto;
  max-height: 50%;
  max-width: 100%;
}
</style>
