<template>
  <div>
    <v-card id="team-overview">
      <v-toolbar color="secondary" dark>
        <v-toolbar-title>Team Overview</v-toolbar-title>
        <v-spacer></v-spacer>
        <PeriodSwitcher v-if="!loading"></PeriodSwitcher>
      </v-toolbar>
      <v-card-text style="height: 587px; overflow: auto; padding: 0 5px 0 0;">
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
          <v-timeline clipped dense align-top style="margin-left: -15px;">
            <v-timeline-item hide-dot class="pb-0">
              <v-row class="pt-1">
                <v-col></v-col>
                <v-col>
                  <div class="caption text-center">Total {{$tenantInfo.distributorsLabel}}</div>
                </v-col>
                <v-col>
                  <div class="caption  text-center">Active {{$tenantInfo.distributorsLabel}}</div>
                </v-col>
              </v-row>
            </v-timeline-item>
            <v-timeline-item large :color="$tenantInfo.primaryColor">
              <v-row class="pt-1">
                <v-col class="pa-1">
                  <strong>{{$tenantInfo.name}}</strong>
                </v-col>
                <v-col class="text-center">
                  <strong>{{total}}</strong>
                </v-col>
                <v-col></v-col>
              </v-row>
            </v-timeline-item>
            <v-timeline-item class="pb-1">
              <template v-slot:icon>
                <v-avatar>
                  <img :src="member.profileUrl">
                </v-avatar>
              </template>
              <v-row class="pt-1">
                <v-col class="pa-1">
                  <strong>Circle Of Influence</strong>
                </v-col>
                <v-col class="text-center">
                  <strong v-if="selectedPeriod.metadata && selectedPeriod.metadata.version === 2">{{stats.metadata.counts.downline}}</strong>
                  <strong v-else>{{stats.downlineCount && stats.downlineCount.total}}</strong>
                </v-col>
                <v-col class="text-center">
                  <div>
                    <strong v-if="selectedPeriod.metadata && selectedPeriod.metadata.version === 2">{{stats.metadata.counts.qualified}}</strong>
                    <strong v-else>{{stats.downlineCount && stats.downlineCount.qualified}}</strong>
                  </div>
                  <Trend v-if="showTrend" :previous="previous.downlineCount.qualified" :current="current.downlineCount.qualified"/>
                </v-col>
              </v-row>
            </v-timeline-item>
            <template v-if="selectedPeriod.metadata && selectedPeriod.metadata.version === 2">
              <v-timeline-item color="grey" small v-for="value in stats.metadata.counts.levels" :key="value.level" class="pb-1">
                <v-row class="pt-1">
                  <v-col class="pa-1">
                    <strong>Level {{value.level}}</strong>
                  </v-col>
                  <v-col class="text-center">
                    <strong>{{value.total}}</strong>
                  </v-col>
                  <v-col class="text-center">
                    <div>
                      <strong>{{value.qualified}}</strong>
                    </div>
                  </v-col>
                </v-row>
              </v-timeline-item>
            </template>
            <template v-else>
            <v-timeline-item color="grey" small v-for="(value, key) in stats.levelCounts" :key="key" class="pb-1">
              <v-row class="pt-1">
                <v-col class="pa-1">
                  <strong>Level {{key.replace('level', '')}}</strong>
                </v-col>
                <v-col class="text-center">
                  <strong>{{value.total}}</strong>
                </v-col>
                <v-col class="text-center">
                  <div>
                    <strong>{{value.qualified}}</strong>
                  </div>
                  <Trend v-if="showTrend" :previous="getPrevious(key)" :current="current.levelCounts[key].qualified"/>
                </v-col>
              </v-row>
            </v-timeline-item>
            </template>
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
  data() {
    return {
      info: {}
    }
  },
  methods: {
    getPrevious(key) {
      if (this.previous.levelCounts[key]) {
        return this.previous.levelCounts[key].qualified
      }
      return 0
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
      current: state => state.comp.currentPeriod,
      previous: state => state.comp.previousPeriod,
      selectedPeriod: state => state.comp.selectedPeriod
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
