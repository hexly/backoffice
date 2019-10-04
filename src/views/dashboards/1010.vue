<template>
  <div class="full-wrapper dashboard">
    <v-layout row>
      <v-flex xs12 class="pa-2">
        <v-card>
          <v-card-title>
            <p class="headline">Welcome to your Luccii Influencer Hub!</p>
          </v-card-title>
          <v-card-text>
            <p class="subheading">
              We are currently operating incognito and are so excited you are with us.
              Please join our facebook group here: <a href="">Luccii Facebook Group</a>
            </p>
            <p class="subheading">
            Questions? Please email <a href="mailto:support@luccii.com">support@luccii.com</a>
            </p>
            - The Luccii Team
            <br/>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 md6 class="pa-2">
        <PersonalCard memberName="Your Influencer Number:">
          <Badges slot="footer" v-if="member.joinedOn" :joinedOn="member.joinedOn"/>
        </PersonalCard>
      </v-flex>
      <v-flex xs12 md6>
        <v-layout fill-height column justify-space-between>
          <v-flex class="pa-2">
            <DashCard
              color="white"
              darken="1"
              :display="memberCount[0].count"
              subheading="Total Influencers"
              icon="location_city"
              :loading="loadingCount > 0"
            />
          </v-flex>
          <v-flex class="pa-2">
            <DashCard
              color="white"
              darken="1"
              :display="personalStats.counts.total"
              subheading="Your Circle of Influence"
              icon="supervised_user_circle"
              :loading="loadingStats > 0"
            />
          </v-flex>
          <v-flex class="pa-2">
            <DashCard
              color="white"
              darken="1"
              :display="personalStats.counts.level1"
              subheading="Your Front-Line Size"
              icon="account_tree"
              :loading="loadingStats > 0"
            />
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
    <Directory class="pa-2" :self="personalStats" :frontline="team" title="Your Circle of Influence"/>
    <CompanyMap class="pa-2" title="Influencers around the world"/>
  </div>
</template>

<script>
import PersonalCard from '@/components/dashboard/PersonalCard.vue'
import Directory from '@/components/dashboard/Directory.vue'
import DashCard from '@/components/DashboardCard.vue'
import CompanyMap from '@/components/dashboard/CompanyMap.vue'
import Badges from '@/components/Badges.vue'

import { MEMBER_STATS_BY_DEPTH, MEMBER_TOTAL_COUNT } from '@/graphql/MemberStats.gql'
import { mapMutations, mapState, mapGetters } from 'vuex'
import { UserMutations } from '@/stores/UserStore'
import { Mutations } from '@/store'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'dashboard',
  components: {
    DashCard,
    PersonalCard,
    Directory,
    CompanyMap,
    Badges
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
      team: [],
      loadingStats: 0,
      loadingCount: 0
    }
  },
  async mounted() {

  },
  watch: {
    '$apollo.loading'(newVal) {
      this.setLoading(newVal)
    }
  },
  methods: {
    ...mapMutations([
      UserMutations.MEMBER_QUERY,
      Mutations.SET_GATE,
      Mutations.SET_LOADING
    ])
  },
  computed: {
    ...mapState({
      user: state => state.user
    }),
    ...mapGetters(['contactId', 'memberId', 'member'])
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
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding-bottom: 45px;
}
section {
  margin-top: 8px;
}

section .name {
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
