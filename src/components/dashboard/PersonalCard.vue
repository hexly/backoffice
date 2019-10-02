<template>
  <div class="personal-card">
    <v-card class="mx-auto">
      <v-img
          v-if="!$tenantInfo.profileColor"
          class="white--text"
          height="125px"
          :src="$tenantInfo.profileCover || '/img/default-profile-cover.jpg'"
        />
      <div v-else class="profile-color" :style="`background-color: ${$tenantInfo.profileColor}`"></div>
      <v-card-text class="text-xs-center">
        <v-avatar size="124" class="avatar" color="white">
          <v-img :src="user.principal.member.profileUrl || $tenantInfo.placeholder" class="mb-4" ></v-img>
        </v-avatar>
        <h3 class="headline mb-2"> {{ user.principal.member.name }}</h3>
        <div class="primary--text mb-2">{{ user.principal.member.email }}</div>
        <div v-if="showMrn" class="primary--text subheading font-weight-bold">{{memberName || 'Member'}} #<b>{{user.principal.member.mrn}}</b></div>
        <div v-if="user.principal.member.sponsor">
          <b>{{sponsorName || 'Sponsor'}}:</b> {{user.principal.member.sponsor.displayName}}
        </div>
      </v-card-text>
      <v-divider class="mb-3"></v-divider>
        <div class="text-xs-center pa-2">
          <h3>Website</h3>
          <MyLink />
        </div>
        <v-divider class="mb-3"></v-divider>
        <slot name="footer"></slot>
    </v-card>
  </div>
</template>

<script>
import DashCard from '@/components/DashboardCard.vue'
import MyLink from '@/components/MyLink.vue'
import { mapMutations, mapState, mapGetters } from 'vuex'
import { UserMutations } from '@/stores/UserStore'
import { Mutations } from '@/store'

// const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'PersonalCard',
  components: {
    MyLink,
    DashCard
  },
  props: {
    memberName: String,
    sponsorName: String,
    showMrn: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
    }
  },
  async mounted() {},
  watch: {
    '$apollo.loading'(newVal) {
      this.setLoading(newVal)
    }
  },
  apollo: {},
  methods: {
    formatTimeSince(time) {
      if (time === 'a') {
        return 1
      }
      return time
    },
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
    ...mapGetters(['contactId', 'memberId', 'slug']),
    isFounder() {
      return this.$moment(this.user.principal.member.joinedOn).isBefore('2020-03-01')
    }
  }
}
</script>

<style>
.profile-color {
  height: 125px;
  width: 100%;
}
.personal-card {
  width: 100%;
}
.personal-card .avatar {
  position: relative;
  top: -62px;
  margin-bottom: -62px;
  padding-top: 19px;
}
.personal-card .avatar .v-responsive {
  box-shadow: 0px -10px 30px -4px black;
  border: 3px solid white;
}
</style>
