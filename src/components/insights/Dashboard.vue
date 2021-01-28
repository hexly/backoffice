<template>
  <div class="insights-dashboard mx-4">
    <v-row wrap>
       <v-col cols="12" md="6">
        <v-card>
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Team Insights</v-toolbar-title>
            <v-spacer></v-spacer>
            <PeriodSwitcher v-if="selectedPeriod"></PeriodSwitcher>
          </v-toolbar>
          <v-card-text class="pa-1">
            <v-alert
              v-if="selectedPeriod.status === 'closed'"
              class="inner-alert"
              icon="mdi-calendar-check"
              text
              dense
              type="info">
              You are currently viewing a past period
            </v-alert>
            <v-list three-line class="pa-0 insights-list">
              <v-list-item v-for="insight in betaInsights" :key="insight.key" class="pa-1 insights-row">
                <v-list-item-avatar>
                  <v-icon large color="light-blue">{{insightInfo[insight.key].icon}}</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{insight.labels.header}}</v-list-item-title>
                  <v-list-item-subtitle>{{insight.labels.tagline}}</v-list-item-subtitle>
                  <small v-if="insightInfo[insight.key].desc">{{insightInfo[insight.key].desc}}</small>
                </v-list-item-content>
                <v-list-item-action>
                  <v-list-item-action-text>{{insight.values.formatted}}</v-list-item-action-text>
                  <v-list-item-action-text>{{insight.values.tagline}}</v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <!-- <v-row class="pa-0 insights-row" v-for="insight in betaInsights" :key="insight.key">
              <v-col cols="1">
                <v-icon large color="light-blue">{{insightInfo[insight.key].icon}}</v-icon>
              </v-col>
              <v-col cols="7">
                <h3>{{insight.labels.header}}</h3>
                <h5>{{insight.labels.tagline}}</h5>
                <small v-if="insightInfo[insight.key].desc">{{insightInfo[insight.key].desc}}</small>
              </v-col>
              <v-col cols="4" class="text-right body-1">
                <strong>{{insight.values.formatted}}</strong>
                <br/>
                <small>{{insight.values.tagline}}</small>
              </v-col>
            </v-row> -->
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" v-for="(insight, i) in insights" :key="i">
        <v-card>
          <v-card-title class="secondary white--text headline">
            {{insight.title}}
          </v-card-title>
          <v-card-text class="pa-1">
            <p v-if="insight.subTitle">{{insight.subTitle}}</p>
            <v-list three-line class="pa-0 insights-list">
              <v-list-item v-for="(component , i) in insight.components" :key="i" class="pa-1 insights-row">
                <template v-if="component.type === 'progress'">
                  <v-list-item-content>
                    <v-list-item-title>{{component.labels.header}}</v-list-item-title>
                    <v-list-item-subtitle>{{component.labels.tagline}}</v-list-item-subtitle>
                    <v-progress-linear color="green" height="25" :value="(component.values.value/component.values.total)*100">
                        <template v-slot:default="">
                          <strong>{{component.values.formatted}}</strong>
                        </template>
                      </v-progress-linear>
                  </v-list-item-content>
                </template>
                <template v-if="component.type === 'member'">
                  <v-list-item-avatar>
                    <v-img v-if="component.labels.avatar" :src="component.labels.avatar"></v-img>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{component.labels.header}}</v-list-item-title>
                    <v-list-item-subtitle>{{component.labels.tagline}}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-list-item-action-text>
                      <v-chip color="red">{{component.values.formatted}}</v-chip>
                    </v-list-item-action-text>
                    <v-list-item-action-text>{{component.values.value}}</v-list-item-action-text>
                  </v-list-item-action>
                </template>
                <template v-if="component.type === 'stat'">
                  <v-list-item-avatar>
                    <v-icon v-if="component.labels.icon">{{component.labels.icon}}</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{component.labels.header}}</v-list-item-title>
                    <v-list-item-subtitle>{{component.labels.tagline}}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-list-item-action-text> {{component.values.formatted}} </v-list-item-action-text>
                    <v-list-item-action-text>{{component.values.value}}</v-list-item-action-text>
                  </v-list-item-action>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { INSIGHTS } from '@/graphql/comp.gql'
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'

