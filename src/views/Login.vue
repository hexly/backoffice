<template>
  <v-content>
    <v-container
      fluid
      align-center
      justify-center
      style="display:flex;height: 95%;"
    >
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md8>
          <v-card class="elevation-12">
            <v-card-text>
              <img class="logo" :src="$tenantInfo.logoLoginPath" />
              <h2 class="error" v-if="error">{{error}}</h2>
              <h2 class="success" v-if="success">{{success}}</h2>
              <div v-if="type === 'login'">
                <v-form
                  ref="login"
                  @submit.prevent="onLogin"
                  lazy-validation
                >
                  <v-text-field
                    data-cy="Username Login Page"
                    required
                    :rules="[v => !!v || 'Field is required']"
                    v-model="form.email"
                    prepend-icon="person"
                    name="email"
                    label="Username"
                    type="email"
                  ></v-text-field>
                  <v-text-field
                    data-cy="Password Login Page"
                    required
                    :rules="[v => !!v || 'Field is required']"
                    v-model="form.password"
                    prepend-icon="lock"
                    name="password"
                    label="Password"
                    id="password"
                    type="password"
                  ></v-text-field>
                  <v-card-actions>
                    <v-layout row wrap justify-space-between>
                      <v-flex xs12 sm6 class="py-2 text-xs-center text-sm-left">
                        <div>
                          <span>
                            Need access to your account?
                            <a @click="changeMode('register')">Register</a>
                          </span>
                          <br>
                          <span>
                            Forgot your Password?
                            <a @click="changeMode('reset')">Reset Password</a>
                          </span>
                        </div>
                      </v-flex>
                      <v-flex xs12 sm6 class="py-2 text-xs-center text-sm-right">
                        <v-btn
                          data-cy="Login Login Page"
                          :loading="buttonLoading"
                          type="submit"
                          color="primary"
                          dark
                        >Login</v-btn>
                      </v-flex>
                    </v-layout>
                  </v-card-actions>
                </v-form>
              </div>
              <div v-if="type === 'register'">
                <v-form
                  ref="register"
                  @submit.prevent="onRegister"
                  lazy-validation
                >
                  <v-text-field
                    required
                    :rules="[v => !!v || 'Field is required']"
                    v-model="form.email"
                    prepend-icon="person"
                    name="email"
                    label="Email"
                    type="email"
                  ></v-text-field>
                  <v-card-actions>
                    <div>
                      <span>
                        Already have an account?
                        <a @click="changeMode('login')">Login</a>
                      </span>
                      <br>
                      <span>
                        Forgot your Password?
                        <a @click="changeMode('reset')">Reset Password</a>
                      </span>
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn
                      :loading="buttonLoading"
                      type="submit"
                      color="deep-purple"
                      dark
                    >Register</v-btn>
                  </v-card-actions>
                </v-form>
              </div>
              <div v-if="type === 'reset'">
                <v-form
                  ref="reset"
                  @submit.prevent="onReset"
                  lazy-validation
                >
                  <v-text-field
                    required
                    :rules="[v => !!v || 'Field is required']"
                    v-model="form.email"
                    prepend-icon="person"
                    name="email"
                    label="Email"
                    type="email"
                  ></v-text-field>
                  <v-card-actions>
                    <span>
                      Remembered your password?
                      <a @click="changeMode('login')">Login</a>
                    </span>
                    <v-spacer></v-spacer>
                    <v-btn
                      :loading="buttonLoading"
                      type="submit"
                      color="deep-purple"
                      dark
                    >Reset</v-btn>
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

/* global VERSION */
import { UserActions } from '@/stores/UserStore'
import { ClaimActions } from '@/stores/ClaimStore'
import { delay } from '@/utils/timer.js'
import pathOr from 'rambda/lib/pathOr'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'Foobar',
  data () {
    return {
      form: {
        email: '',
        password: ''
      },
      type: 'login',
      error: null,
      success: null,
      buttonLoading: false,
      version: VERSION
    }
  },
  methods: {
    async onLogin () {
      this.error = null
      try {
        this.$refs.login.validate()
        this.buttonLoading = true

        const { success } = await this.$store.dispatch(UserActions.LOGIN, {
          username: this.form.email,
          password: this.form.password,
          tenantId
        })

        this.buttonLoading = false
        const { returnTo } = (this.$route.query || {})
        return success
          ? this.$router.push(returnTo || '/dashboard')
          : this.onError('Invalid Username/Password.')
      } catch (error) {
        this.buttonLoading = false
        this.onError(error.message)
      }
    },
    changeMode (type) {
      this.error = null
      this.success = null
      this.type = type
    },
    async onRegister () {
      this.buttonLoading = true
      this.error = null
      try {
        await this.$store.dispatch(ClaimActions.CLAIM, {
          email: this.form.email,
          tenantId,
          type: 'claim'
        })
        this.onSuccess(
          'Registrations email has been sent! Please check your email.'
        )
      } catch (error) {
        this.onError(error)
      }
      this.buttonLoading = false
    },
    async onReset () {
      this.error = null
      this.buttonLoading = true
      try {
        await this.$store.dispatch(ClaimActions.RESET, {
          email: this.form.email,
          tenantId,
          type: 'reset'
        })
        this.onSuccess(
          'Password reset email has been sent! Please check your email.'
        )
      } catch (error) {
        this.onError(error)
      }
      this.buttonLoading = false
    },
    async onSuccess (message) {
      this.success = message
      await delay(7000)
      this.success = null
      this.type = 'login'
    },
    onError (errorMessage) {
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

.logo {
  width: 100%;
  max-width: 450px;
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
.version {
  opacity: 0.3;
  color: #fff;
  padding: 5px;
}
</style>
