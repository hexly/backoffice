<template>
  <v-flex class="pa-2 power-of-3">
    <v-card>
      <v-card-text>
        <span class="headline">The Power of 3 Event</span>
        <br/>
        <small>(Thanksgiving, Black Friday & Cyber Monday and price drop to $5/£4 registration fee)</small>
        <v-divider class="my-3"/>
        <h4>Time Period:</h4>
        <p>Tuesday (Nov 26) – Monday (Dec 2) at midnight PT.</p>
        <h4>Qualifying Achievement:</h4>
        <p>Sponsor 3 Influencers during the Time Period.</p>
        <h4>Incentives:</h4>
        <ol>
          <li>Every time you complete a Qualifying Achievement, you receive a $10/£8 Product Voucher for when we sell product.</li>
          <li>Every time your 1st Line completes a Qualifying Achievement, you earn 3 entries into a draw to become 1 of 10 product testers.</li>
          <li>Every time your 2nd Line completes a Qualifying Achievement, you earn 1 entry into a draw to become 1 of 10 product testers.</li>
        </ol>
        <h4>Bonus:</h4>
        <p>The influencer with the most entries in the drawing will win a Product Testing Day in the city of their choice with either Chris or Claire-Louise or both!</p>
        <v-divider class="my-3"/>
        <v-layout row justify-centerc class="scoreboard">
          <v-flex xs12>
            <v-list subheader three-line>
              <v-list-tile avatar >
                <v-list-tile-avatar color="black">
                  <span v-if="loading === 0" class="white--text headline">{{info.personal}}</span>
                  <v-progress-circular v-else indeterminate :size="30" :width="3" color="white"></v-progress-circular>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>Personally Sponsored</v-list-tile-title>
                  <v-list-tile-sub-title>
                    You have sponsored <b>{{info.personal}} Influencer{{info.personal > 1 ? 's': ''}}</b>.
                    <span v-if="info[0] > 0">You qualify for a <b>${{10*Math.floor(info.personal/3)}}/£{{8*Math.floor(info.personal/3)}} voucher!</b></span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider class="my-1"/>
              <v-list-tile avatar >
                <v-list-tile-avatar color="black">
                  <span v-if="loading === 0" class="white--text headline">{{info[1]}}</span>
                  <v-progress-circular v-else indeterminate :size="30" :width="3" color="white"></v-progress-circular>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>1st Level</v-list-tile-title>
                  <v-list-tile-sub-title>
                    You have <b>{{info[1]}} Qualifying</b> 1st Level Influencer.
                    <span v-if="info[1] > 0">You have <b>{{3*info[1]}} entries</b> in the draw!</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider class="my-1"/>
              <v-list-tile avatar >
                <v-list-tile-avatar color="black">
                  <span v-if="loading === 0" class="white--text headline">{{info[2]}}</span>
                  <v-progress-circular v-else indeterminate :size="30" :width="3" color="white"></v-progress-circular>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>2nd Level</v-list-tile-title>
                  <v-list-tile-sub-title>
                    You have <b>{{info[2]}} Qualifying</b> 2nd Level Influencers.
                    <span v-if="info[2] > 0">have <b>{{1*info[2]}} {{info[2] > 1 ? 'entries': 'entry'}}</b> in the draw!</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
import { TEAM_RECRUITS_BY_DATE } from '@/graphql/MemberStats.gql'

export default {
  name: 'PowerOf3',
  data() {
    return {
      loading: 0,
      stats: [],
      info: {
        personal: 0,
        0: 0,
        1: 0,
        2: 0
      }
    }
  },
  props: {
    memberId: Number
  },
  apollo: {
    stats: {
      query: TEAM_RECRUITS_BY_DATE,
      variables() {
        return {
          input: {
            memberId: this.memberId,
            depth: 3,
            range: {
              start: '2019-09-26T08:00:00Z', // These times are in UTC
              end: '2019-12-02T07:59:59Z' // These times are in UTC
            }
          }
        }
      },
      update({ commerceStatsRangedTeamStatsSearch }) {
        const temp = []
        commerceStatsRangedTeamStatsSearch.stats.forEach(c => {
          temp.push(...c.contributors)
        })
        console.log(temp)
        temp.forEach(i => {
          console.log(i.name, i.relativeDepth, i.recruited)
          if (i.relativeDepth === 0) {
            this.info.personal = i.recruited
          }
          if (i.recruited >= 3) {
            this.info[i.relativeDepth]++
          }
        })
        return temp
      },
      loadingKey: 'loading'
    }
  }
}
</script>

<style scoped>
.power-of-3 .scoreboard{
  margin: 0 -16px;
}
</style>
