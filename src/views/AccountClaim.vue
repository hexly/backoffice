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
              <img class="logo" :src="logoPath"/>
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
                    label="Store Name"
                    v-model="editMember.slug"
                    :rules="slugRule"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="username"
                    v-model="editMember.username"
                    disabled
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
                  <v-select
                    v-model="editMember.legal_locale_id"
                    label="Select your locale"
                    :rules="requiredRule"
                    :items="settings.legalLocales"
                    item-text="name"
                    item-value="id"
                  />
                  <v-select
                    v-model="editMember.language_id"
                    label="Select your locale"
                    :rules="requiredRule"
                    :items="settings.languages"
                    item-text="name"
                    item-value="id"
                  />
                  <v-select
                    v-model="editMember.timezone_id"
                    label="Select your timezone"
                    :rules="requiredRule"
                    :items="settings.timezones"
                    item-text="name"
                    item-value="id"
                    autocomplete
                  />
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
import tenantInfo from '@/tenant.js'
import { ClaimActions } from '@/stores/ClaimStore'
import getLocalSettings from '@/graphql/GetLocalSettings'

export default {
  data() {
    return {
      loading: true,
      visible: false,
      error: null,
      requiredRule: [v => !!v || 'Field is required'],
      slugRule: [
        v => !!v || 'Field is required',
        v =>
          (v && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) ||
          'Store name must not have spaces, special characters, nor capital letters',
        v => (v && v.length <= 20) || 'Slug must be 20 or less characters'
      ],
      passwordRule: [
        v => !!v || 'Field is required',
        v => (v && v.length > 8) || 'Password must be more than 8 characters'
      ],
      editMember: {
        credential_id: null,
        password: null,
        member_id: null,
        name: null,
        slug: null,
        display_name: null,
        contact_email: null,
        legal_locale_id: null,
        language_id: null,
        timezone_id: null,
        username: null
      },
      settings: {},
      logoPath: tenantInfo.logoPath
    }
  },
  async beforeCreate() {
    // Fetch one time token information
    try {
      const { data } = await this.$store.dispatch(
        ClaimActions.GET_TOKEN,
        this.$route.params.token
      )
      const member = data.members[0]
      this.editMember = {
        ...member,
        member_id: member.id,
        username: data.username,
        credential_id: data.credential_id
      }
      this.loading = false
    } catch (err) {
      console.log('ERROR getting token', err)
      this.$router.push('/login')
    }
  },
  apollo: {
    settings: getLocalSettings()
  },
  methods: {
    async onSubmit() {
      if (this.$refs.claim.validate()) {
        // Post to create account
        await this.$store.dispatch(ClaimActions.CONSUME_TOKEN, {
          token: this.$route.params.token,
          member: this.editMember
        })
        this.$router.push('/login')
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
