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
              <div class="center">
                <p>Fill our the form to finish resetting your password</p>
                <v-form ref="claim" @submit.prevent="onSubmit" lazy-validation>
                  <v-text-field required :rules="requiredRule" v-model="username" prepend-icon="person" name="username" label="Username" type="email"></v-text-field>
                  <v-text-field required :rules="passwordRule" v-model="password" prepend-icon="lock" name="password" label="Password" id="password" type="password"></v-text-field>
                  <v-text-field required :rules="confirmPasswordRule" v-model="confirmPassword" prepend-icon="lock" name="confirmPassword" label="Confirm Password" id="confirmPassword" type="password"></v-text-field>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn type="submit" color="deep-purple" dark>Reset Password</v-btn>
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

export default {
  data () {
    const { email } = this.$route.params
    return {
      username: email || null,
      password: null,
      confirmPassword: null,
      loading: true,
      visible: false,
      error: null,
      requiredRule: [v => !!v || 'Field is required'],
      passwordRule: [
        v => !!v || 'Field is required',
        v => (v && v.length > 8) || 'Password must be more than 8 characters'
      ],
      confirmPasswordRule: [
        v => !!v || 'Field is required',
        v => {
          if (v !== this.password) return 'Passwords must match'
          return true
        }
      ],
      logoPath: tenantInfo.logoPath
    }
  },
  methods: {
    async onSubmit () {
      if (this.$refs.claim.validate()) {
        const { token } = this.$route.params
        const { confirmPassword, password, username } = this
        const input = { confirmPassword, password, token, username }
        await this.$store.dispatch(ClaimActions.RESET_PASSWORD, input)
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
