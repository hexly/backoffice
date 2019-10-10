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
        <v-avatar size="124" class="avatar" color="white" @click="showProfilePicDialog = true">
          <v-img v-if="user.principal.member.profileUrl || $tenantInfo.placeholder" :src="user.principal.member.profileUrl || $tenantInfo.placeholder" class="mb-4" ></v-img>
          <v-gravatar v-else default-img="mp" :email="user.principal.member.contacts[0].emails[0].email" class="mb-4"/>
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
          <h3 class="mb-4">Your Personal Link</h3>
          <MyLink />
          <PrivateProfile />
        </div>
        <v-divider class="mb-3"></v-divider>
        <slot name="footer"></slot>
    </v-card>
    <FileUpload @dialogClosed="uploadDialogClosed" :shouldShow="showProfilePicDialog" @profile="makeProfilePic" :isProfilePic="true" />
  </div>
</template>

<script>
import DashCard from '@/components/DashboardCard.vue'
import MyLink from '@/components/MyLink.vue'
import PrivateProfile from '@/components/PrivateProfile.vue'
import FileUpload from '@/components/FileUpload.vue'
import { getAsset } from '@/utils/AssetService'
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
import { UserMutations, UserActions } from '@/stores/UserStore'
import { Mutations } from '@/store'

// const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'PersonalCard',
  components: {
    MyLink,
    DashCard,
    FileUpload,
    PrivateProfile
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
      showProfilePicDialog: false
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
    uploadDialogClosed(val) {
      this.showProfilePicDialog = val
    },
    formatTimeSince(time) {
      if (time === 'a') {
        return 1
      }
      return time
    },
    async makeProfilePic(asset) {
      const profileUrl = getAsset(asset.id)
      await this.saveProfile({ memberId: this.user.principal.member.id, profileUrl })
      this.showProfilePicDialog = false
    },
    ...mapActions([
      UserActions.SAVE_PROFILE
    ]),
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
.personal-card .avatar .v-responsive,
.personal-card .avatar img {
  box-shadow: 0px -10px 30px -4px black;
  border: 3px solid white;
}

.personal-card .avatar::after{
  content: 'camera_alt';
  font-family: 'Material Icons';
  font-size: 78px;
  display: none;
  position: absolute;
  top: 0px;
  right: 2px;
  bottom: 2px;
  left: 2px;
  background-color: rgba(255,255,255,0.5);
  border-radius: 100%;
  cursor: pointer;
}
.personal-card .avatar:hover::after{
  display: block;
}
</style>
