s<template>
  <v-card class="personal-card mx-auto" height="100%">
    <v-img
        v-if="!$tenantInfo.profileColor"
        class="white--text"
        height="125px"
        :src="$tenantInfo.profileCover || '/img/default-profile-cover.jpg'"
      />
    <div v-else class="profile-color" :style="`background-color: ${$tenantInfo.profileColor}`"></div>
    <v-card-text class="text-center">
      <v-layout>
        <v-flex>
          <v-avatar size="124" class="avatar" color="white" @click="showProfilePicDialog = true">
            <v-img v-if="user.principal.member.profileUrl || $tenantInfo.placeholder" :src="user.principal.member.profileUrl || $tenantInfo.placeholder" class="mb-4" ></v-img>
            <v-gravatar v-else default-img="mp" :email="user.principal.member.contacts[0].emails[0].email" class="mb-4"/>
          </v-avatar>
        </v-flex>
        <v-flex class="text-left">
          <h3 class="headline" style="margin-top: -10px;"> {{ user.principal.member.name }}</h3>
          <div v-if="showMrn" class="primary--text subheading font-weight-bold">{{memberName || 'Member'}} #<b>{{user.principal.member.mrn}}</b></div>
          <div v-if="stats && stats">
            <p v-if="stats && stats.metadata && stats.metadata.recognizedRank">
              Recognized Rank:
              <v-btn x-small dark color="primary" class="body-2">
                Rank {{stats.metadata.recognizedRank}}
              </v-btn>
            </p>
            <p v-else-if="previous && previous.metadata && previous.metadata.recognizedRank">
              Recognized Rank:
              <v-btn x-small dark color="primary" class="body-2">
                Rank {{previous.metadata.recognizedRank}}
              </v-btn>
            </p>
          </div>
        </v-flex>
      </v-layout>
      <v-alert class="inner-alert" :value="isMonthInReview" icon="mdi-calendar-check" text dense type="info">
        <span>It's a new month and last month is in review. Your Recognized status will be updated once the review has been finished.</span>
        <div>Month End comissions will be paid out by the 15th of the month.</div>
        <b v-if="previous && !previous.metadata">
          Last month you reached: Rank&nbsp;{{previous.current.rank}}
        </b>
        <b v-else-if="previous && previous.metadata && previous.metadata.ranking">
          Last month you reached: Rank&nbsp;{{previous.metadata.ranking.rank}}
        </b>
        <b v-else-if="previous && previous.metadata && previous.metadata.rank">
          Last month you reached: Rank&nbsp;{{previous.metadata.rank}}
        </b>
      </v-alert>
    </v-card-text>
    <v-divider></v-divider>
    <div class="text-center pb-2">
      <h3>{{sponsorName || 'Your Sponsor'}}</h3>
      <v-layout v-if="stats.sponsor" align-center>
        <v-flex>
          <div  class="mt-3">
            <v-layout row class="text-right">
              <v-flex mx-2>
                <v-avatar>
                  <v-img v-if="stats.sponsor.avatar || $tenantInfo.placeholder" :src="(stats && stats.sponsor && stats.sponsor.avatar) ? stats.sponsor.avatar.assetUrl : $tenantInfo.placeholder"></v-img>
                </v-avatar>
              </v-flex>
              <v-flex mx-2 class="text-left">
                <div>
                  <b>{{stats.sponsor.displayName}} </b>
                  <br/>
                  <small>{{(stats && stats.sponsor && stats.sponsor.contacts) ? stats.sponsor.contacts[0].emails[0].email : ''}}</small>
                </div>
              </v-flex>
            </v-layout>
          </div>
        </v-flex>
      </v-layout>
    </div>
    <v-divider></v-divider>
    <div class="text-center pa-2">
      <h3>Your Personal Link</h3>
      <MyLink />
    </div>
    <v-divider></v-divider>
    <div class="text-center pa-2">
      <h3 class="mb-4">Profile Settings</h3>
      <v-row justify="start" no-gutters class="text-left px-1" v-if="currentTheme">
          Current Store Theme:
          <strong class="text-capitalize">{{currentTheme}}</strong>
          <v-btn icon small @click="$router.push('profile#settings')">
            <v-icon small>edit</v-icon>
          </v-btn>
      </v-row>
      <div v-else><v-progress-circular indeterminate value="true"></v-progress-circular></div>
      <PrivateProfile />
    </div>
    <v-divider class="mb-3"></v-divider>
    <slot name="footer"></slot>
    <FileUpload @dialogClosed="uploadDialogClosed" :shouldShow="showProfilePicDialog" @profile="makeProfilePic" :isProfilePic="true" />
  </v-card>
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
      showProfilePicDialog: false,
      currentTheme: 'Beauty'
    }
  },
  mounted() {
    const { tenantIntegrations } = this
    if (!tenantIntegrations) {
      return
    }

    const hexlyPersonalizedStore = tenantIntegrations.find(el => el.key === 'hexly_personalized_store')
    if (!hexlyPersonalizedStore) {
      return
    }

    const { theme } = hexlyPersonalizedStore.metadata.home || {}

    this.currentTheme = theme
  },
  watch: {
    '$apollo.loading'(newVal) {
      this.setLoading(newVal)
    }
  },
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
      user: state => state.user,
      stats: state => state.comp.currentPeriod,
      previous: state => state.comp.previousPeriod
    }),
    ...mapGetters(['contactId', 'memberId', 'slug', 'isMonthInReview', 'tenantIntegrations']),
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
  top: -48px;
  margin-bottom: -62px;
  padding-top: 16px;
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
  line-height: 124px;
}
.personal-card .avatar:hover::after{
  display: block;
}
</style>
