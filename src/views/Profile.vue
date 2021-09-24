<template>
  <div class="profile text-center">
      <v-tabs centered background-color="secondary" dark icons-and-text>
        <v-tabs-slider color="white"></v-tabs-slider>

        <v-tab to="#profile">Profile
          <v-badge v-model="alert.birthday" left color="red" >
            <template slot="badge">
              <span>!</span>
            </template>
            <v-icon>portrait</v-icon>
          </v-badge>
        </v-tab>

        <v-tab to="#address">Address
          <v-badge v-model="alert.address" left color="red">
            <template slot="badge">
              <span>!</span>
            </template>
            <v-icon>house</v-icon>
          </v-badge>
        </v-tab>

        <v-tab v-if="$tenantInfo.features.legal" to="#legal">Legal
          <v-badge v-model="alert.legal" left color="red">
            <template slot="badge">
              <span>!</span>
            </template>
            <v-icon>business</v-icon>
          </v-badge>
        </v-tab>

        <v-tab v-if="$tenantInfo.features.profileSettings" to="#settings">Settings
          <v-icon>settings</v-icon>
        </v-tab>

        <v-tab-item value="profile" class="py-3">
          <h3>Personal Information</h3>
          <v-row wrap justify="space-around">
            <v-col cols="12" sm="6">
              <PersonalForm
                ref="personal"
                :modal="modal"
                :value="editMember"
                :saveData="saveData"
                :saving="saving"
                @hasBirthday="checkAlert"
              >
                <v-avatar slot="profilePic" size="124" class="avatar" color="white" @click="showProfilePicDialog = true">
                  <v-img v-if="principal.member.profileUrl || $tenantInfo.placeholder" :src="principal.member.profileUrl || $tenantInfo.placeholder" class="mb-4" ></v-img>
                  <v-gravatar v-else default-img="mp" :email="principal.member.contacts[0].emails[0].email" class="mb-4"/>
                </v-avatar>
              </PersonalForm>
            </v-col>
          </v-row>
          <div v-if="$tenantInfo.features.social">
            <v-divider class="my-5"/>
            <h3>Social Accounts</h3>
            <Social :key="tenantIntegrations.length"/>
          </div>
          <FileUpload
            @dialogClosed="showProfilePicDialog = false"
            @profile="makeProfilePic"
            :isProfilePic="true"
            :shouldShow="showProfilePicDialog"
          />
        </v-tab-item>

        <v-tab-item value="address" class="px-4">
          <!-- <AddressForm
            @addressSnackBarEmitSuccess="addressSnackBarEmitSuccess"
            @addressSnackBarEmitError="addressSnackBarEmitError"
            @hasAddress="checkAlert"
          /> -->
          <h3>Your Addresses</h3>
          <Addresses
            @addressSnackBarEmitSuccess="addressSnackBarEmitSuccess"
            @addressSnackBarEmitError="addressSnackBarEmitError"
            @hasAddress="checkAlert"
          />
        </v-tab-item>
        <v-tab-item  v-if="$tenantInfo.features.legal" value="legal" class="px-4">
          <LegalForm @hasLegal="checkAlert" :value="legal" />
        </v-tab-item>
        <v-tab-item  v-if="$tenantInfo.features.profileSettings" value="settings" class="px-4">
          <ProfileSettings />
        </v-tab-item>
      </v-tabs>
    <v-snackbar
      :timeout="6000"
      :top="true"
      :right="false"
      :color="snackBarColor"
      v-model="snackbar"
      :multi-line="true"
    >
      <div style="color: white;">
        <ul>
          <li v-for="(msg, index) in snackbarMsg" :key="index">{{msg}}</li>
        </ul>
      </div>
      <v-btn text color="white" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import Social from '@/components/profile/Social.vue'
