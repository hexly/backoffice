<template>
  <div class="profile">
    <h1>Your Profile</h1>
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs6>
          <div class="mx-auto">
            <h2>Your Information</h2>
          </div>
          <v-tabs centered color="green" dark icons-and-text>
            <v-tabs-slider color="purple"></v-tabs-slider>

            <v-tab href="#profile">Profile
              <v-icon>portrait</v-icon>
            </v-tab>

            <v-tab href="#address">Address
              <v-icon>house</v-icon>
            </v-tab>

            <v-tab-item value="profile">
              <v-form ref="informationForm">
                <v-text-field label="Name" v-model="editMember.name" required></v-text-field>
                <v-text-field label="E-mail" v-model="editMember.contactEmail" required></v-text-field>
                <v-text-field label="Display name" v-model="editMember.displayName" required></v-text-field>
                <v-text-field
                  label="Slug / Store Name"
                  class="mb-3"
                  v-model="editMember.slug"
                  @keyup="slugChanged"
                  :rules="slugRule"
                  :error-messages="slugErrors"
                  required
                  :disabled="!!originalSlug"
                  persistent-hint
                  :hint="`https://www.mygreenhorizen.com/store/${editMember.slug || '{your_store_name}'}`"
                ></v-text-field>
                <!-- <v-text-field
                  name="password"
                  label="Enter your password"
                  hint="At least 8 characters"
                  v-model="password"
                  min="8"
                  :append-icon="visible ? 'visibility_off' : 'visibility'"
                  :append-icon-cb="() => (visible = !visible)"
                  :type="visible ? 'text' : 'password'"
                ></v-text-field>-->
              </v-form>
              <v-btn
                :disabled="saving"
                :loading="saving"
                color="success"
                @click="saveData()"
              >Save Information</v-btn>
            </v-tab-item>

            <v-tab-item value="address">
              <h2>Your Address</h2>
              <AddressForm @addressSaved="snackbar = true"/>
            </v-tab-item>
          </v-tabs>
        </v-flex>
        <v-flex xs6>
          <div class="mx-auto">
            <h2>Profile Image</h2>
            <img class="image" :src="getAvatar">
            <form enctype="multipart/form-data" novalidate>
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
      </v-layout>
    </v-container>
    <v-snackbar :timeout="6000" :top="true" :right="true" v-model="snackbar">
      {{snackbarMsg}}
      <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import AddressForm from '@/components/AddressForm.vue';
import GET_MEMBERS from '@/graphql/GetMembers.gql';
import UPDATE_PROFILE from '@/graphql/MemberPartialUpdate.gql';
import CHECK_IF_UNIQUE_SLUG from '@/graphql/Slug.gql';
import Rules from './Rules.js';
import { Actions } from '@/store';

export default {
  components: {
    AddressForm
  },
  data: () => ({
    visible: false,
    password: '',
    newPassword: '',
    snackbar: false,
    snackbarMsg: '',
    slugRule: Rules.slugRule,
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
      slug: ''
    },
    originalSlug: undefined,
    saving: false
  }),
  methods: {
    async filesChange(files) {
      const file = files[0];
      this.isSaving = true;
      this.isUploading = true;
      const { data } = await this.$store.dispatch(Actions.AVATAR_UPLOAD, {
        file
      });
      this.isFalse = false;
      this.isUploading = false;
      this.editMember.profileUrl = data.secure_url;
      this.saveData();
    },
    slugChanged() {
      this.slugErrors = []
      this.editMember.slug = this.editMember.slug.toLowerCase()
    },
    async saveData() {
      const formIsValid = this.$refs.informationForm.validate();
      if (formIsValid) {
        // Slug uniqueness query
        const { data = {} } = await this.$apollo.query({
          query: CHECK_IF_UNIQUE_SLUG,
          variables: {
            input: {
              slugs: [this.editMember.slug]
            }
          }
        });

        const { membersBySlugs = [] } = data;
        this.slugErrors = []
        if (membersBySlugs.find(e => e.id !== this.memberId)) {
          this.slugIsUnique = false;
          this.snackbarMsg = 'Chosen store name is unavailable!';
          this.snackbar = true;
          this.slugErrors.push(`The store name ${this.editMember.slug} is unavailable`)
        }
        if (this.slugIsUnique) {
          this.saving = true;
          const sentSlug = !this.originalSlug
            ? this.editMember.slug
            : this.originalSlug
          this.$apollo.mutate({
            mutation: UPDATE_PROFILE,
            variables: {
              input: {
                id: this.editMember.id,
                name: this.editMember.name,
                displayName: this.editMember.displayName,
                contactEmail: this.editMember.email,
                profileUrl: this.editMember.profileUrl,
                slug: sentSlug
              }
            },
            update: (store, response) => {
              this.saving = false;
              this.snackbarMsg = 'Information Saved';
              this.snackbar = true;
              this.originalSlug = this.editMember.slug;
            }
          });
        }
      } else {
        this.snackbarMsg = 'One or more fields were filled out incorrectly';
        this.snackbar = true;
      }
    }
  },
  apollo: {
    member: {
      query: GET_MEMBERS,
      variables() {
        return {
          input: {
            ids: [this.memberId]
          }
        };
      },
      update({ members }) {
        const editMember = members.nodes[0];
        this.editMember = { ...editMember };
        this.originalSlug = this.editMember.slug;

        const form = this.$refs.informationForm
        form.resetValidation && form.resetValidation()

        return editMember;
      }
    }
  },
  computed: {
    memberId() {
      return this.$store.state.user.principal.memberId
    },
    getAvatar() {
      return (
        this.editMember.profileUrl ||
        'http://res.cloudinary.com/hexly/image/upload/dev/1001/avatar/undefined.jpg'
      );
    }
  }
};
</script>

<style scoped>
.image {
  width: 100%;
}
</style>
