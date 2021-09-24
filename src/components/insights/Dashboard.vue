<template>
  <div class="insights-dashboard">
    <v-progress-linear v-if="loading" :indeterminate="true" style="margin-top: -12px; margin-bottom: 10px;"/>
    <v-row wrap class="mx-2">
      <v-col cols="12" md="6">
        <v-card>
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Founding Influencer Tracker</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pa-1">
            <v-list three-line class="pa-0 insights-list" v-if="marketCounts.length > 0">
              <v-list-item class="pa-1 insights-row" v-for="market in marketCounts" :key="market.key">
                <v-list-item-content>
                  <v-list-item-title>{{market.name}} <Flag :name="market.key" /></v-list-item-title>
                  <v-progress-linear :value="(market.count/1000)*100" height="25" color="green">
                    <strong>{{market.count}} out of 1000</strong>
                  </v-progress-linear>
                  <v-list-item-action-text>First 1000 Influencers in {{market.name}} get a limited time "Founding Influencer" badge</v-list-item-action-text>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Team Insights</v-toolbar-title>
            <v-spacer></v-spacer>
            <PeriodSwitcher v-if="selectedPeriod"></PeriodSwitcher>
          </v-toolbar>
          <v-alert
            v-if="selectedPeriod.status === 'closed'"
            class="mb-0"
            icon="mdi-calendar-check"
            text
            dense
            type="info">
            You are currently viewing a past period
          </v-alert>
          <v-card-text class="pa-1">
            <v-list three-line class="pa-0 insights-list" v-if="betaInsights.length">
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
            <div v-else-if="!loading" class="text-center my-3">No Data</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Earned Rewards</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items class="mt-10">
              <v-select
                v-model="rewardsFilter"
                :items="couponStatuses"
                label="Filter By..."
                multiple
                clearable
              />
            </v-toolbar-items>
          </v-toolbar>
          <v-card-text class="pa-1 insights-card">
            <v-list three-line class="pa-0 insights-list" v-if="filteredCoupons.length">
              <v-list-item v-for="coupon in filteredCoupons" :key="coupon.code" class="pa-1 insights-row">
                <v-list-item-content>
                  <v-list-item-title>{{coupon.metadata.note}}</v-list-item-title>
                  <v-list-item-subtitle v-if="['REDEEMED', 'REVOKED'].indexOf(coupon.status) > -1">
                    <v-chip color="gray" label>
                        {{coupon.code.toUpperCase()}}
                      </v-chip>
                  </v-list-item-subtitle>
                  <v-list-item-subtitle v-else>
                    <template v-if="isTouchEnabled()">
                      <v-chip color="orange" label @click="copyToClipboard(coupon.code.toUpperCase())" >
                        {{coupon.code.toUpperCase()}}
                      </v-chip>
                      <br/>
                      <small>{{tooltipText.replace('Click', 'Tap Code')}}</small>
                    </template>
                    <v-tooltip v-else bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-chip
                          v-bind="attrs"
                          v-on="on"
                          color="orange"
                          label
                          @click="copyToClipboard(coupon.code.toUpperCase())"
                        >
                          {{coupon.code.toUpperCase()}}
                        </v-chip>
                      </template>
                      <span>{{tooltipText}}</span>
                    </v-tooltip>
                  </v-list-item-subtitle>
                  <div v-if="coupon && coupon.config && coupon.config.type === 'FIXED_CART_AMOUNT'">
                    <v-list-item-title class="mt-3">Discount Amount</v-list-item-title>
                    <v-list-item-subtitle v-for="price in getCouponPricingInfo(coupon.config.amounts)" :key="price.key">
                      <div v-if="price && !(typeof price.key === 'undefined') && !(typeof price.amount === 'undefined')">
                        <span class="font-weight-bold">{{price.key}}</span>: {{(price.amount / 100).toFixed(2)}}
                      </div>
                    </v-list-item-subtitle>
                  </div>
                </v-list-item-content>
                <v-list-item-action>
                  <v-list-item-action-text> <v-chip class="my-1" color="light-blue white--text" small>{{couponMapping[coupon.type]}}</v-chip> </v-list-item-action-text>
                  <v-list-item-action-text> <v-chip :color="['REDEEMED', 'REVOKED'].indexOf(coupon.status) > -1 ? 'red white--text' : 'green white--text'" small>{{couponMapping[coupon.status]}}</v-chip> </v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div v-else-if="!loading" class="text-center my-3">No Data</div>
          </v-card-text>
        </v-card>
      </v-col>
      <template v-if="collection.sections && collection.sections.length > 0">
        <v-col cols="12" md="6" v-for="(section, i) in collection.sections" :key="`${section.type}-${i}`">
          <template v-if="section.type === 'PANEL' && section.display">
            <InsightsPanel :data="section"/>
          </template>
        </v-col>
      </template>
    </v-row>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { INSIGHTS, INSIGHTS_COLLECTION } from '@/graphql/comp.gql'
