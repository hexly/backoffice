<template>
  <div class="profile text-xs-center">
      <v-tabs centered color="secondary" dark icons-and-text>
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

        <v-tab to="#legal">Legal
          <v-badge v-model="alert.legal" left color="red">
            <template slot="badge">
              <span>!</span>
            </template>
            <v-icon>business</v-icon>
          </v-badge>
        </v-tab>

        <v-tab-item value="profile" class="py-3">
          <v-layout row wrap justify-space-around>
            <v-flex xs12 sm3>
              <div class="mx-auto">
                <img class="image" :src="getAvatar">
              </div>
              <FileUpload
                @profile="makeProfilePic"
                label="Upload Profile"
                :isProfilePic="true"
              />
            </v-flex>
            <v-flex xs12 sm6>
              <PersonalForm
                ref="personal"
                :modal="modal"
                :slugIsUnique="slugIsUnique"
                :slugErrors="slugErrors"
                :originalSlug="originalSlug"
                :value="editMember"
                :saveData="saveData"
                :slugChanged="slugChanged"
                :saving="saving"
                @hasBirthday="checkAlert"
              />
            </v-flex>
          </v-layout>
        </v-tab-item>

        <v-tab-item value="address" class="px-4">
          <AddressForm
            @addressSnackBarEmitSuccess="addressSnackBarEmitSuccess"
            @addressSnackBarEmitError="addressSnackBarEmitError"
            @hasAddress="checkAlert"
          />
        </v-tab-item>
        <v-tab-item value="legal" class="px-4">
          <LegalForm @hasLegal="checkAlert" :value="legal" />
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
      <v-btn flat color="white" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import PersonalForm from '@/profile/Personal.vue'
import LegalForm from '@/profile/Legal.vue'
import AddressForm from '@/components/AddressForm.vue'
import GET_MEMBERS from '@/graphql/GetMembers.gql'
import UPDATE_PROFILE from '@/graphql/MemberPartialUpdate.gql'
import CHECK_IF_UNIQUE_SLUG from '@/graphql/Slug.gql'
import FileUpload from '@/components/FileUpload.vue'
import Rules from './Rules.js'
import { Mutations } from '@/store'
import { UserMutations } from '@/stores/UserStore'
import { mapMutations, mapGetters, mapState } from 'vuex'
import { getAsset } from '@/utils/AssetService'
import { CONTACT_UPSERT, CONTACT_EMAIL_UPSERT } from '@/graphql/Contacts.js'
import { USERNAME_UPSERT } from '@/graphql/iam.js'

const ERROR_COLOR = 'red'
const SUCCESS_COLOR = 'primary'

