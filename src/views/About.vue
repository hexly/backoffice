<template>
  <div class="about">
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
          </v-form>
        </v-flex>
        <v-flex xs6>
          <div class="mx-auto">
            <h2>Profile Image</h2>
            <h4>After uploading a new image, it may take up to 1 hour for the change to take effect.</h4>
            <img :src="editMember.profileUrl"/>
            <form enctype="multipart/form-data" novalidate>
                <input
                  type="file"
                  name="avatar"
                  :disabled="isSaving"
                  @change="filesChange($event.target.files)"
                  accept="image/*"
                />
            </form>
          </div>
        </v-flex>
      </v-layout>
      <v-btn color="success" @click="saveData()">Save</v-btn>
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
import IDENTITY_QUERY from '@/graphql/GetIdentity.gql'
import UPDATE_PROFILE from '@/graphql/UpdateProfile.gql'
import { Actions } from '@/store'
const { VUE_APP_CLOUDINARY_URL, VUE_APP_TENANT_ID, VUE_APP_LANE } = process.env

export default {
  data: () => ({
    visible: false,
    password: '',
    newPassword: '',
    snackbar: false,
    uploadFileName: null,
    isSaving: false,
    editMember: {
      name: '',
      displayName: '',
      email: '',
      profileUrl: this.avatarUrl
    }
  }),
  methods: {
    async filesChange(files) {
      const file = files[0]
      const { data } = await this.$store.dispatch(Actions.FILE_UPLOAD, {
        file,
        name: this.avatarId
      })
      console.log('Image Upload', data)
    },
    saveData() {
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
        update: (store, { data }) => {
          // this.editMember.profileUrl
          console.log(data)
        }
      })
      this.snackbar = true
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
    avatarId() {
      return `${VUE_APP_LANE}/${VUE_APP_TENANT_ID}/avatar/${this.member.id}`
    },
    avatarUrl() {
      return `${VUE_APP_CLOUDINARY_URL}c_scale,h_250,w_250/${this.avatarId}`
    }
  }
}
</script>
