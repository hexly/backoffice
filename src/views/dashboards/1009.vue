<template>
  <div class="dashboard py-4">
    <v-subheader>General</v-subheader>
    <v-layout row>
      <v-flex xs12 md6 class="pa-4">
        <StatsCard title="Membership Info">
          <div>
            Member #: <strong>{{user.principal.member.mrn}}</strong>
          </div>
          <div>
            Member Type: <strong>{{memberType}}</strong>
          </div>
          <div>
            Member Since: <strong>{{$moment(user.principal.member.joinedOn).format('LL')}}</strong>
          </div>
        </StatsCard>
      </v-flex>
      <v-flex xs12 md6 class="pa-4">
        <StatsCard title="My Link">
          {{$tenantInfo.corporateUrl}}
          <!-- <MyLink /> -->
        </StatsCard>
      </v-flex>
    </v-layout>
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
      <!-- <v-flex xs12 md4 class="pa-4">
        <StatsCard title="Month-to-Date Sales by Affiliate Type">
          <section>
            <h6 class="name">Member</h6>
            <h3 class="stat">$459.93</h3>
          </section>
          <section>
            <h6 class="name">Affiliate</h6>
            <h3 class="stat">$5,986.32</h3>
          </section>
          <section>
            <h6 class="name">Certified Trainer</h6>
            <h3 class="stat">$27,979.99</h3>
          </section>
        </StatsCard>
      </v-flex> -->
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
import DashCard from '@/components/DashboardCard.vue'
import LeaderBoard from '@/components/Leaderboard.vue'
import FrontlineQualifiers from '@/components/FrontlineQualifiers.vue'
import CompPlanLevel from '@/components/CompPlanLevel.vue'
import MonthSelector from '@/components/MonthSelector.vue'
import StatsCard from '@/components/StatsCard.vue'
// import MyLink from '@/components/MyLink.vue'
import { GET_MEMBER_STATS } from '@/Sales/Api.js'
import { mapMutations, mapState, mapGetters } from 'vuex'
import { UserMutations } from '@/stores/UserStore'
import { Mutations } from '@/store'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'dashboard',
  components: {
    DashCard,
    MonthSelector,
    LeaderBoard,
    CompPlanLevel,
    FrontlineQualifiers,
    StatsCard
  },
  data() {
    return {
      salesGraphValues: [],
      yearToDate: 0,
      saleStats: {},
      salesByMonth: {},
      affiliateTags: ['subscription:level:member', 'subscription:level:affiliate', 'subscription:level:trainer', 'subscription:level:cornerstone'],
      tagTranslations: {
        'subscription:level:member': 'Member',
        'subscription:level:affiliate': 'Affiliate',
        'subscription:level:trainer': 'Affiliate Trainer',
        'subscription:level:cornerstone': 'Cornerstone Affiliate'
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
    }
  },
  methods: {
    ...mapMutations([UserMutations.MEMBER_QUERY, Mutations.SET_GATE, Mutations.SET_LOADING])
  },
  computed: {
    memberType() {
      let type = this.affiliateTags[0]
      this.user.principal.member.tags.forEach(t => {
        if (this.affiliateTags.indexOf(t) > -1) {
          type = t
        }
      })
      return this.tagTranslations[type]
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
    ...mapGetters(['contactId', 'memberId'])
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
