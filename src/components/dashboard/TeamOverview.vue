<template>
  <div>
    <v-card id="team-overview">
      <v-toolbar color="secondary" dark>
        <v-toolbar-title>Team Overview</v-toolbar-title>
        <v-spacer></v-spacer>
        <PeriodSwitcher v-if="!loading"></PeriodSwitcher>
      </v-toolbar>
      <v-card-text>
        <v-slide-x-transition group hide-on-leave>
          <div key="1" v-if="!loading">
            <v-alert
              class="inner-alert"
              icon="mdi-calendar-check"
              text
              dense
              type="info"
              v-model="showBanner">
              You are currently viewing a past period.
            </v-alert>
                <v-row wrap justify="center" class="pt-1">
              <v-col cols="6">
                <div class="caption text-center">Total {{$tenantInfo.distributorsLabel}}</div>
              </v-col>
              <v-col cols="6" class="text-center">
                <strong>{{total}}</strong>
              </v-col>
            </v-row>
            <div class="text-center mb-8">
              <v-btn small color="secondary white--text" @click="showTeam()" v-if="!($route.hash === '#search')">View Team</v-btn>
            </div>
            <TeamDetails :compStats="stats"/>
          </div>
          <div key="2" v-else-if="loading">
            <v-layout justify-center row wrap>
              <v-flex xs1>
                <v-progress-circular indeterminate :size="30" :width="3" color="grey"></v-progress-circular>
              </v-flex>
            </v-layout>
          </div>
        </v-slide-x-transition>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import Trend from '@/components/dashboard/Trend.vue'
import { mapGetters, mapState } from 'vuex'
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
import TeamDetails from '@/components/TeamDetails.vue'
export default {
  name: 'TeamOverview',
  components: {
    Trend,
    PeriodSwitcher,
    TeamDetails
  },
  props: {
    stats: Object,
    total: Number,
    loading: Boolean
  },
  data() {
    return {
      info: {},
      currentId: undefined,
      lineage: [],
      activeTab: null
    }
  },
  mounted () {
    this.currentId = this.member.memberId || this.member.id
    this.lineage.push({ memberId: this.currentId, displayName: this.member.displayName })
  },
  methods: {
    getPrevious(key) {
      if (this.previous.levelCounts[key]) {
        return this.previous.levelCounts[key].qualified
      }
      return 0
    },
    showTeam () {
      this.$router.push('team')
    },
    tabActivated (tab) {
      this.activeTab = tab
    }
  },
  computed: {
    showBanner() {
      return !this.isSelectedCurrent
    },
    showTrend() {
      return this.isSelectedCurrent &&
        this.current &&
        this.previous
    },
    ...mapState({
      current: state => state.comp && state.comp.currentPeriod,
      previous: state => state.comp && state.comp.previousPeriod,
      selectedPeriod: state => state.comp && state.comp.selectedPeriod
    }),
    ...mapGetters(['member', 'isSelectedCurrent'])
  }
}
</script>

<style scoped>
.inner-alert{
  margin-left: -15px;
  margin-right: -15px;
}
</style>
