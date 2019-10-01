<template>
  <div class="directory">
    <v-card>
      <v-card-title class="secondary white--text headline">
        Your Circle Of Influence
      </v-card-title>
      <v-layout justify-space-between row wrap>
        <v-flex xs12 sm5>
          <v-treeview
            :active.sync="active"
            :items="items"
            :load-children="fetchUsers"
            :open.sync="open"
            activatable
            active-class="primary--text"
            class="grey lighten-5"
            transition
          >
            <template slot="prepend" slot-scope="{ item, active }">
              <v-icon v-if="!item.children" :color="active ? 'primary' : ''" > mdi-account </v-icon>
            </template>
            <template slot="label" slot-scope="{ item, active }">
              <span>
                {{item.displayName || item.name}}
                <span v-if="item.counts && item.counts.level1" :color="active ? 'primary' : ''" > ({{item.counts.level1}}) </span>
              </span>
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
            <v-card v-else :key="selected.id" class="pt-4 mx-auto" flat max-width="400">
              <v-card-text class="text-xs-center">
                <v-avatar size="124" class="avatar" color="white">
                  <v-img :src="selected.profileUrl || $tenantInfo.placeholder" class="mb-4" ></v-img>
                </v-avatar>
                <h3 class="headline mb-2">
                  {{ selected.name }}
                </h3>
                <!-- <div class="primary--text mb-2">{{ selected.contacts[0].emails[0].email }}</div> -->
                <div class="primary--text subheading font-weight-bold">Influencer #<b>{{selected.mrn}}</b></div>
              </v-card-text>
              <v-divider class="mb-3"></v-divider>
              <div class="text-xs-center pa-2" v-if="selected.slugs[0]">
                <h3>Website</h3>
                <a target="_blank" :href="$tenantInfo.storeUrl.replace('{slug}', selected.slugs[0])">
                  {{$tenantInfo.storeUrl.replace('{slug}', selected.slugs[0])}}
                </a>
              </div>
              <Badges v-if="selected.joinedOn" :joinedOn="selected.joinedOn" />
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
import { mapGetters } from 'vuex'

export default {
  components: {
    Badges
  },
  props: {
    self: Object,
    frontline: Array
  },
  data() {
    return {
      active: [],
      avatar: null,
      open: [],
      users: [],
      allPeople: [],
      addedToUsers: []
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
      return this.allPeople.find(user => user.id === id)
    }
  },
  methods: {
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
</style>
