<template>
  <div class="comp-plan">
    <v-container
      fluid
      class="contain"
    >
      <v-layout
        row
        wrap
      >
        <v-flex xs3>
          <img
            class="image"
            :src="getAvatar"
          >
        </v-flex>
        <v-flex xs6>
          <h1>{{member.displayName}}</h1>
          <hr>
          <h3>Current Level: Ambassador</h3>
          <ul>
            <li>Qualified First Level: {{team.personal.qualified}}</li>
            <li>Total Personal Points: {{team.personal.totalPoints}}</li>
            <li>Total Personal Amount: {{team.personal.totalAmount}}</li>
            <li>
              <hr>
            </li>
            <li>Team Size: {{team.teamSize}}</li>
            <li>Total Team Points: {{team.totalTeamAmount}}</li>
          </ul>
        </v-flex>
        <v-spacer />
      </v-layout>
      <CompPlanLevel
        :level="team.firstLevel"
        levelName="One"
        :percent="calculatePercent(.1, 1)"
        notes="If you have 1 active* person in your first level you will receive 10% of your First Level Commissionable Points"
      />
      <CompPlanLevel
        :level="team.secondLevel"
        levelName="Two"
        :percent="calculatePercent(.05, 2)"
        notes="If you have 2 active* person in your first level you will receive 5% of your Fourth Level Commissionable Points"
      />
      <CompPlanLevel
        :level="team.thirdLevel"
        levelName="Three"
        :percent="calculatePercent(.05, 3)"
        notes="If you have 3 active* person in your first level you will receive 5% of your Third Level Commissionable Points"
      />
      <CompPlanLevel
        :level="team.fourthLevel"
        levelName="Fourth"
        :percent="calculatePercent(.1, 4)"
        notes="If you have 4 active* person in your first level you will receive 10% of your Fourth Level Commissionable Points"
      />
    </v-container>
  </div>
</template>

<script>
import CompPlanLevel from '@/components/CompPlanLevel.vue'
import GET_MEMBERS from '@/graphql/GetMembers.gql'
import TEAM_STATS_BY_LEVEL from '@/graphql/TeamStatsByLevel.gql'
import moment from 'moment'

export default {
  components: {
    CompPlanLevel
  },
  data: () => ({
    member: {},
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: moment()
      .startOf('month')
      .format('YYYY-MM-DD'),
    endDate: moment()
      .endOf('month')
      .format('YYYY-MM-DD'),
    team: {
      personal: {
        qualified: 0
      },
      firstLevel: {},
      secondLevel: {},
      thirdLevel: {},
      fourthLevel: {},
      teamSize: 0,
      totalTeamAmount: 0
    }
  }),
  apollo: {
    member: {
      query: GET_MEMBERS,
      variables () {
        return {
          input: {
            ids: [this.$store.state.user.principal.memberId]
          }
        }
      },
      update ({ members }) {
        const member = members.nodes[0]
        return member
      }
    },
    team: {
      query: TEAM_STATS_BY_LEVEL,
      variables () {
        return {
          teamInput: {
            memberId: this.$store.state.user.principal.memberId,
            tenantId: process.env.VUE_APP_TENANT_ID,
            startDate: this.startDate,
            endDate: this.endDate,
            month: this.month,
            year: this.year
          }
        }
      },
      update ({ TeamStatsByLevel }) {
        const totalTeamAmount =
          TeamStatsByLevel.personal.totalAmount +
          TeamStatsByLevel.firstLevel.totalAmount +
          TeamStatsByLevel.secondLevel.totalAmount +
          TeamStatsByLevel.thirdLevel.totalAmount +
          TeamStatsByLevel.fourthLevel.totalAmount

        const teamSize =
          TeamStatsByLevel.firstLevel.size +
          TeamStatsByLevel.secondLevel.size +
          TeamStatsByLevel.thirdLevel.size +
          TeamStatsByLevel.fourthLevel.size

        return { ...TeamStatsByLevel, totalTeamAmount, teamSize }
      }
    }
  },
  methods: {
    calculatePercent (percent, qualified) {
      if (this.team.personal.qualified >= qualified) {
        return percent
      }
      return 0
    }
  },
  computed: {
    getAvatar () {
      return (
        this.member.profileUrl || this.$tenantInfo.placeholder
      )
    }
  }
}
</script>

<style scoped>
.image {
  width: 100%;
  border-radius: 100%;
  border: 10px solid white;
}
.comp-plan .contain {
  max-width: 1400px;
}
ul li {
  list-style: none;
}
</style>
