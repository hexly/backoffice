<template>
  <v-card>
    <v-toolbar color="secondary" dark >
      <v-toolbar-title>Front Line Qualifiers</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu :close-on-content-click="false" offset-x left >
        <v-btn icon slot="activator">
          <v-icon>info</v-icon>
        </v-btn>
        <v-card class="pa-4">
          <span>This chart shows your team's progress toward qualification this month.</span>
        </v-card>
      </v-menu>
    </v-toolbar>
    <v-list style="padding: 0;">
      <v-list-item
        v-if="personal"
        class="progress"
        :style="calculateColor(1, personal)">
        <v-list-item-content>
          <v-list-item-title>{{personal.name}} (You)</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action >
          <v-list-item-title v-if="personal.totalPoints/60 < 1">{{ personal.totalPoints.toFixed(2) }}/60</v-list-item-title>
          <v-list-item-title v-else>Qualified</v-list-item-title>
        </v-list-item-action>
      </v-list-item>
      <div v-for="(item, index) in filteredLeaders" :key="`${item.contactEmail}-${index}`">
        <v-list-item
          :key="item.name"
          class="progress"
          :style="calculateColor(index+2, item)">
          <v-list-item-content>
            <v-list-item-title>{{item.name}}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-list-item-title v-if="isGrace(item.joinedOn)">Qualified</v-list-item-title>
            <v-list-item-title v-else-if="item.totalPoints/60 < 1">{{ item.totalPoints.toFixed(2) }}/60</v-list-item-title>
            <v-list-item-title v-else>Qualified</v-list-item-title>
          </v-list-item-action>
        </v-list-item>
      </div>
      <v-list-item
        v-if="filteredLeaders && filteredLeaders.length < 4 && leaders.length > 4"
        class="progress">
        <v-list-item-content>
          <v-list-item-title>You have {{leaders.length - filteredLeaders.length}} people in your front line with 0 points this month.</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <div v-if="leaders.length < 5"></div>
  </v-card>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'FrontlineQualifiers',
  data() {
    return {}
  },
  props: {
    leaders: Array,
    ranks: Object,
    personal: Object
  },
  methods: {
    calculateColor(rank, item) {
      let color = 'rgb(160, 206, 78, 0.1)'
      let percent = item.totalPoints / 60 * 100
      if (this.isGrace(item.joinedOn)) {
        percent = 100
      }
      if ((this.ranks[rank] && (item.totalPoints / 60 >= 1) && this.isQualified()) || this.isGrace(item.joinedOn)) {
        color = `#${this.ranks[rank].color}`
      }
      return `background-image: -webkit-linear-gradient(left, ${color} ${percent}%, #ffffff ${percent}%);`
    },
    isQualified() {
      return this.personal.totalPoints >= 60
    },
    isGrace(joinedOn) {
      return this.$moment(joinedOn).isSame(this.$moment(), 'Month')
    }
  },
  computed: {
    filteredLeaders() {
      const firstLevelQualifiers = this.leaders.filter(stats => {
        if (stats.totalAmount > 0 || this.isGrace(stats.joinedOn)) {
          return true
        }
        return false
      })
      return _.slice(_.orderBy(firstLevelQualifiers, 'totalAmount', 'desc'), 0, 4)
    }
  }
}
</script>

<style scoped>
</style>
