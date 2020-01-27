<template>
  <div class="text-xs-center pb-3 badges">
    <h3>Awards</h3>
    <h5 v-if="loading">Loading Awards</h5>
    <v-progress-circular v-if="loading" indeterminate :size="30" :width="3" color="grey"></v-progress-circular>
    <v-flex v-else tag="strong" xs5 text-xs-right mb-2 >
      <template v-if="joinedOn">
        <v-chip color="primary elevation-3" text-color="white">
          <v-avatar class="primary darken-4">
            <v-icon>cake</v-icon>
          </v-avatar>
          {{birthday}}
        </v-chip>
      </template>
      <v-chip v-for="award in awards" class="elevation-3" :color="award.metadata.color" :text-color="award.metadata.text" :key="award.name">
        <v-avatar :color="award.metadata.accent">
          <v-icon>{{award.metadata.icon}}</v-icon>
        </v-avatar>
        {{award.name}}
      </v-chip>
    </v-flex>
  </div>
</template>

<script>
import { MEMBER_AWARDS } from '@/graphql/Member.gql.js'

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
      const time = this.$moment(this.joinedOn).toNow(true)
      return time.replace('a ', '1 ')
    }
  },
  apollo: {
    awards: {
      query: MEMBER_AWARDS,
      variables() {
        return {
          memberId: this.memberId
        }
      },
      update({ member }) {
        this.joinedOn = member.joinedOn
        return member.awards
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
