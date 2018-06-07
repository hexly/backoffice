<template>
  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md8>
          <v-card class="elevation-12">
            <v-toolbar dark color="black">
              <v-toolbar-title>{{title}} Login</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <img class="logo" :src="logoPath"/>
              <h2 class="error" v-if="error">{{error}}</h2>
              <h2 class="success" v-if="success">{{success}}</h2>
              <div v-if="type === 'login'">
                <v-form ref="login" @submit.prevent="onLogin" lazy-validation>
                  <v-text-field required :rules="[v => !!v || 'Field is required']" v-model="form.email" prepend-icon="person" name="email" label="Username" type="email"></v-text-field>
                  <v-text-field required :rules="[v => !!v || 'Field is required']" v-model="form.password" prepend-icon="lock" name="password" label="Password" id="password" type="password"></v-text-field>
                  <v-card-actions>
                    <div>
                      <span>Need access to your account?<a @click="changeMode('register')"> Register</a></span>
                      <br/>
                      <span>Forgot your Password?<a @click="changeMode('reset')"> Reset Password</a></span>
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn :loading="buttonLoading" type="submit" color="deep-purple" dark>Login</v-btn>
                  </v-card-actions>
                </v-form>
              </div>
              <div v-if="type === 'register'">
                <v-form ref="register" @submit.prevent="onRegister" lazy-validation>
                  <v-text-field required :rules="[v => !!v || 'Field is required']" v-model="form.email" prepend-icon="person" name="email" label="Email" type="email"></v-text-field>
                  <v-card-actions>
                    <div>
                      <span>Already have an account?<a @click="changeMode('login')"> Login</a></span>
                      <br/>
                      <span>Forgot your Password?<a @click="changeMode('reset')"> Reset Password</a></span>
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn :loading="buttonLoading" type="submit" color="deep-purple" dark>Register</v-btn>
                  </v-card-actions>
                </v-form>
              </div>
              <div v-if="type === 'reset'">
                <v-form ref="reset" @submit.prevent="onReset" lazy-validation>
                  <v-text-field required :rules="[v => !!v || 'Field is required']" v-model="form.email" prepend-icon="person" name="email" label="Email" type="email"></v-text-field>
                  <v-card-actions>
                    <span>Remembered your password?<a @click="changeMode('login')"> Login</a></span>
                    <v-spacer></v-spacer>
                    <v-btn :loading="buttonLoading" type="submit" color="deep-purple" dark>Reset</v-btn>
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
import AUTHENTICATE_MUTATION from '../graphql/Authenticate.gql'
import { UserActions, UserMutations } from '@/stores/UserStore'
import { ClaimActions } from '@/stores/ClaimStore'
import { delay } from '@/utils/timer.js'
import pathOr from 'rambda/lib/pathOr'

export default {
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      title: tenantInfo.name,
      logoPath: tenantInfo.logoPath,
      type: 'login',
      error: null,
      success: null,
      buttonLoading: false
    }
  },
  methods: {
    onLogin() {
      this.error = null
      this.buttonLoading = true
      if (this.$refs.login.validate()) {
        this.$apollo.mutate({
          mutation: AUTHENTICATE_MUTATION,
          variables: {
            authInput: {
              tenantId: process.env.VUE_APP_TENANT_ID,
              username: this.form.email,
              password: this.form.password,
              memberId: null
            }
          },
          update: async (store, { data: { authenticate: { jwtToken } } }) => {
            if (jwtToken) {
              this.$store.commit(UserMutations.SET_JWT, jwtToken)
              await this.$store.dispatch(UserActions.LOGIN_SUCCESS)
              this.$router.push('/dashboard')
            } else {
              this.onError('Invalid Username/Password.')
            }
            this.buttonLoading = false
          }
        })
      } else {
        this.onError('Invalid Username/Password.')
        this.buttonLoading = false
      }
    },
    changeMode(type) {
      this.error = null
      this.success = null
      this.type = type
    },
    async onRegister() {
      this.buttonLoading = true
      this.error = null
      try {
        await this.$store.dispatch(ClaimActions.CLAIM, this.form.email)
        this.onSuccess(
          'Registrations email has been sent! Please check your email.'
        )
      } catch (error) {
        this.onError(error)
      }
      this.buttonLoading = false
    },
    async onReset() {
      this.error = null
      this.buttonLoading = true
      try {
        await this.$store.dispatch(ClaimActions.RESET, this.form.email)
        this.onSuccess(
          'Password reset email has been sent! Please check your email.'
        )
      } catch (error) {
        this.onError(error)
      }
      this.buttonLoading = false
    },
    async onSuccess(message) {
      this.success = message
      await delay(7000)
      this.success = null
      this.type = 'login'
    },
    onError(errorMessage) {
      if (typeof errorMessage === 'string') {
        this.error = errorMessage
      } else {
        const errors = pathOr({}, 'response.data.errors', errorMessage)
        this.error = pathOr(
          'There seems to be a problem. Please try again later or contact customer support.',
          ['message'],
          errors[0]
        )
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

.error {
  margin: 5px;
  padding: 10px;
  text-align: center;
}
.success {
  margin: 5px;
  padding: 10px;
  text-align: center;
}
</style>
