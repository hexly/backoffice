<template>
  <div class="dashboard py-4">
    <v-subheader>Membership</v-subheader>
    <v-layout row justify-center>
      <v-flex xs12 md6>
        <PersonalCard class="pa-4" memberName="Affiliate" :showMrn="false">
          <div slot="footer" class="text-xs-center">
            <p class="headline">Badges</p>
            <BirthdayBadge :joinedOn="member.joinedOn" />
            <v-chip v-if="subscriptionLevel" color="secondary" text-color="white">
              <v-avatar class="secondary darken-4">
                <v-icon>star</v-icon>
              </v-avatar>
              {{subscriptionLevel}}
            </v-chip>
          </div>
        </PersonalCard>
      </v-flex>
      <v-flex xs12 md6>
        <v-layout fill-height column justify-space-between>
          <v-flex class="pt-4 pb-4 px-4">
            <DashCard
              color="white"
              darken="1"
              :display="memberCount[0].count"
              subheading="Total Affiliates and Trainers"
              icon="location_city"
              :loading="loadingCount > 0"
            />
          </v-flex>
          <v-flex class="pt-2 pb-4 px-4">
            <DashCard
              color="white"
              darken="1"
              :display="personalStats.counts.total - 1"
              subheading="Your Entire Team"
              icon="account_tree"
              :loading="loadingStats > 0"
            />
          </v-flex>
          <v-flex class="pt-2 pb-4 px-4">
            <DashCard
              color="white"
              darken="1"
              :display="personalStats.counts.level1"
              subheading="Your Front-Line"
              icon="supervised_user_circle"
              :loading="loadingStats > 0"
            />
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
    <Directory class="pa-2" :self="personalStats" :frontline="team" title="My Team" :badges="false" membersTypeName="Affiliate"/>
    <v-subheader>Statistics</v-subheader>
    <v-layout row wrap justify-space-between fill-height>
      <v-flex xs12 md4 class="pa-4">
        <v-layout align-stretch justify-space-between column fill-height>
          <v-flex xs6 class="mb-3">
            <StatsCard :trend="getMonthlySalesTrend" title="Month-to-Date Sales" :amount="currentMonthAmount"/>
          </v-flex>
          <v-flex xs6>
            <StatsCard title="Last Month Sales" :amount="lastMonthAmount"/>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs12 md4 class="pa-4">
        <StatsCard title="Month-to-Date Sales by Affiliate Type">
          <section>
            <h6 class="name">Member</h6>
            <h3 class="stat">
              <Currency :amount="salesByProduct.member" />
            </h3>
          </section>
          <section>
            <h6 class="name">Affiliate</h6>
            <h3 class="stat">
              <Currency :amount="salesByProduct.affiliate" />
            </h3>
          </section>
          <section>
            <h6 class="name">Certified Trainer</h6>
            <h3 class="stat">
              <Currency :amount="salesByProduct.trainer" />
            </h3>
          </section>
        </StatsCard>
      </v-flex>
      <v-flex xs12 md4 class="pa-4">
        <StatsCard title="Year-to-Date Sales" :amount="yearToDate">
          <div class="sparks">
            <v-sparkline
              :value="salesGraphValues"
              color="#2da3f2"
              type="bar"
              line-width="25"
              padding="20"
              height="165"
              width="400"
              auto-draw
            ></v-sparkline>
          </div>
        </StatsCard>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import _ from 'lodash'
