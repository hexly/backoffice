<template>
  <div class="directory">
    <v-card>
      <v-card-title class="secondary white--text headline">
        {{title}}
      </v-card-title>
      <v-layout justify-space-between row wrap>
        <v-flex xs12 sm5>
          <v-sheet class="pa-3 accent">
            <v-text-field
              v-model="search"
              :label="`Search ${title}`"
              @keyup="searchDirectory"
              dark
              flat
              solo-inverted
              hide-details
              :suffix="searchSuffix"
              clearable
              clear-icon="cancel"
              loading="searchLoading"
              @click:clear="clearSearch"
            ></v-text-field>
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
        </v-flex>
        <v-flex
          d-flex
          text-xs-center
        >
          <v-scroll-y-transition mode="out-in">
            <div
              v-if="!selected"
              class="title grey--text text--lighten-1 font-weight-light"
              style="align-self: center;"
            >
              <p>Select a team member to view details.</p>
              <p class="subheading">Select the arrow to their view team</p>
            </div>
            <v-card v-else :key="selected.id" class="pt-4 mx-auto" flat>
              <v-card-text class="text-xs-center">
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
              <div class="text-xs-center pa-2" v-if="selected && (selected.counts || loadingCounts)">
                <h3>Team</h3>
                <v-layout row wrap class="text-xs-center">
                  <v-flex xs3>
                    <span v-if="!loadingCounts" class="font-weight-black title">{{selected.counts.total}}</span>
                    <v-progress-circular v-else indeterminate :size="15" :width="2" color="black"></v-progress-circular>
                    <br/>
                    Team Size
                  </v-flex>
                  <v-flex xs3>
                    <span v-if="!loadingCounts" class="font-weight-black title">{{selected.counts.level1}}</span>
                    <v-progress-circular v-else indeterminate :size="15" :width="2" color="black"></v-progress-circular>
                    <br/>
                    Front-Line
                  </v-flex>
                  <v-flex xs3>
                    <span v-if="!loadingCounts" class="font-weight-black title">{{selected.counts.level2}}</span>
                    <v-progress-circular v-else indeterminate :size="15" :width="2" color="black"></v-progress-circular>
                    <br/>
                    Second line
                  </v-flex>
                  <v-flex xs3>
                    <span v-if="!loadingCounts" class="font-weight-black title">{{selected.counts.level3}}</span>
                    <v-progress-circular v-else indeterminate :size="15" :width="2" color="black"></v-progress-circular>
                    <br/>
                    Third line
                  </v-flex>
                </v-layout>
              </div>
              <div class="text-xs-center pa-2" v-if="selected.slugs && selected.slugs[0]">
                <h3>Website</h3>
                <a target="_blank" :href="$tenantInfo.storeUrl.replace('{slug}', selected.slugs[0])">
                  {{$tenantInfo.storeUrl.replace('{slug}', selected.slugs[0])}}
                </a>
              </div>
              <Badges v-if="selected.joinedOn && badges" :joinedOn="selected.joinedOn" />
            </v-card>
          </v-scroll-y-transition>
        </v-flex>
      </v-layout>
    </v-card>
  </div>
</template>

<script>
import Badges from '@/components/Badges.vue'
import { MEMBER_STATS_BY_DEPTH } from '@/graphql/MemberStats.gql'
import { SEARCH_MEMBER_DIRECTORY } from '@/graphql/Member.gql'
import { mapGetters } from 'vuex'
import { debounce } from 'lodash'

export default {
  components: {
    Badges
  },
  props: {
    self: Object,
    frontline: Array,
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
      return [
        {
          displayName: this.self.displayName,
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
