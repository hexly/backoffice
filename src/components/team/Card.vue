<template>
  <v-card max-width="350" class="ma-2" >
    <v-card-title primary-title>
      <div style="width: 100%;">
        <h2>{{user.name}}</h2>
        <small>Influencer Since: {{$moment(user.joinedOn).format('ll')}}</small>
      </div>
    </v-card-title>
    <v-progress-circular v-if="loading" indeterminate :size="50" :width="5" color="primary"></v-progress-circular>

    <v-card-text v-if="!loading" class="dense">
      <div class="text-xs-center">
        <v-avatar size="124" class="avatar" color="white" @click="showProfilePicDialog = true">
          <v-img v-if="user.profileUrl || $tenantInfo.placeholder" :src="user.profileUrl || $tenantInfo.placeholder"></v-img>
          <v-gravatar v-else default-img="mp" :email="user.email"/>
        </v-avatar>
      </div>
      <v-subheader>Information</v-subheader>
        <div class="px-3">
          <p>{{(user.email).toLowerCase()}}</p>
          <a target="_blank" :href="$tenantInfo.storeUrl.replace('{slug}', user.slug)">
            {{$tenantInfo.storeUrl.replace('{slug}', user.slug)}}
          </a>
        </div>
      <v-subheader>Relation</v-subheader>
      <div class="px-3">
        <p>Level: {{user.relativeDepth}}</p>
        <v-layout align-center justify-start row>
          <template v-for="parent in user.relativePathMembers">
            <v-flex :shrink="true" :key="parent.profileUrl">
                <v-tooltip top slot="append">
                  <v-avatar class="mx-1" size="36px" slot="activator">
                    <img :src="parent.profileUrl || $tenantInfo.placeholder" alt="Avatar" >
                  </v-avatar>
                  <span>{{parent.name}}</span>
                </v-tooltip>
            </v-flex>
          </template>
        </v-layout>
      </div>
      <v-subheader>Sales Stats</v-subheader>
      <div class="px-3">
        <div v-if="stats && stats.joinedOn">
          <div>
            <span>Joined {{formatDate(stats.joinedOn)}}</span>
            <span> on </span>
            <span>{{$moment(stats.joinedOn).format('ll')}}</span>
          </div>
          <div>Tribe Size: {{stats.teamSize || 0}}</div>
          <div>Front Line: {{stats.firstLevelSize || 0}}</div>
          <div>Total Points: {{stats.totalPoints ? stats.totalPoints.toFixed(2) : 0}}</div>
        </div>
        <div v-else>{{noData}}</div>
      </div>
    </v-card-text>

    <v-divider v-if="actions" class="primary"/>
    <v-card-actions v-if="actions" class="justify-space-between">
      <v-btn flat color="secondary" @click="viewTeam">View Team</v-btn>
      <!-- <v-btn flat color="primary" v-if="isQualified">Qualified</v-btn>
      <v-btn flat color=white disabled v-else>Unqualified</v-btn> -->
    </v-card-actions>

  </v-card>
</template>

<script>
import { get } from 'lodash'

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
    email () {
      return get(this.user, 'contacts[0].emails[0].email', this.user.email)
    }
  }
}
</script>

<style scoped>
.cardImg {
  margin: auto;
  max-height: 100%;
  max-width: 100%;
}
.dense {
  padding: 0;
}
</style>