import BirthdayBadge from '@/components/BirthdayBadge.vue'
import PersonalCard from '@/components/dashboard/PersonalCard.vue'
import Directory from '@/components/dashboard/Directory.vue'
import StatsCard from '@/components/StatsCard.vue'
import DashCard from '@/components/DashboardCard.vue'
import Currency from '@/components/Currency.vue'
import { GET_MEMBER_STATS, SALES_BY_PRODUCT_QUERY } from '@/Sales/Api.js'
import { MEMBER_STATS_BY_DEPTH, MEMBER_TOTAL_COUNT } from '@/graphql/MemberStats.gql'
import { mapMutations, mapState, mapGetters } from 'vuex'
import { UserMutations } from '@/stores/UserStore'
import { Mutations } from '@/store'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'dashboard',
  components: {
    PersonalCard,
    StatsCard,
    Currency,
    BirthdayBadge,
    DashCard,
    Directory
  },
  data() {
    return {
      personalStats: {
        counts: {
          total: 0,
          level1: 0
        }
      },
      memberCount: [{
        count: 0
      }],
      loadingStats: 0,
      loadingCount: 0,
      salesGraphValues: [],
      yearToDate: 0,
      saleStats: {},
      salesByMonth: {},
      salesByProduct: {},
      levelMap: {
        200: 'Affiliate',
        300: 'Trainer'
      }
    }
  },
  async mounted() {
  },
  watch: {
    '$apollo.loading'(newVal) {
      this.setLoading(newVal)
    }
  },
  apollo: {
    team: {
      query: MEMBER_STATS_BY_DEPTH,
      variables () {
        return {
          input: {
            relativeDepthIn: [1],
            targetId: this.$store.state.user.principal.memberId
          }
        }
      },
      loadingKey: 'loadingStats',
      update ({ getTeamDataByDepth }) {
        // Frist one is always personal stats
        const [personal, ...rest] = getTeamDataByDepth
        this.personalStats = personal
        return rest
      }
    },
    memberCount: {
      query: MEMBER_TOTAL_COUNT,
      variables: {
        input: {
          tenantId
        }
      },
      loadingKey: 'loadingCount'
    },
    saleStats: {
      query: GET_MEMBER_STATS,
      variables() {
        return {
          input: {
            memberIds: [this.memberId],
            startDate: this.$moment().startOf('year').format('YYYY-MM-DD'),
            endDate: this.$moment().endOf('year').format('YYYY-MM-DD'),
            mode: 'YEAR_AND_MONTH_CUBED'
          }
        }
      },
      update({ saleStatsByDateRange }) {
        this.salesGraphValues = []
        this.salesByMonth = {}
        saleStatsByDateRange[0].stats.forEach(s => {
          if (s.mode === 'YEAR_AND_MONTH') {
            this.salesGraphValues.push(s.totalAmount)
            this.salesByMonth[s.month] = s
          } else if (s.mode === 'TOTAL') {
            this.yearToDate = s.totalAmount
          }
        })
        return saleStatsByDateRange[0].stats
      }
    },
    salesByProduct: {
      query: SALES_BY_PRODUCT_QUERY,
      variables() {
        return {
          input: {
            sellerId: this.memberId,
            depths: [0],
            startDate: this.$moment().startOf('year').format('YYYY-MM-DD'),
            endDate: this.$moment().endOf('year').format('YYYY-MM-DD'),
            productVariationOidPairs: ['17|604', '17|605', '17|606']
          }
        }
      },
      update({ salesByProductVariant }) {
        const salesByProduct = {
          member: 0,
          affiliate: 0,
          trainer: 0
        }
        salesByProductVariant.forEach(p => {
          if (p.productOid === '17' && p.variantOid === '604') {
            salesByProduct.member += p.subtotal
          }
          if (p.productOid === '17' && p.variantOid === '605') {
            salesByProduct.affiliate += p.subtotal
          }
          if (p.productOid === '17' && p.variantOid === '606') {
            salesByProduct.trainer += p.subtotal
          }
        })
        return salesByProduct
      }
    }
  },
  methods: {
    ...mapMutations([UserMutations.MEMBER_QUERY, Mutations.SET_GATE, Mutations.SET_LOADING])
  },
  computed: {
    subscriptionLevel() {
      const level = _.get(this.subscriptions, ['0', 'metadata', 'HexlyCommerceSubscriptionLevel', '0'], 200)
      return this.levelMap[level]
    },
    currentMonthAmount() {
      const currentMonth = new Date().getMonth() + 1
      return this.salesByMonth[currentMonth] && this.salesByMonth[currentMonth].totalAmount
    },
    lastMonthAmount() {
      const currentMonth = new Date().getMonth()
      return this.salesByMonth[currentMonth] && this.salesByMonth[currentMonth].totalAmount
    },
    getMonthlySalesTrend() {
      return this.currentMonthAmount - this.lastMonthAmount
    },
    ...mapState({
      user: state => state.user
    }),
    ...mapGetters(['contactId', 'memberId', 'subscriptions', 'member'])
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1440px;
  margin: auto;
  padding: 0 25px;
}

@media only screen and (max-width: 959px){
  .dashboard {
    padding: 0;
  }
}

section {
  margin-top: 8px;
}

section .name{
  font-size: 12px;
  color: #666666;
  font-weight: normal;
  text-transform: uppercase;
}

section .stat {
  font-size: 24px;
  color: #000000;
  font-weight: normal;
}

</style>
