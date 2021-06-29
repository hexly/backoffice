<template>
  <div class="directory">
    <v-card>
      <v-card-title class="secondary white--text headline">
        {{title}}
      </v-card-title>
      <v-row justify="space-between">
        <v-col cols="12" sm="5">
          <v-sheet class="pa-3">
            <v-text-field
              v-model="search"
              @keyup="searchDirectory"
              flat
              outline
              hide-details
              :suffix="searchSuffix"
              clearable
              clear-icon="cancel"
              loading="searchLoading"
              @click:clear="clearSearch"
            >
              <template slot="label" class="black--text">Search {{title}}</template>
            </v-text-field>
          </v-sheet>
          <v-treeview
            :active.sync="active"
            :items="searchResults.length ? searchResults : items"
            :load-children="fetchUsers"
            :open.sync="open"
            activatable
            active-class="primary--text"
            class="grey lighten-5 pr-2"
            transition
          >
            <template slot="prepend" slot-scope="{ item, active }">
              <v-icon v-if="!item.children" :color="active ? 'primary' : ''" > mdi-account </v-icon>
            </template>
            <template slot="label" slot-scope="{ item, active }">
              <span>
                {{item.displayName || item.name}}
                <span v-if="item.counts && item.counts.level1" :color="active ? 'primary' : ''" > ({{item.counts.level1}}) </span>
                <span v-else-if="!item.id && frontline && frontline.length" :color="active ? 'primary' : ''" > ({{frontline.length}}) </span>
              </span>
            </template>
            <template slot="append" slot-scope="{ item }">
              <span v-if="item.searchMatched" class="font-weight-black text-uppercase grey--text">Matched</span>
            </template>
          </v-treeview>
        </v-col>
        <v-col class="d-flex text-center">
          <v-scroll-y-transition mode="out-in">
            <div
              v-if="!selected"
              class="title grey--text text--lighten-1 font-weight-light"
              style="align-self: center; margin: auto;"
            >
              <p>Select a team member to view details.</p>
              <p class="subheading">Select the arrow to their view team</p>
            </div>
            <v-card v-else :key="selected.id" class="pt-4 mx-auto" flat>
              <v-card-text class="text-center">
                <v-avatar size="124" class="avatar" color="white">
                  <v-img :src="selected.profileUrl || $tenantInfo.placeholder" class="mb-4" ></v-img>
                </v-avatar>
                <h3 class="headline mb-2">
                  {{ selected.name }}
                </h3>
                <div v-if="selected.emails && selected.emails[0]" class="primary--text mb-2">{{ selected.emails[0] }}</div>
                <div class="primary--text subheading font-weight-bold">{{membersTypeName}} #<b>{{selected.mrn}}</b></div>
              </v-card-text>
              <v-divider class="mb-3"></v-divider>
              <div class="text-center pa-2" v-if="selected && (selected.counts || loadingCounts)">
                <h3>Team</h3>
                <v-row wrap class="text-center">
                  <v-col cols="3">
                    <span v-if="!loadingCounts" class="font-weight-black title">{{selected.counts.total}}</span>
                    <v-progress-circular v-else indeterminate :size="15" :width="2" color="black"></v-progress-circular>
                    <br/>
                    Team Size
                  </v-col>
                  <v-col cols="3">
                    <span v-if="!loadingCounts" class="font-weight-black title">{{selected.counts.level1}}</span>
                    <v-progress-circular v-else indeterminate :size="15" :width="2" color="black"></v-progress-circular>
                    <br/>
                    Front-Line
                  </v-col>
                  <v-col cols="3">
                    <span v-if="!loadingCounts" class="font-weight-black title">{{selected.counts.level2}}</span>
                    <v-progress-circular v-else indeterminate :size="15" :width="2" color="black"></v-progress-circular>
                    <br/>
                    Second line
                  </v-col>
                  <v-col cols="3">
                    <span v-if="!loadingCounts" class="font-weight-black title">{{selected.counts.level3}}</span>
                    <v-progress-circular v-else indeterminate :size="15" :width="2" color="black"></v-progress-circular>
                    <br/>
                    Third line
                  </v-col>
                </v-row>
              </div>
              <div class="text-center pa-2" v-if="selected.slugs && selected.slugs[0]">
                <h3>Website</h3>
                <a target="_blank" :href="$tenantInfo.storeUrl.replace('{slug}', selected.slugs[0])">
                  {{$tenantInfo.storeUrl.replace('{slug}', selected.slugs[0])}}
                </a>
              </div>
              <Badges v-if="badges" :memberId="selected.id" />
            </v-card>
          </v-scroll-y-transition>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import Badges from '@/components/Badges.vue'
