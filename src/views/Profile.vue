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
                <v-dialog
                  ref="dialog"
                  v-model="modal"
                  :return-value.sync="editMember.birthdate"
                  lazy
                  full-width
                  width="290px"
                >
                  <v-text-field
                    slot="activator"
                    :rules="birthdateRule"
                    v-model="editMember.birthdate"
                    label="Date of Birth"
                    prepend-icon="event"
                    readonly
                  ></v-text-field>
                  <v-date-picker
                    ref="picker"
                    color="green lighten-1"
                    v-model="editMember.birthdate"
                    :reactive="true"
                    :max="moment().format('YYYY-MM-DD')"
                    min="1950-01-01"
                    @change="saveDate"
                  ></v-date-picker>
                </v-dialog>

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
                @click="saveData"
              >Save Information</v-btn>
            </v-tab-item>

            <v-tab-item value="address">
              <h2>Your Address</h2>
              <AddressForm
                @addressSnackBarEmitSuccess="addressSnackBarEmitSuccess"
                @addressSnackBarEmitError="addressSnackBarEmitError"
              />
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
    <v-snackbar
      :timeout="6000"
      :top="true"
      :right="false"
      :color="snackBarColor"
      v-model="snackbar"
      :multi-line="true"
    >
      <div style="color: white;">{{snackbarMsg}}</div>
      <v-btn flat color="white" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import AddressForm from "@/components/AddressForm.vue";
import GET_MEMBERS from "@/graphql/GetMembers.gql";
import UPDATE_PROFILE from "@/graphql/MemberPartialUpdate.gql";
import CHECK_IF_UNIQUE_SLUG from "@/graphql/Slug.gql";
import Rules from "./Rules.js";
import { Actions } from "@/store";
var moment = require("moment");

const ERROR_COLOR = 'red',
  SUCCESS_COLOR = 'purple'


export default {
  components: {
    AddressForm
  },
  data: () => ({
    modal: false,
    moment,
    visible: false,
    password: "",
    newPassword: "",
    snackbar: false,
    snackbarMsg: "",
    snackBarColor: null,
    slugRule: Rules.slugRule,
    birthdateRule: Rules.birthdateRule,
    uploadFileName: null,
    isUploading: false,
    isSaving: false,
    slugIsUnique: true,
    slugErrors: [],
    editMember: {
      id: "",
      name: "",
      displayName: "",
      email: "",
      profileUrl: "",
      slug: "",
      birthdate: ""
    },
    originalSlug: undefined,
    saving: false
  }),
  methods: {
    async filesChange(files) {
      try {
        const file = files[0];
        this.isSaving = true;
        this.isUploading = true;
        const { data } = await this.$store.dispatch(Actions.AVATAR_UPLOAD, {
          file
        });
        this.isFalse = false;
        this.isUploading = false;
        this.isSaving = false;
        this.snackBarColor = SUCCESS_COLOR;
        this.editMember.profileUrl = data.secure_url;
        this.saveData();
      } catch (err) {
        this.isFalse = false;
        this.isUploading = false;
        this.isSaving = false;
        console.log('error uploading file', { err });
        this.snackbarMsg = 'Error uploading file';
        this.snackBarColor = ERROR_COLOR;
        this.snackbar = true;
      }

    },
    slugChanged() {
      this.slugErrors = [];
      this.editMember.slug = this.editMember.slug.toLowerCase();
    },
    async saveData() {
      this.slugIsUnique = true; // reset to default state
      const formIsValid = this.$refs.informationForm.validate();
      let response;
      if (formIsValid) {
        // Slug uniqueness query
        try {
          response = await this.$apollo.query({
            query: CHECK_IF_UNIQUE_SLUG,
            variables: {
              input: {
                tenantId: this.tenantId,
                slugs: [this.editMember.slug]
              }
            }
          });
        } catch (err) {
          console.log('error checking slugs', { err });
          this.snackbarMsg = 'Unable to save profile data';
          this.snackBarColor = ERROR_COLOR;
          this.snackbar = true;
        }

        if (response) {
          const { membersBySlugs = [] } = response.data;
          this.slugErrors = [];
          if (membersBySlugs.find(e => e.id !== this.memberId)) {
            this.slugIsUnique = false;
            this.snackBarColor = ERROR_COLOR;
            this.snackbarMsg = "Chosen store name is unavailable!";
            this.snackbar = true;
            this.slugErrors.push(
              `The store name ${this.editMember.slug} is unavailable`
            );
          }
          if (this.slugIsUnique) {
            this.saving = true;
            const sentSlug = !this.originalSlug
              ? this.editMember.slug
              : this.originalSlug;
            try {
              await this.$apollo.mutate({
                mutation: UPDATE_PROFILE,
                variables: {
                  input: {
                    id: this.editMember.id,
                    name: this.editMember.name,
                    displayName: this.editMember.displayName,
                    contactEmail: this.editMember.email,
                    profileUrl: this.editMember.profileUrl,
                    slug: sentSlug,
                    birthday: this.editMember.birthdate
                  }
                },
                update: (store, response) => {
                  this.saving = false;
                  this.snackBarColor = SUCCESS_COLOR;
                  this.snackbarMsg = "Information Saved";
                  this.snackbar = true;
                  this.originalSlug = this.editMember.slug;
                }
              });
            } catch (err) {
              console.log({ err });
              this.saving = false
              this.snackbarMsg = "Profile update was unsuccessful";
              this.snackBarColor = ERROR_COLOR;
              this.snackbar = true;
            }
          }
        }
      } else {
        this.snackbarMsg = "One or more fields were filled out incorrectly";
        this.snackBarColor = ERROR_COLOR;
        this.snackbar = true;
      }
    },
    saveDate(date) {
      this.$refs.dialog.save(date);
    },
    addressSnackBarEmitSuccess(e) {

      this.snackbarMsg = e;
      this.snackBarColor = SUCCESS_COLOR;
      this.snackbar = true;
    },
    addressSnackBarEmitError(e) {
      this.snackbarMsg = e;
      this.snackBarColor = ERROR_COLOR;
      this.snackbar = true;
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
        }
      },
      update({ members }) {
        // If graphql query succeeds
        if (members) {
          const editMember = members.nodes[0];
          this.editMember = { ...editMember };

          const receivedSlugIsValid = /^[a-zA-Z0-9]+(?:-[a-z0-9]+)*$/.exec(
            this.editMember.slug
          );
          if (receivedSlugIsValid) {
            this.originalSlug = receivedSlugIsValid[0];
          } else {
            console.log("receivedSlugIsValid not a valid slug");
            this.originalSlug = this.editMember.slug = null;
          }

          return editMember;
        } else {
          this.snackbarMsg = "Could not retrieve profile data";
          this.snackBarColor = ERROR_COLOR;
          this.snackbar = true;
        }
      }
    }
  },
  watch: {
    modal(val) {
      val && this.$nextTick(() => (this.$refs.picker.activePicker = "YEAR"));
    }
  },
  computed: {
    memberId() {
      return this.$store.state.user.principal.memberId;
    },
    tenantId() {
      return this.$store.state.user.principal.tenantId || ~~process.env.VUE_APP_TENANT_ID;
    },
    getAvatar() {
      return (
        this.editMember.profileUrl ||
        "http://res.cloudinary.com/hexly/image/upload/dev/1001/avatar/undefined.jpg"
      );
    }
  }
}
</script>

<style scoped>
.image {
  width: 100%;
}
</style>
