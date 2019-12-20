<template>
  <div class="text-xs-center pb-3 badges">
    <h3>Awards</h3>
    <v-flex tag="strong" xs5 text-xs-right mr-3 mb-2>
      <v-chip color="primary" text-color="white">
        <v-avatar class="primary darken-4">
          <v-icon>cake</v-icon>
        </v-avatar>
        {{birthday}}
      </v-chip>
      <v-chip v-if="isFounder" color="secondary" text-color="white">
        <v-avatar class="secondary darken-4">
          <v-icon>star</v-icon>
        </v-avatar>
        Founding Influencer
      </v-chip>
      <v-chip v-for="award in awards" :color="award.metadata.color" :text-color="award.metadata.text" :key="award.name">
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
    joinedOn: String // Just leave it... I know
  },
  data() {
    return {
      awards: []
    }
  },
  computed: {
    birthday() {
      const time = this.$moment(this.joinedOn).toNow(true)
      return time.replace('a ', '1 ')
    },
    isFounder() {
      return this.$moment(this.joinedOn).isBefore('2020-04-01')
    }
  },
  apollo: {
    awards: {
      query: MEMBER_AWARDS,
      update({ iamPrincipal: { member: { awards } } }) {
        return awards
      }
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
