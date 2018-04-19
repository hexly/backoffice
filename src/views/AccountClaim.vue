<template>
  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md8>
          <v-card class="elevation-12">
            <v-toolbar dark color="black">
              <v-toolbar-title>Account Creation</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <img class="logo" src="../assets/logo.png"/>
              <div class="center" v-if="loading">
                <v-progress-circular indeterminate :size="70" :width="7" color="black"></v-progress-circular>
                <p>We are reteiving your information, please hold.</p>
              </div>
              <div class="center" v-if="!loading">
                <p>Welcome! Please fill out the following information to setup your account.</p>
                <v-form ref="claim" @submit.prevent="onSubmit" lazy-validation>
                  <v-text-field
                    label="Name"
                    v-model="editMember.name"
                    :rules="requiredRule"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="E-mail"
                    v-model="editMember.contact_email"
                    :rules="requiredRule"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="Display name"
                    v-model="editMember.display_name"
                    :rules="requiredRule"
                    required
                  ></v-text-field>
                  <v-text-field
                    name="password"
                    label="Enter your password"
                    hint="At least 8 characters"
                    v-model="editMember.password"
                    min="8"
                    :rules="passwordRule"
                    :append-icon="visible ? 'visibility_off' : 'visibility'"
                    :append-icon-cb="() => (visible = !visible)"
                    :type="visible ? 'text' : 'password'"
                  ></v-text-field>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn type="submit" color="deep-purple" dark>Create Account</v-btn>
                  </v-card-actions>
                </v-form>
              </div>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
import { ClaimActions } from '@/stores/ClaimStore'

export default {
  data() {
    return {
      loading: false,
      visible: false,
      requiredRule: [v => !!v || 'Field is required'],
      passwordRule: [
        v => !!v || 'Field is required',
        v => (v && v.length > 8) || 'Password must be more than 8 characters'
      ],
      editMember: {
        member_id: '',
        name: '',
        display_name: '',
        contact_email: '',
        password: '',
        legal_locale: '',
        language: '',
        timezone: ''
      }
    }
  },
  async beforeCreate() {
    // Fetch one time token information
    const { data } = await this.$store.dispatch(
      ClaimActions.GET_TOKEN,
      this.$route.params.token
    )
    this.editMember = { ...data.members[0] }
  },
  methods: {
    async onSubmit() {
      console.log(this.$refs.claim.validate())
      if (this.$refs.claim.validate()) {
        // Post to create account
        await this.$store.dispatch(ClaimActions.CONSUME_TOKEN, {
          token: this.$route.params.token,
          member: this.editMember
        })
      } else {
        console.log('Error in form')
      }
    }
  }
}
</script>

<style scoped>
.box-card {
  width: 480px;
  margin: auto;
}

.logo {
  width: 100%;
  max-width: 250px;
  margin: auto;
  display: block;
}

.center {
  text-align: center;
}
</style>
