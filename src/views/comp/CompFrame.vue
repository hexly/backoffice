<template>
  <v-content class="comp frame">
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12>
          <v-card class="elevation-12">
            <v-toolbar dark color="secondary">
              <v-toolbar-title>Commissions</v-toolbar-title>
            </v-toolbar>

            <v-card-text>
              {{ expanded }}
            </v-card-text>

            <v-progress-linear
              class="ma-0"
              :indeterminate="true"
              :active="$apollo.queries.data.loading"
            />
            <v-data-table
              ref="mainTable"
              v-if="data"
              :headers="headers"
              :items="data.members"
              group-by="relativeLevel"
              item-key="_id"
              hide-default-footer
              :items-per-page="data.members.length"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Where your points came from</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <!-- <v-switch v-model="singleExpand" label="Single expand" class="mt-2"></v-switch>-->
                  <v-btn @click="() => $apollo.queries.data.refetch()"> Refresh </v-btn>
                </v-toolbar>
              </template>
              <template v-slot:group.header="props">
                <td v-for="(header, idx) in props.headers" :key="header.value">
                  <v-btn v-if="idx === 0" @click="props.toggle" icon>
                    <v-icon>
                      {{ props.isOpen ? '$minus' : '$plus' }}
                    </v-icon>
                  </v-btn>
                  {{ renderGroupHeader(header, props.items, props)}}
                </td>
              </template>
              <template v-slot:body.prepend="props" v-if="data && data.levels && data.levels.root">
                <CompPeriodSummaryRow :data="data" :row="memberRow" :headers="headers"/>
              </template>

              <template v-slot:item="{ headers, item }">
                <CompItemRow
                  :headers="headers"
                  :item="item"
                  :members="data.members"
                  :expanded="expanded.find(e => e === item._id) >= 0"
                  @expand="() => expanded.push(item._id)"
                  @close="() => removeItem(item)"
                  />
                <template v-if="expanded.find(e => e === item._id) >= 0">
                  <CompAwardRow
                    :headers="headers"
                    :award="award"
                    v-for="award in item.awards"
                      :key="award.details"/>
                </template>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
// import { mapGetters } from 'vuex'
import Vue from 'vue'
import * as gql from '@/graphql/comp.gql.js'
import CompAwardRow from '@/components/comp/CompAwardRow'
import CompItemRow from '@/components/comp/CompItemRow'
import CompPeriodSummaryRow from '@/components/comp/CompPeriodSummaryRow'

export default {
  components: {
    CompItemRow,
    CompAwardRow,
    CompPeriodSummaryRow
  },
  data () {
    return {
      expanded: [],
      supportUsers: [],
      headers: [
        { text: 'Level', value: 'relativeLevel' },
        { text: 'Awardee', value: 'awardeeId' },
        { text: 'Details', value: 'details' },
        // { text: 'Type', value: 'type' },
        // { text: 'Personal', value: 'pv' },
        { text: 'Group', value: 'gv' },
        { text: 'Downline', value: 'dlv' },
        { text: 'Generation', value: 'genv' },
        { text: '', value: 'actions' }
      ]
    }
  },
  methods: {
    removeItem(item) {
      const idx = this.expanded.indexOf(item._id)
      if (idx >= 0) {
        this.expanded.splice(idx, 1)
      }
    },
    closeAllGroups() {
      if (this.$refs && this.$refs.mainTable) {
        const oc = this.$refs.mainTable.openCache
        Object.keys(oc).forEach(k => {
          oc[k] = false
        })
      } else {
        console.log('no table yet?')
        Vue.nextTick(() => this.closeAllGroups())
      }
    },
    renderGroupHeader(header, items, props) {
      const level = this._.get(items, '0.relativeLevel')
      if (level === undefined) {
        console.warn('What did you give me for this row?', props)
        return `?NoLevel?`
      }

      const key = header.value
      // const [item] = items
      const item = this.data.levels[level || 'root']

      // debugger

      let value = item[key]
      switch (key) {
      case 'awardeeId':
        value = `Level ${level}`
        break
      case 'details':
        value = `${items.length} Contributor${items.length === 1 ? '' : 's'}`
        break
      case 'pv':
      case 'gv':
      case 'dlv':
      case 'genv':
        value = value ? value.totalPoints : 0
        break
      }

      return value
    }
  },
  computed: {
    memberRow() {
      return this._.chain(this)
        .get('data.members')
        .filter(e => e.awardeeId === 82988)
        .first()
        .value()
    }
  },
  apollo: {
    data: {
      query: gql.TEST_QUERY,
      variables () {
        return {
          dummy: {
            input: {
              memberId: 82988,
              runId: 15
              // rowTypeIn: ['level']
            }
          }
        }
      },
      result ({ data, loading, networkStatus }) {
        this.closeAllGroups()
      },
      update (res) {
        let idx = 0
        const data = this._.chain(res)
          .get('comp.dummy.data.slice')
          .transform((map, obj, key) => {
            const rl = obj.relativeLevel
            const token = rl || 'root'
            switch (obj.type) {
            case 'level':
              map.levels[`${token}`] = obj
              break

            case 'descendant':
              obj._id = idx++
              obj._level = map.levels[`${token}`]
              map.members.push(obj)
              break

            default:
              console.warn('Unexpected case of row', obj)
              break
            }
          }, { levels: {}, members: [] })
          .value()
        return data
      },
      client: 'federated'
    }
  }
  // computed: {
  //   ...mapGetters(['memberId'])
  // }
}
</script>

<style scoped>
.sale-row{
  background-image: linear-gradient(147deg, #ffffff 25%, #fafafa 25%, #fafafa 50%, #ffffff 50%, #ffffff 75%, #fafafa 75%, #fafafa 100%);
  background-size: 73.44px 47.69px;
  background-repeat: repeat;
}
</style>