import { MEMBER_STATS_BY_DEPTH } from '@/graphql/MemberStats.gql'
import { SEARCH_MEMBER_DIRECTORY } from '@/graphql/Member.gql'
import { mapGetters } from 'vuex'
import { debounce, get } from 'lodash'

export default {
  components: {
    Badges
  },
  props: {
    title: String,
    membersTypeName: {
      type: String,
      default: 'Member'
    },
    badges: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      self: {
        counts: {
          total: 0,
          level1: 0
        }
      },
      frontline: [],
      console,
      searchSuffix: null,
      active: [],
      avatar: null,
      open: [],
      users: [],
      allPeople: [],
      addedToUsers: [],
      search: null,
      searchLoading: false,
      searchResults: [],
      loadingCounts: false
    }
  },
  computed: {
    ...mapGetters(['memberId', 'displayName']),
    items () {
      const displayName = get(this, 'self.displayName')
      return [
        {
          displayName,
          children: this.users
        }
      ]
    },
    selected () {
      if (!this.active.length) return undefined
      const id = this.active[0]
      const selectedMember = this.allPeople.find(user => user.id === id)
      if (selectedMember && !selectedMember.counts) {
        selectedMember.counts = {}
        this.loadMoreMemberInfo(selectedMember)
      }
      return selectedMember
    }
  },
  methods: {
    clearSearch() {
      this.open = []
      this.searchResults = []
      this.searchSuffix = null
    },
    searchDirectory: debounce(async function(searchTerm) {
      this.searchLoading = true
      this.searchSuffix = null
      if (this.search) {
        const { data } = await this.$apollo.query({
          query: SEARCH_MEMBER_DIRECTORY,
          variables: {
            input: {
              searchTerm: this.search,
              showEmail: true
            }
          }
        })
        const { searchTeamWithUpline } = data
        if (Object.keys(searchTeamWithUpline).length > 0) {
          this.searchResults = [searchTeamWithUpline]
          this.addSearchPeopleToList(this.searchResults)
        } else {
          this.searchSuffix = '0 Results Found'
        }
      } else {
        this.clearSearch()
      }
      this.searchLoading = false
    }, 500),

    addSearchPeopleToList(people) {
      people.forEach(p => {
        if (p.children) {
          this.addSearchPeopleToList(p.children)
        }
        this.open.push(p.id)
        if (this.addedToUsers.indexOf(p.id) === -1) {
          this.addedToUsers.push(p.id)
          this.allPeople.push(p)
        }
      })
    },
    async loadMoreMemberInfo (member) {
      this.loadingCounts = true
      const { data: { getTeamDataByDepth } } = await this.$apollo.query({
        query: MEMBER_STATS_BY_DEPTH,
        variables: {
          input: {
            relativeDepthIn: [0],
            targetId: member.id
          }
        }
      })
      member.counts = getTeamDataByDepth[0].counts
      this.loadingCounts = false
    },
    async fetchUsers (item) {
      if (!item.id) {
        item.id = this.memberId
        item.children.push(...this.frontline.map(n => {
          const child = { ...n }
          if (n.counts.level1 > 0) {
            child.children = []
          }

          return child
        }))

        return item.children
      }
      const { data: { getTeamDataByDepth } } = await this.$apollo.query({
        query: MEMBER_STATS_BY_DEPTH,
        variables: {
          input: {
            relativeDepthIn: [1],
            targetId: item.id
          }
        }
      })
      const [target, ...children] = getTeamDataByDepth
      item.children.push(...children.map(n => {
        const child = { ...n }
        if (n.counts.level1 > 0) {
          child.children = []
        }
        return child
      }))

      if (this.addedToUsers.indexOf(target.id) === -1) {
        this.allPeople.push(...children.map(n => {
          const child = { ...n }
          if (n.counts.level1 > 0) {
            child.children = []
          }
          return child
        }))
        this.addedToUsers.push(target.id)
      }
      return children
    }
  },
  apollo: {
    frontline: {
      query: MEMBER_STATS_BY_DEPTH,
      variables () {
        return {
          input: {
            relativeDepthIn: [1],
            targetId: this.memberId
          }
        }
      },
      loadingKey: 'loadingStats',
      update ({ getTeamDataByDepth }) {
        // Frist one is always personal stats
        const [personal, ...rest] = getTeamDataByDepth
        this.self = personal
        return rest
      }
    }
  },
  watch: {
    frontline(newVal, oldVal) {
      if (newVal && newVal.length > 0) {
        this.allPeople.push(...newVal.map(n => {
          const child = { ...n }
          if (n.counts.level1 > 0) {
            child.children = []
          }
          return child
        }))
      }
    }
  }
}

</script>

<style>
.directory .v-treeview{
  height: 444px;
  overflow-y: scroll;
}

.directory .v-treeview-node__label{
  cursor: pointer;
}
</style>
