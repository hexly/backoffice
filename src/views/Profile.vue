<template>
  <div class="profile">
    <v-container
      grid-list-md
      text-xs-center
    >
      <v-tabs
        centered
        color="green"
        dark
        icons-and-text
      >
        <v-tabs-slider color="purple"></v-tabs-slider>

        <v-tab to="#profile">Profile
          <v-badge
            v-model="alert.birthday"
            left
            color="red"
          >
            <template slot="badge">
              <span>!</span>
            </template>
            <v-icon>portrait</v-icon>
          </v-badge>
        </v-tab>

        <v-tab to="#address">Address
          <v-badge
            v-model="alert.address"
            left
            color="red"
          >
            <template slot="badge">
              <span>!</span>
            </template>
            <v-icon>house</v-icon>
          </v-badge>
        </v-tab>

        <v-tab to="#legal">Legal
          <v-badge
            v-model="alert.legal"
            left
            color="red"
          >
            <template slot="badge">
              <span>!</span>
            </template>
            <v-icon>business</v-icon>
          </v-badge>
        </v-tab>

        <v-tab-item value="profile">
          <v-layout
            row
            wrap
            justify-space-around
          >
            <v-flex
              xs12
              sm3
            >
              <div class="mx-auto">
                <img
                  class="image"
                  :src="getAvatar"
                >
                <form
                  enctype="multipart/form-data"
                  novalidate
                >
                  <input
                    type="file"
                    name="avatar"
                    :disabled="isSaving"
                    @change="filesChange($event.target.files)"
                    accept="image/*"
                  >
                  <div v-if="isUploading">Uploading... please wait</div>
                </form>
              </div>
            </v-flex>
            <v-flex
              xs12
              sm6
            >
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

        <v-tab-item value="address">
          <AddressForm
            @addressSnackBarEmitSuccess="addressSnackBarEmitSuccess"
            @addressSnackBarEmitError="addressSnackBarEmitError"
            @hasAddress="checkAlert"
          />
        </v-tab-item>
        <v-tab-item value="legal">
          <LegalForm @hasLegal="checkAlert" :value="legal" />
        </v-tab-item>
      </v-tabs>
    </v-container>
    <v-snackbar
      :timeout="6000"
      :top="true"
      :right="false"
      :color="snackBarColor"
      v-model="snackbar"
      :multi-line="true"
    >
      <div style="color: white;">{{snackbarMsg}}</div>
      <v-btn
        flat
        color="white"
        @click.native="snackbar = false"
      >Close</v-btn>
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
import Rules from './Rules.js'
import { Actions, Mutations } from '@/store'
import { mapMutations } from 'vuex'

var moment = require('moment')

const ERROR_COLOR = 'red'
const SUCCESS_COLOR = 'purple'

export default {
  components: {
    PersonalForm,
    AddressForm,
    LegalForm
  },
  data: () => ({
    modal: false,
    moment,
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
      id: '',
      name: '',
      displayName: '',
      email: '',
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
  }),
  methods: {
    ...mapMutations([Mutations.SET_GATE]),
    checkAlert (value) {
      this.alert[value.type] = !value.isSet
      if (!this.alert.address && !this.alert.legal) {
        this.setGate(false)
      }
    },
    async filesChange (files) {
      try {
        const file = files[0]
        this.isSaving = true
        this.isUploading = true
        const { data } = await this.$store.dispatch(Actions.AVATAR_UPLOAD, {
          file
        })
        this.editMember.profileUrl = data.secure_url
        await this.$apollo.mutate({
          mutation: UPDATE_PROFILE,
          variables: {
            input: {
              id: this.editMember.id,
              profileUrl: this.editMember.profileUrl
            }
          }
        })
        this.isFalse = false
        this.isUploading = false
        this.isSaving = false
        this.snackBarColor = SUCCESS_COLOR
        this.snackbarMsg = 'Profile Successfully Saved'
        this.snackbar = true
      } catch (err) {
        this.isFalse = false
        this.isUploading = false
        this.isSaving = false
        console.error('error uploading file', { err })
        this.snackbarMsg = 'Error uploading file'
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
        this.editMember = { ...editMember }
        if (this.editMember.birthdate) {
          this.editMember.birthdate = moment(this.editMember.birthdate).format('MM/DD/YYYY')
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
        this.snackbarMsg = 'Could not retrieve profile data'
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
          this.snackbarMsg = 'Unable to save profile data'
          this.snackBarColor = ERROR_COLOR
          this.snackbar = true
        }

        if (response) {
          const { findMemberBySlug } = response.data
          this.slugErrors = []
          if (findMemberBySlug && findMemberBySlug.id !== this.memberId) {
            this.slugIsUnique = false
            this.snackBarColor = ERROR_COLOR
            this.snackbarMsg = 'Chosen store name is unavailable!'
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
              await this.$apollo.mutate({
                mutation: UPDATE_PROFILE,
                variables: {
                  input: {
                    id: this.editMember.id,
                    name: this.editMember.name,
                    displayName: this.editMember.displayName,
                    contactEmail: this.editMember.email,
                    slug: sentSlug,
                    birthday: this.editMember.birthdate
                  }
                }
              })
              this.saving = false
              this.snackBarColor = SUCCESS_COLOR
              this.snackbarMsg = 'Information Saved'
              this.snackbar = true
              this.originalSlug = this.editMember.slug
              this.getMembers()
            } catch (err) {
              console.error({ err })
              this.saving = false
              this.snackbarMsg = 'Profile update was unsuccessful'
              this.snackBarColor = ERROR_COLOR
              this.snackbar = true
            }
          }
        }
      } else {
        this.snackbarMsg = 'One or more fields were filled out incorrectly'
        this.snackBarColor = ERROR_COLOR
        this.snackbar = true
      }
    },
    addressSnackBarEmitSuccess (e) {
      this.snackbarMsg = e
      this.snackBarColor = SUCCESS_COLOR
      this.snackbar = true
    },
    addressSnackBarEmitError (e) {
      this.snackbarMsg = e
      this.snackBarColor = ERROR_COLOR
      this.snackbar = true
    }
  },
  mounted() {
    this.getMembers()
  },
  watch: {
    modal (val) {
      val && this.$nextTick(() => (this.$refs.picker.activePicker = 'YEAR'))
    }
  },
  computed: {
    birthdate () {
      return this.editMember.birthdate
    },
    memberId () {
      return this.$store.state.user.principal.memberId
    },
    tenantId () {
      return this.$store.state.user.principal.tenantId || ~~process.env.VUE_APP_TENANT_ID
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
