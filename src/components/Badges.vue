<template>
  <div class="text-center pb-3 badges">
    <h3>Awards</h3>
    <h5 v-if="loading">Loading Awards</h5>
    <v-progress-circular v-if="loading" indeterminate :size="30" :width="3" color="grey"></v-progress-circular>
    <v-flex v-else tag="strong" xs5 text-right>
      <template v-if="joinedOn">
        <v-chip small pill color="primary elevation-3" text-color="white" class="ma-1">
          <v-avatar left class="primary darken-4">
            <v-icon>cake</v-icon>
          </v-avatar>
          {{birthday}}
        </v-chip>
      </template>
      <v-chip small pill v-for="award in awards" class="ma-1 elevation-3" :color="award.metadata.color" :text-color="award.metadata.text" :key="award.name">
        <v-avatar left :color="award.metadata.accent">
          <v-icon small>{{award.metadata.icon}}</v-icon>
        </v-avatar>
        {{award.name}}
      </v-chip>
    </v-flex>
  </div>
</template>

<script>
import { MEMBER_AWARDS } from '@/graphql/Member.gql.js'
import * as _ from 'lodash'

export default {
  name: 'Badges',
  props: {
    memberId: Number
  },
  data() {
    return {
      awards: [],
      loading: 0,
      joinedOn: null
    }
  },
  computed: {
    birthday() {
      this.$moment.relativeTimeRounding(Math.floor)
      const time = this.$moment(this.joinedOn).toNow(true)
      return time.replace('a ', '1 ')
    }
  },
  apollo: {
    awards: {
      query: MEMBER_AWARDS,
      client: 'federated',
      variables() {
        return {
          input: {
            tenantIn: [this.$tenantId],
            idIn: [this.memberId]
          }
        }
      },
      update(data) {
        const joinedOn = _.get(data, 'membership.search.results.0.joinedOn')
        const awards = _.get(data, 'membership.search.results.0.awards')
        this.joinedOn = joinedOn

        return awards
      },
      loadingKey: 'loading'
    }
  }
}
</script>

<style>
.dashboard-card .avatar {
  position: relative;
  top: -62px;
  margin-bottom: -62px;
  padding-top: 19px;
}
.dashboard-card .avatar .v-responsive {
  box-shadow: 0px -10px 30px -4px black;
  border: 3px solid white;
}
</style>