import { COUPONS } from '@/graphql/Marketing.gql'
import { MARKET_COUNT } from '@/graphql/Member.gql'
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
import InsightsPanel from '@/components/insights/InsightsPanel.vue'
import Flag from '@/components/Flag.vue'
import * as _ from 'lodash'

export default {
  name: 'InsightsDashboard',
  components: {
    PeriodSwitcher,
    InsightsPanel,
    Flag
  },
  data () {
    return {
      loading: false,
      rewardsFilter: ['ISSUED'],
      tooltipText: 'Click To Copy',
      couponMapping: {
        FREE_PRODUCT: 'Free Product',
        FIXED_CART_AMOUNT: 'Discount',
        FIXED_CART_PERCENT: 'Percent Discount',
        FIXED_PRODUCT_AMOUNT: 'Product Discount',
        ISSUED: 'Available',
        REDEEMED: 'Redeemed',
        PARTIALLY_REDEEMED: 'Partially Redeemed',
        REVOKED: 'Revoked'
      },
      couponStatuses: [
        { value: 'ISSUED', text: 'Available' },
        { value: 'REDEEMED', text: 'Redeemed' }
      ],
      collection: {},
      // Temporary approach to coupons
      coupons: [],
      // Temporary approach to market counts
      marketCounts: [],
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
      },
      currencyMap: [
        'USD',
        'CAD',
        'GBP',
        'AUD',
        'NZD'
      ]
    }
  },
  computed: {
    ...mapGetters(['member', 'memberId']),
    ...mapState({
      selectedPeriod: state => state.comp.selectedPeriod
    }),
    filteredCoupons() {
      const { coupons, rewardsFilter } = this
      if (!coupons || _.isEmpty(coupons) || _.isEmpty(rewardsFilter)) {
        return coupons
      }

      const filteredCoupons = coupons.filter(el => rewardsFilter.indexOf(el.status) > -1)
      const sortedByDateCoupons = [...filteredCoupons].sort((a, b) => a.awardedDate > b.awardedDate)

      return sortedByDateCoupons
    }
  },
  methods: {
    // Just testing something here... should be global if we like it
    isTouchEnabled() {
      try { document.createEvent('TouchEvent'); return true } catch (e) { return false }
    },
    async copyToClipboard(code) {
      await this.$copyText(code)
      this.tooltipText = 'Copied!'
      setTimeout(() => {
        this.tooltipText = 'Click To Copy'
      }, 3000)
    },
    getCouponPricingInfo(amounts) {
      const supportedCurrencyIds = _.get(this, 'member.market.supportedCurrencyIds', [])
      const supportedMarkets = supportedCurrencyIds.map(el => this.currencyMap[el])
      const mappedPrices = supportedMarkets.map(el => { return { key: el, amount: _.get(amounts, el, 'N/A') } })

      return mappedPrices
    }
  },
  apollo: {
    collection: {
      query: INSIGHTS_COLLECTION,
      variables() {
        return {
          input: {
            memberId: this.member.id,
            date: this.$moment().format('YYYY-MM-DD'),
            key: 'backoffice_insights'
          }
        }
      },
      update({ comp: { insightCollection } }) {
        return insightCollection
      },
      client: 'federated',
      loadingKey: 'loadingInsightsCollection',
      watchLoading(isLoading) {
        this.loading = isLoading
      }
    },
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
      loadingKey: 'loadingInsights',
      watchLoading(isLoading) {
        this.loading = isLoading
      }
    },
    coupons: {
      query: COUPONS,
      variables() {
        return {
          input: {
            memberId: this.member.id
          }
        }
      },
      update(data) {
        const couponSearch = _.get(data, 'marketing.couponSearch', [])
        return couponSearch
      },
      client: 'federated',
      loadingKey: 'loadingCoupons',
      watchLoading(isLoading) {
        this.loading = isLoading
      }
    },
    marketCounts: {
      query: MARKET_COUNT,
      variables: {
        minThreshold: 0,
        maxThreshold: 1000
      },
      update({ membership: { marketThresholdCount } }) {
        return marketThresholdCount
      },
      client: 'federated',
      watchLoading(isLoading) {
        this.loading = isLoading
      }
    }
  },
  mounted () {}
}
</script>

<style scoped>
.insights-card {
  max-height: 400px;
  overflow: auto;
}
.insights-row:nth-child(odd){
  background-color: #cecece;
}
.inner-alert {
  margin: -15px -16px 6px -16px;
}
.insights-list {
  margin: -4px;
}
.loading-bar-col {
  position: absolute;
  top: -3px;
}
</style>
