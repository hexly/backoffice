<template>
  <div>
    <template v-if="showStatsMaintenance">
      <v-card-text>
        <v-alert class="inner-alert" icon="mdi-calendar-check" text dense type="info">
          {{
            selectedPeriod.metadata.engineMaintenanceMessage
            ||
            'Our system is currently undergoing maintenance. We will be back up shortly'
          }}
        </v-alert>
        <div class="title text-center">Realtime Stats Temporarily Unavailable</div>
      </v-card-text>
    </template>
    <template v-else>
      <div>
        <v-layout justify-center row wrap class="text-center" v-if="compStats">
          <v-flex v-if="compStats.metadata.counts.allTime >= 0">
            <v-chip label small color="red lighten-5">{{compStats.metadata.counts.allTime + 1}}</v-chip>
            <br />
            Total Team
          </v-flex>
          <v-flex>
            <v-chip label small color="red lighten-5">{{compStats.metadata.counts.downline}}</v-chip>
            <br />
            Active Team
          </v-flex>
          <v-flex>
            <v-chip label small color="red lighten-5">{{compStats.metadata.counts.group}}</v-chip>
            <br />
            Group
          </v-flex>
          <v-flex>
            <v-chip label small color="red lighten-5">{{compStats.metadata.counts.qualified}}</v-chip>
            <br />
            Qualified
          </v-flex>
        </v-layout>
        <v-layout justify-center row wrap class="text-center" v-else>
          <v-flex xs4>
            No Data Found
          </v-flex>
        </v-layout>
        <template v-if="compStats && compStats.metadata.counts.levels && compStats.metadata.counts.levels.length">
          <hr class="my-3" />
          <div class="text-center">Qualified Per level</div>
          <v-layout row wrap class="text-center">
            <v-flex xs4 class="my-1" v-for="level in compStats.metadata.counts.levels" :key="level.level">
              <b>Level {{level.level}}</b>
              <br />
              <v-chip label x-small color="teal lighten-5">{{level.qualified}} / {{level.total}}</v-chip>
            </v-flex>
          </v-layout>
        </template>
        <template v-if="compStats && !isEmpty(compStats.metadata.counts.ranks)">
          <hr class="my-3" />
          <div class="text-center">Per Rank Total</div>
          <v-layout row wrap class="text-center">
            <v-flex xs3 class="my-1"
              v-for="(total, rank) in filterRanks(compStats.metadata.counts.ranks)"
              :key="`${total}-${rank}`">
              <b>Rank {{rank}}</b>
              <br />
              <v-chip label x-small color="deep-purple lighten-5">{{total}}</v-chip>
            </v-flex>
          </v-layout>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import { omit, isEmpty, intersection } from 'lodash'

import { mapState, mapGetters } from 'vuex'
export default {
  name: 'TeamDetails',
  data () {
    return {
      isEmpty
    }
  },
  props: {
    compStats: Object
  },
  methods: {
    filterRanks (ranks) {
      return omit(ranks, ['0'])
    },
    formatDate (value) {
      return this.$moment(value, 'YYYY-MM-DD').from(this.$moment())
    }
  },
  computed: {
    ...mapGetters(['member']),
    ...mapState({
      user: state => state.user,
      selectedPeriod: state => state.comp.selectedPeriod
    }),
    showStatsMaintenance() {
      const maintenanceIsOn = this.selectedPeriod.metadata.engineMaintenance
      const isImpersonationAllowed = this.selectedPeriod.metadata.allowImpersonation && this.user.isImpersonating
      const hasAllowedTags = intersection(this.selectedPeriod.metadata.allowTags, this.member.tags)
      const canSkip = isImpersonationAllowed || hasAllowedTags.length > 0
      return (maintenanceIsOn && !canSkip)
    }
  },
  mounted () {}
}
</script>

<style scoped>
.team-card {
  margin-left: auto;
  margin-right: auto;
}
.cardImg {
  margin: auto;
  max-height: 200px;
  max-width: 100%;
}
.dense {
  font-size: 13.5px;
  min-width: 43px;
}
.badge-card {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  min-height: 215px;
  align-items: center;
}
.badge {
  max-width: 29px;
  transition: ease-out 350ms;
}
.badge .v-avatar {
  height: 29px !important;
  min-width: 29px !important;
  width: 29px !important;
}
.badge-hover {
  max-width: 100%;
  transition: ease-in 250ms;
}
.expand-enter-active {
  transition: opacity ease-out 350ms;
}
.expand-enter, .expand-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.expand-leave-active {
  transition: ease-out 350ms;
}
.item-container-card {
  min-height: 215px;
  display: flex;
  flex-direction: column;
  font-size: 12px;
}
.generation-container {
  flex-direction: column;
  display: flex;
  align-items: center;
}
.generation-badge-container {
  max-width: 200px;
  justify-content: center;
  position: relative;
  left: -24px;
}
.generation-avatar {
  transform: scale(0.5);
  z-index: unset;
  transition: 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
  margin-right: -40px !important;
}
.generation-avatar:hover {
  transform: scale(1) translateY(-5px);
  z-index: 1;
  transition: 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
}
.get-rank-btn {
  align-self: center;
}
</style>