export default {
  components: {
    PersonalForm,
    AddressForm,
    LegalForm,
    FileUpload
  },
  data() {
    return {
      modal: false,
      visible: false,
      password: '',
      newPassword: '',
      snackbar: false,
      snackbarMsg: '',
      snackBarColor: null,
      slugRule: Rules.slugRule,
      birthdateRule: Rules.birthdateRule,
      uploadFileName: null,
      isUploading: false,
      isSaving: false,
      slugIsUnique: true,
      slugErrors: [],
      editMember: {
        username: '',
        id: '',
        name: '',
        firstName: '',
        lastName: '',
        displayName: '',
        contactEmail: '',
        profileUrl: '',
        slug: '',
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
      originalSlug: undefined,
      saving: false,
      alert: {
        address: false,
        birthday: false,
        legal: false
      }
    }
  },
  methods: {
    ...mapMutations([Mutations.SET_GATE, UserMutations.SET_PROFILE, UserMutations.SET_PRINCIPAL]),
    checkAlert (value) {
      this.alert[value.type] = !value.isSet
      if (!this.alert.address && !this.alert.legal) {
        this.setGate(false)
      }
    },
    async makeProfilePic(asset) {
      try {
        this.editMember.profileUrl = getAsset(asset.id)
        await this.$apollo.mutate({
          mutation: UPDATE_PROFILE,
          variables: {
            input: {
              id: this.editMember.id,
              profileUrl: this.editMember.profileUrl
            }
          }
        })
        this.setProfilePic(this.editMember.profileUrl)
        this.isFalse = false
        this.isUploading = false
        this.isSaving = false
        this.snackBarColor = SUCCESS_COLOR
        this.snackbarMsg = ['Profile Successfully Saved']
        this.snackbar = true
      } catch (err) {
        this.isFalse = false
        this.isUploading = false
        this.isSaving = false
        this.snackbarMsg = ['error uploading profile Pic']
        this.snackBarColor = ERROR_COLOR
        this.snackbar = true
      }
    },
    async getMembers() {
      const membersResult = await this.$apollo.query({
        fetchPolicy: 'network-only',
        query: GET_MEMBERS,
        variables: {
          input: {
            ids: [this.memberId]
          }
        }
      })
      // If graphql query succeeds
      if (membersResult) {
        const { members } = membersResult.data
        const editMember = members.nodes[0]
        this.editMember = {
          ...editMember,
          contactEmail: { ...editMember.contacts[0].emails[0] },
          username: this.principal.username
        }
        if (this.editMember.birthdate) {
          this.editMember.birthdate = this.$moment(this.editMember.birthdate, 'YYYY-MM-DD').format('MM/DD/YYYY')
        } else {
          this.checkAlert({ type: 'birthday', isSet: false })
        }

        const isInvalid = /[^a-z0-9_]/gi.test(this.editMember.slug)
        if (isInvalid) {
          console.error('invalid slug found')
          this.originalSlug = this.editMember.slug = null
        } else {
          this.originalSlug = this.editMember.slug
        }
      } else {
        this.snackbarMsg = ['Could not retrieve profile data']
        this.snackBarColor = ERROR_COLOR
        this.snackbar = true
      }
    },
    slugChanged () {
      this.slugErrors = []
      this.editMember.slug = this.editMember.slug.toLowerCase()
    },
    async saveData () {
      this.slugIsUnique = true // reset to default state
      const formIsValid = this.$refs.personal.$refs.informationForm.validate()
      let response
      if (formIsValid) {
        // Slug uniqueness query
        try {
          response = await this.$apollo.query({
            query: CHECK_IF_UNIQUE_SLUG,
            variables: {
              input: {
                tenantId: this.tenantId,
                slug: this.editMember.slug
              }
            }
          })
        } catch (err) {
          console.error('error checking slugs', { err })
          this.snackbarMsg = ['Unable to save profile data']
          this.snackBarColor = ERROR_COLOR
          this.snackbar = true
        }

        if (response) {
          const { findMemberBySlug } = response.data
          this.slugErrors = []
          if (findMemberBySlug && findMemberBySlug.id !== this.memberId) {
            this.slugIsUnique = false
            this.snackBarColor = ERROR_COLOR
            this.snackbarMsg = ['Chosen store name is unavailable!']
            this.snackbar = true
            this.slugErrors.push(
              `The store name ${this.editMember.slug} is unavailable`
            )
          }
          if (this.slugIsUnique) {
            this.saving = true
            const sentSlug = !this.originalSlug
              ? this.editMember.slug
              : this.originalSlug
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
                      slug: sentSlug,
                      birthday: this.editMember.birthdate
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
              this.originalSlug = this.editMember.slug
              this.getMembers()
            } catch (err) {
              this.parseErrors(err)
            }
          }
        }
      } else {
        this.snackbarMsg = ['One or more fields were filled out incorrectly']
        this.snackBarColor = ERROR_COLOR
        this.snackbar = true
      }
    },
    parseErrors(err) {
      console.log({ err })
      const errors = []
      err.graphQLErrors.forEach(e => {
        e.path.forEach(p => {
          if (p === 'iamUpsertUsername') {
            errors.push('Could not update username')
          }
        })
      })
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
  async mounted() {
    await this.getMembers()
  },
  watch: {
    modal (val) {
      val && this.$nextTick(() => (this.$refs.picker.activePicker = 'YEAR'))
    }
  },
  computed: {
    ...mapState({
      principal: state => state.user.principal
    }),
    ...mapGetters(['contactId']),
    birthdate () {
      return this.editMember.birthdate
    },
    memberId () {
      console.log(this.principal)
      return this.principal.memberId
    },
    tenantId () {
      return this.principal.tenantId || ~~process.env.VUE_APP_TENANT_ID
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
</style>
