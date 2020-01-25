<template>
  <v-layout row wrap>
    <v-card width="100%">
      <v-toolbar color="secondary" dark>
        <v-toolbar-title>Rank Requirements</v-toolbar-title>
      </v-toolbar>
      <v-card-content v-if="Object.keys(stats).length" class="pa-3">
        <v-layout row justify-space-between pb-4>
          <v-flex px-3>
            <div class="title">Rank</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">Rank {{stats.rank}}</div>
          </v-flex>
        </v-layout>
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div class="title">PSV</div>
            <div class="caption grey--text darken-1">Personal Sales Volume</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{stats.psv}}</div>
            <div v-if="stats.psvMax < 0" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat(stats.psv / stats.psvMax).toFixed(2) * 100}}% of {{stats.psvMax}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear  color="success" height="5" :value="(stats.psv / stats.psvMax) * 100"></v-progress-linear>
          </v-flex>
        </v-layout>
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div class="title">CPSV</div>
            <div class="caption grey--text darken-1">Career PSV</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{stats.cpsv}}</div>
            <div v-if="stats.cpsvMax < 0" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat(stats.cpsv / stats.cpsvMax).toFixed(2) * 100}}% of {{stats.cpsvMax}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear  color="success" height="5" :value="(stats.psv / stats.cpsvMax) * 100"></v-progress-linear>
          </v-flex>
        </v-layout>
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div class="title">GSV</div>
            <div class="caption grey--text darken-1">Group Sales Volume</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{stats.gsv}}</div>
            <div v-if="stats.gsvMax < 0" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat(stats.gsv / stats.gsvMax).toFixed(2) * 100}}% of {{stats.gsvMax}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear  color="success" height="5" :value="(stats.gsv / stats.gsvMax) * 100"></v-progress-linear>
          </v-flex>
        </v-layout>
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div class="title">AL</div>
            <div class="caption grey--text darken-1">Active Legs</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{stats.al}}</div>
            <div v-if="stats.alMax < 0" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat(stats.al / stats.alMax).toFixed(2) * 100}}% of {{stats.alMax}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear  color="success" height="5" :value="(stats.al / stats.alMax) * 100"></v-progress-linear>
          </v-flex>
        </v-layout>
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div class="title">PABQL</div>
            <div class="caption grey--text darken-1">Paid-As Bonus Qualified Legs</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{stats.pabql}}</div>
            <div v-if="stats.pabqlMax < 0" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat(stats.pabql / stats.pabqlMax).toFixed(2) * 100}}% of {{stats.pabqlMax}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear  color="success" height="5" value="0"></v-progress-linear>
          </v-flex>
        </v-layout>
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div class="title">DSV</div>
            <div class="caption grey--text darken-1">Downline Sales Volume</div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{stats.dsv}}</div>
            <div v-if="stats.dsvMax < 0" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat(stats.dsv / stats.dsvMax).toFixed(2) * 100}}% of {{stats.dsvMax}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear  color="success" height="5" value="0"></v-progress-linear>
          </v-flex>
        </v-layout>
        <v-layout row justify-space-between wrap>
          <v-flex px-3>
            <div class="title">ADSV</div>
            <div class="caption grey--text darken-1">
              Adjusted Downline Sales Volume
              <v-tooltip slot="append" right>
                  <v-icon slot="activator" small>help</v-icon>
                  <span>Maximum 60% DSV from any one leg</span>
              </v-tooltip>
            </div>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex px-3 text-xs-right>
            <div class="title">{{stats.adsv}}</div>
            <div v-if="stats.adsvMax < 0" class="caption grey--text darken-1">
              N/A
              <v-tooltip slot="append" left>
                  <v-icon slot="activator" small>info</v-icon>
                  <span>Not applicable for next rank</span>
              </v-tooltip>
            </div>
            <div v-else class="caption grey--text darken-1">{{Number.parseFloat(stats.adsv / stats.adsvMax).toFixed(2) * 100}}% of {{stats.adsvMax}}</div>
          </v-flex>
          <v-flex xs12 px-3>
            <v-progress-linear  color="success" height="5" value="0"></v-progress-linear>
          </v-flex>
        </v-layout>
      </v-card-content>
      <v-card-content v-else class="pa-3">
        <v-layout row justify-space-between pb-4>
          <v-flex px-3>
            <div class="title">No Rank Data Found</div>
          </v-flex>
        </v-layout>
      </v-card-content>
    </v-card>
  </v-layout>
</template>

<script>
export default {
  name: 'RankRequirementsCard',
  props: {
    stats: Object
  }
}
</script>