import PersonalForm from '@/components/profile/Personal.vue'
import LegalForm from '@/components/profile/Legal.vue'
import Addresses from '@/components/profile/Addresses.vue'
import ProfileSettings from '@/components/profile/ProfileSettings.vue'
import AddressForm from '@/components/AddressForm.vue'
import { GET_MEMBERS, UPDATE_PROFILE } from '@/graphql/Member.gql'
import FileUpload from '@/components/FileUpload.vue'
import Rules from './Rules.js'
import { Mutations } from '@/store'
import { UserMutations, UserActions } from '@/stores/UserStore'
import { mapMutations, mapGetters, mapState, mapActions } from 'vuex'
import { getAsset } from '@/utils/AssetService'
import { CONTACT_UPSERT, CONTACT_EMAIL_UPSERT } from '@/graphql/Contacts.js'
import { USERNAME_UPSERT } from '@/graphql/iam.gql.js'
import * as _ from 'lodash'

const ERROR_COLOR = 'red'
const SUCCESS_COLOR = 'success'

export default {
  components: {
    PersonalForm,
    Social,
    AddressForm,
    LegalForm,
    FileUpload,
    Addresses,
    ProfileSettings
  },
  data() {
    return {
      showProfilePicDialog: false,
      modal: false,
      visible: false,
      password: '',
      newPassword: '',
      snackbar: false,
      snackbarMsg: '',
      snackBarColor: null,
      birthdateRule: Rules.birthdateRule,
      birthdayFormat: Rules.birthdayFormat,
      uploadFileName: null,
      isUploading: false,
      isSaving: false,
      editMember: {
        username: '',
        id: '',
        name: '',
        firstName: '',
        lastName: '',
        displayName: '',
        contactEmail: '',
        profileUrl: '',
        birthdate: ''
      },
      legal: {
        agreement: {
          affiliate: false,
          policies: false
        },
        clicked: {
          affiliate: null,
          policies: null
        },
        initial: {
          affiliate: null,
          policies: null,
          entity: null
        },
        entity: {}
      },
      saving: false,
      alert: {
        address: false,
        birthday: false,
        legal: false
      },
      social: {
        facebook: null
      }
    }
  },
  methods: {
    ...mapMutations([Mutations.SET_GATE, UserMutations.SET_PROFILE, UserMutations.SET_PRINCIPAL, Mutations.SET_LOADING]),
    ...mapActions([UserActions.SAVE_PROFILE]),
    checkAlert (value) {
      this.alert[value.type] = !value.isSet
      if (!this.alert.address && !this.alert.legal) {
        this.setGate(false)
      }
    },
    async makeProfilePic(asset) {
      try {
        this.setLoading(true)
        this.editMember.profileUrl = getAsset(asset.id)
        await this.saveProfile({ memberId: this.principal.member.id, profileUrl: this.editMember.profileUrl })
        this.setLoading(false)
        this.isFalse = false
        this.isUploading = false
        this.isSaving = false
        this.snackBarColor = SUCCESS_COLOR
        this.snackbarMsg = ['Profile Successfully Saved']
        this.snackbar = true
      } catch (err) {
        this.setLoading(false)
        this.isFalse = false
        this.isUploading = false
        this.isSaving = false
        this.snackbarMsg = ['error uploading profile Pic']
        this.snackBarColor = ERROR_COLOR
        this.snackbar = true
      }
    },
    async getMembers() {
      this.setLoading(true)
      let membersResult
      try {
        membersResult = await this.$apollo.query({
          fetchPolicy: 'network-only',
          query: GET_MEMBERS,
          client: 'federated',
          variables: {
            input: {
              idIn: [this.memberId],
              tenantIn: [this.$tenantId]
            }
          }
        })
        const editMember = _.get(membersResult, 'data.membership.search.results.0')
        this.editMember = {
          ...editMember,
          contactEmail: { ...editMember.contacts[0].emails[0] },
          username: this.principal.username,
          profileUrl: editMember.avatar.assetUrl
        }
        if (this.editMember.birthdate) {
          this.editMember.birthdate = this.$moment(this.editMember.birthdate, 'YYYY-MM-DD').format('MM/DD/YYYY')
        } else {
          this.checkAlert({ type: 'birthday', isSet: false })
        }
      } catch (error) {
        console.error(error)
        this.snackbarMsg = ['Could not retrieve profile data']
        this.snackBarColor = ERROR_COLOR
        this.snackbar = true
      }
      this.setLoading(false)
    },
    async saveData () {
      const formIsValid = this.$refs.personal.$refs.informationForm.validate()
      if (formIsValid) {
        this.saving = true
        try {
          await Promise.all([
            this.$apollo.mutate({
              mutation: UPDATE_PROFILE,
              variables: {
                input: {
                  id: this.editMember.id,
                  name: this.editMember.name,
                  firstName: this.editMember.firstName,
                  lastName: this.editMember.lastName,
                  displayName: this.editMember.displayName,
                  birthday: this.$moment(this.editMember.birthdate, this.birthdayFormat).format('YYYY-MM-DD')
                }
              }
            }),
            this.$apollo.mutate({
              mutation: CONTACT_UPSERT,
              variables: {
                input: {
                  firstName: this.editMember.firstName,
                  lastName: this.editMember.lastName,
                  displayName: this.editMember.displayName,
                  id: this.contactId,
                  memberId: this.editMember.id
                }
              }
            }),
            this.$apollo.mutate({
              mutation: CONTACT_EMAIL_UPSERT,
              variables: {
                input: {
                  email: this.editMember.contactEmail.email,
                  id: this.editMember.contactEmail.id,
                  contactId: this.contactId
                }
              }
            }),
            this.$apollo.mutate({
              mutation: USERNAME_UPSERT,
              variables: {
                input: {
                  username: this.editMember.username,
                  identityId: this.principal.identityId
                }
              }
            })
          ])
          this.setPrincipal({ username: this.editMember.username })
          this.saving = false
          this.snackBarColor = SUCCESS_COLOR
          this.snackbarMsg = ['Information Saved']
          this.snackbar = true
          this.getMembers()
          if (this.editMember.birthdate) {
            this.checkAlert({ type: 'birthday', isSet: true })
          }
        } catch (err) {
          this.parseErrors(err)
        }
      } else {
        this.snackbarMsg = ['One or more fields were filled out incorrectly']
        this.snackBarColor = ERROR_COLOR
        this.snackbar = true
      }
    },
    parseErrors(err) {
      console.error({ err })
      const errors = []
      if (err.graphQLErrors.length) {
        err.graphQLErrors.forEach(e => {
          e.path.forEach(p => {
            if (p === 'iamUpsertUsername') {
              errors.push('Could not update username')
            } else {
              errors.push('Error Updating Personal Information. Please Try Again or Contact Support')
            }
          })
        })
      } else {
        errors.push('Error Updating Personal Information. Please Try Again or Contact Support')
      }
      this.showErrors(errors)
    },
    showErrors(errors) {
      this.saving = false
      this.snackbarMsg = errors
      this.snackBarColor = ERROR_COLOR
      this.snackbar = true
    },
    addressSnackBarEmitSuccess (e) {
      this.snackbarMsg = [e]
      this.snackBarColor = SUCCESS_COLOR
      this.snackbar = true
    },
    addressSnackBarEmitError (e) {
      this.snackbarMsg = [e]
      this.snackBarColor = ERROR_COLOR
      this.snackbar = true
    }
  },
  async created() {
    await this.getMembers()
  },
  watch: {
    modal (val) {
      val && this.$nextTick(() => (this.$refs.picker.activePicker = 'YEAR'))
    }
  },
  computed: {
    ...mapState({
      principal: state => state.user.principal,
      loading: state => state.loading
    }),
    ...mapGetters(['contactId', 'tenantIntegrations']),
    birthdate () {
      return this.editMember.birthdate
    },
    memberId () {
      return this.principal.memberId
    },
    getAvatar () {
      return (
        this.editMember.profileUrl || this.$tenantInfo.placeholder
      )
    }
  }
}
</script>

<style scoped>
.image {
  width: 100%;
}
.profile .avatar {
  position: relative;
  padding-top: 19px;
}
.profile .avatar .v-responsive,
.profile .avatar img {
  border: 3px solid white;
}

.profile .avatar::after{
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
.profile .avatar:hover::after{
  display: block;
}
</style>
