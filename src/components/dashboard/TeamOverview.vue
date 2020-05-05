<template>
  <div>
    <v-card id="team-overview">
      <v-toolbar color="secondary" dark>
        <v-toolbar-title>Team Overview</v-toolbar-title>
        <v-spacer></v-spacer>
        <PeriodSwitcher v-if="!loading"></PeriodSwitcher>
      </v-toolbar>
      <v-card-text style="height: 587px; overflow: auto; padding-top: 0px;">
        <template v-if="!loading && stats">
        <v-alert
          class="inner-alert"
          icon="mdi-calendar-check"
          text
          dense
          type="info"
          v-model="showBanner">
          You are currently viewing a past period.
        </v-alert>
          <v-timeline clipped dense>
            <v-timeline-item large color="#a1213b">
              <v-row class="pt-1">
                <v-col>
                  <strong>{{this.$tenantInfo.name}}</strong>
                </v-col>
                <v-col>
                  <strong>{{total}}</strong>
                  <div class="caption">Total {{this.$tenantInfo.distributorsLabel}}</div>
                </v-col>
              </v-row>
            </v-timeline-item>
            <v-timeline-item>
              <template v-slot:icon>
                <v-avatar>
                  <img :src="member.profileUrl">
                </v-avatar>
              </template>
              <v-row class="pt-1">
                <v-col>
                  <strong>Circle Of Influence</strong>
                </v-col>
                <v-col>
                  <strong>{{stats.downlineCount && stats.downlineCount.total}}</strong>
                  <div class="caption">Total {{ $tenantInfo.distributorsLabel }}</div>
                </v-col>
                <v-col>
                  <div>
                    <strong>{{stats.downlineCount && stats.downlineCount.qualified}}</strong>
                     <Trend v-if="showTrend" :previous="previous.downlineCount.qualified" :current="current.downlineCount.qualified"/>
                  </div>
                  <div class="caption">Active {{ $tenantInfo.distributorsLabel }}</div>
                </v-col>
              </v-row>
            </v-timeline-item>
            <v-timeline-item color="grey" small v-for="(value, key) in stats.levelCounts" :key="key">
              <v-row class="pt-1">
                <v-col>
                  <strong>Level {{key.replace('level', '')}}</strong>
                </v-col>
                <v-col>
                  <strong>{{value.total}}</strong>
                  <div class="caption">Total {{ $tenantInfo.distributorsLabel }}</div>
                </v-col>
                <v-col>
                  <div>
                    <strong>{{value.qualified}}</strong>
                    <Trend v-if="showTrend" :previous="previous.levelCounts[key].qualified" :current="current.levelCounts[key].qualified"/>
                  </div>
                  <div class="caption">Active {{ $tenantInfo.distributorsLabel }}</div>
                </v-col>
              </v-row>
            </v-timeline-item>
          </v-timeline>
        </template>
        <template v-else>
          <v-progress-circular indeterminate :size="30" :width="3" color="grey"></v-progress-circular>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash'
import Trend from '@/components/dashboard/Trend.vue'
import { mapGetters, mapState } from 'vuex'
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
export default {
  name: 'TeamOverview',
  components: {
    Trend,
    PeriodSwitcher
  },
  props: {
    stats: Object,
    total: Number,
    loading: Boolean
  },
  computed: {
    showBanner() {
      return !this.isSelectedCurrent
    },
    showTrend() {
      return _.get(this, '$tenantInfo.trends.teamOverview', true) &&
        this.isSelectedCurrent &&
        this.current &&
        this.previous
    },
    ...mapState({
      current: state => state.comp.currentPeriod,
      previous: state => state.comp.previousPeriod
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
