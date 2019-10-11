<template>
  <div class="full-wrapper dashboard">
    <v-layout row>
      <v-flex xs12 class="pa-2">
        <v-card>
          <v-card-title>
            <p class="headline">Welcome to your Early Access Beauty Influencer Hub!</p>
          </v-card-title>
          <v-card-text>
            <p class="subheading">
              Please also join our exclusive Early Access Beauty Facebook Group
              where we can meet you and discuss what the future holds:
              <a :href="$tenantInfo.social[0].url">Early Access Beauty Facebook Group</a>
            </p>
            <p v-if="!slug" class="subheading">
              Please also set your Personal Link (below). After setting your Personal Link,
              feel free to share it with anyone else (located in either the U.K. or the U.S.)
              that may also be interested in joining this venture!
            </p>
            <p class="subheading">
            Questions? Please email <a href="mailto:support@earlyaccessbeauty.com">support@earlyaccessbeauty.com</a>
            </p>
            Best,
            <br/>
            Your Early Access Beauty Team
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
              :display="memberCount"
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

import { MEMBER_STATS_BY_DEPTH, MAX_MRN } from '@/graphql/MemberStats.gql'
import { mapMutations, mapState, mapGetters } from 'vuex'
import { UserMutations } from '@/stores/UserStore'
import { Mutations } from '@/store'

// const tenantId = ~~process.env.VUE_APP_TENANT_ID

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
      memberCount: 0,
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
    ...mapGetters(['contactId', 'memberId', 'member', 'slug'])
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
      query: MAX_MRN,
      variables: {
        input: {
          typeId: null
        }
      },
      loadingKey: 'loadingCount',
      update({ memberGetMaxMrnForTenant }) {
        return memberGetMaxMrnForTenant
      }
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
