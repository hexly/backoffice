<template>
  <div class="profile">
    <h1>Your Profile</h1>
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs6>
          <div class="mx-auto">
            <h2>Your Information</h2>
          </div>
          <v-form>
            <v-text-field
              label="Name"
              v-model="editMember.name"
              required
            ></v-text-field>
            <v-text-field
              label="E-mail"
              v-model="editMember.email"
              required
            ></v-text-field>
            <v-text-field
              label="Display name"
              v-model="editMember.displayName"
              required
            ></v-text-field>
            <!--
              <v-text-field
                name="password"
                label="Enter your password"
                hint="At least 8 characters"
                v-model="password"
                min="8"
                :append-icon="visible ? 'visibility_off' : 'visibility'"
                :append-icon-cb="() => (visible = !visible)"
                :type="visible ? 'text' : 'password'"
              ></v-text-field>
            -->
          </v-form>
          <v-btn :disabled="saving" :loading="saving" color="success" @click="saveData()">Save Information</v-btn>
          <h2>Your Address</h2>
          <AddressForm @addressSaved="snackbar = true"/>
        </v-flex>
        <v-flex xs6>
          <div class="mx-auto">
            <h2>Profile Image</h2>
            <img class="image" :src="getAvatar"/>
            <form enctype="multipart/form-data" novalidate>
                <input
                  type="file"
                  name="avatar"
                  :disabled="isSaving"
                  @change="filesChange($event.target.files)"
                  accept="image/*"
                />
                <div v-if="isUploading">Uploading... please wait</div>
            </form>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
    <v-snackbar
      :timeout="6000"
      :top="true"
      :right="true"
      v-model="snackbar"
    >
      Information Saved
      <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import AddressForm from '@/components/AddressForm.vue'
import IDENTITY_QUERY from '@/graphql/GetIdentity.gql'
import UPDATE_PROFILE from '@/graphql/UpdateProfile.gql'
import { Actions } from '@/store'

export default {
  components: {
    AddressForm
  },
  data: () => ({
    visible: false,
    password: '',
    newPassword: '',
    snackbar: false,
    uploadFileName: null,
    isUploading: false,
    isSaving: false,
    editMember: {
      id: '',
      name: '',
      displayName: '',
      email: '',
      profileUrl: ''
    },
    saving: false
  }),
  methods: {
    async filesChange(files) {
      const file = files[0]
      this.isSaving = true
      this.isUploading = true
      const { data } = await this.$store.dispatch(Actions.AVATAR_UPLOAD, {
        file
      })
      this.isFalse = false
      this.isUploading = false
      this.editMember.profileUrl = data.secure_url
      this.saveData()
    },
    saveData() {
      this.saving = true
      this.$apollo.mutate({
        mutation: UPDATE_PROFILE,
        variables: {
          input: {
            memberId: this.editMember.memberId,
            name: this.editMember.name,
            displayName: this.editMember.displayName,
            contactEmail: this.editMember.email,
            profileUrl: this.editMember.profileUrl
          }
        },
        update: (store, response) => {
          this.saving = false
          this.snackbar = true
        }
      })
    }
  },
  apollo: {
    member: {
      query: IDENTITY_QUERY,
      variables() {
        return {
          condition: {
            memberId: this.$store.state.user.principal.member.id
          }
        }
      },
      update({ allIdentities }) {
        const editMember = allIdentities.nodes[0]
        this.editMember = { ...editMember }
        return editMember
      }
    }
  },
  computed: {
    getAvatar() {
      return (
        this.editMember.profileUrl ||
        'http://res.cloudinary.com/hexly/image/upload/dev/1001/avatar/undefined.jpg'
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
