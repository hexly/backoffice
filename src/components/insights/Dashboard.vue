<template>
  <div class="insights-dashboard mx-4">
    <v-row wrap>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="secondary white--text headline">
            Fast Start Sales Tracker
          </v-card-title>
          <v-card-text>
            <h4>Daily Progress</h4>
            <v-progress-linear color="green" height="25" :value="(23/40)*100">
              <template v-slot:default="">
                <strong>Day 23 Of Fast Start</strong>
              </template>
            </v-progress-linear>
            <p>Welcome to Everra! You are within the first 40 days of being an influencer.
              We have some exciting opportunties for you!</p>
            <h4>Sales Goal #1</h4>
            <v-progress-linear color="green" height="25" :value="(75/100)*100">
              <template v-slot:default="">
                <strong>75 PSV</strong>
              </template>
            </v-progress-linear>
            <p>Sell 100 PSV and receive an exclusive I AM Everra LUX lash</p>
            <h4>Sales Goal #2</h4>
            <v-progress-linear color="green" height="25" :value="(75/200)*100">
              <template v-slot:default="">
                <strong>75 PSV</strong>
              </template>
            </v-progress-linear>
            <p>Sell 200 PSV and receive an $35 product credit</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="secondary white--text headline">
            Fast Start Team Tracker
          </v-card-title>
          <v-card-text>
            <h4>Invite all the people!</h4>
            <p>You've helped 3 influencers join Everra and 1 has become active! You've earned $25 product credit</p>
            <v-list two-line>
              <v-list-item>
                <v-list-item-avatar>
                  <v-img src="https://platform.hexly.cloud/assets/1010/21662"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>Person 1</v-list-item-title>
                  <v-list-item-subtitle>Joined: Jan 2, 2020</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-list-item-action-text>
                    <v-chip color="green">Active</v-chip>
                    </v-list-item-action-text>
                  <v-list-item-action-text>200 PSV</v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
              <v-list-item>
                <v-list-item-avatar>
                  <v-img src="https://platform.hexly.cloud/assets/1010/21664"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>Person 2</v-list-item-title>
                  <v-list-item-subtitle>Joined: Jan 5, 2020</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-list-item-action-text>
                    <v-chip color="red">Inactive</v-chip>
                  </v-list-item-action-text>
                  <v-list-item-action-text>50 PSV</v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
              <v-list-item>
                <v-list-item-avatar>
                  <v-img src="https://platform.hexly.cloud/assets/1010/21668"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>Person 3</v-list-item-title>
                  <v-list-item-subtitle>Joined: Jan 8, 2020</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-list-item-action-text>
                    <v-chip color="red">Inactive</v-chip>
                  </v-list-item-action-text>
                  <v-list-item-action-text>0 PSV</v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InsightsDashboard',
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters(['member', 'memberId'])
  },
  components: {},
  methods: {},
  apollo: {},
  mounted () {}
}
</script>

<style>

</style>