export default {
  name: 'InsightsDashboard',
  components: {
    PeriodSwitcher
  },
  data () {
    return {
      insights: [
        {
          title: 'Success Start Sales Tracker',
          subTitle: '',
          components: [
            {
              type: 'progress',
              labels: {
                header: 'Daily Progress',
                tagline: 'You are within the first 40 days of being an influencer. We have some exciting opportunties for you!'
              },
              values: {
                formatted: 'Day 23 Of 40',
                value: 23,
                total: 40
              }
            },
            {
              type: 'progress',
              labels: {
                header: 'Sales Goal #1',
                tagline: 'Sell 100 PSV and receive an exclusive I AM Everra LUX lash'
              },
              values: {
                formatted: '75 PSV out of 100 PSV',
                value: 75,
                total: 100
              }
            },
            {
              type: 'progress',
              labels: {
                header: 'Sales Goal #2',
                tagline: 'Sell 200 PSV and receive an $35 product credit'
              },
              values: {
                formatted: '75 PSV out of 200 PSV',
                value: 75,
                total: 200
              }
            }
          ]
        },
        {
          title: 'Success Start Team Tracker',
          subTitle: 'You\'ve helped 3 influencers join Everra and 1 has become active! You\'ve earned $25 product credit',
          components: [
            {
              type: 'member',
              labels: {
                avatar: 'https://platform.hexly.cloud/assets/1010/12947',
                header: 'Person 1',
                tagline: 'Joined: Jan 2, 2020'
              },
              values: {
                formatted: 'Active',
                value: '200 PSV'
              }
            },
            {
              type: 'member',
              labels: {
                avatar: 'https://platform.hexly.cloud/assets/1010/12948',
                header: 'Person 2',
                tagline: 'Joined: Jan 5, 2020'
              },
              values: {
                formatted: 'Inctive',
                value: '50 PSV'
              }
            },
            {
              type: 'member',
              labels: {
                avatar: 'https://platform.hexly.cloud/assets/1010/15531',
                header: 'Person 3',
                tagline: 'Joined: Jan 8, 2020'
              },
              values: {
                formatted: 'Inctive',
                value: '0 PSV'
              }
            }
          ]
        },
        {
          title: 'Success Start Rewards',
          subTitle: '',
          components: [
            {
              type: 'stat',
              labels: {
                icon: 'mdi-cash-usd-outline',
                header: '$35 Coupon',
                tagline: 'HDNDS2SH'
              },
              values: {
                formatted: 'Sales Goal #1 Reward',
                value: 'Coupon Code'
              }
            },
            {
              type: 'stat',
              labels: {
                icon: 'mdi-cash-usd-outline',
                header: '$45 Coupon',
                tagline: 'HNDF8KD'
              },
              values: {
                formatted: 'Sales Goal #2 Reward',
                value: 'Coupon Code'
              }
            }
          ]
        }
      ],
      betaInsights: [],
      insightInfo: {
        top_seller: {
          icon: 'mdi-package-variant-closed',
          desc: 'Team member who sold the most orders'
        },
        top_gsv_contributor: {
          icon: 'mdi-account-multiple-plus-outline',
          desc: 'Team member who contributed the most to your GSV'
        },
        top_immediate: {
          icon: 'mdi-cash-usd-outline',
          desc: 'Team member who contributed the most to your immediate payouts'
        }
      }
    }
  },
  computed: {
    ...mapGetters(['member', 'memberId']),
    ...mapState({
      selectedPeriod: state => state.comp.selectedPeriod
    })
  },
  methods: {},
  apollo: {
    betaInsights: {
      query: INSIGHTS,
      variables() {
        return {
          input: {
            memberId: this.member.id,
            tenantId: this.$tenantInfo.id,
            periodId: this.selectedPeriod.id
          }
        }
      },
      update({ comp: { insights } }) {
        return insights.insights.filter(i => !!i.values.formatted)
      },
      skip() {
        return !this.selectedPeriod.id
      },
      client: 'federated',
      loadingKey: 'loadingInsights'
    }
  },
  mounted () {}
}
</script>

<style scoped>
.insights-row:nth-child(odd){
  background-color: #cecece;
}
.inner-alert {
  margin: -15px -16px 6px -16px;
}
.insights-list {
  margin: -4px;
}
</style>
