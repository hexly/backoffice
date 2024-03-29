<template>
  <v-content>
    <v-container fluid align-center justify-center style="display:flex;height: 95%;">
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md8>
          <v-card class="elevation-12">
            <v-card-text>
              <img v-if="$tenantInfo.logoLoginPath" class="logo" :src="$tenantInfo.logoLoginPath" />
              <h1 class="logo text-center heading" v-else>{{$tenantInfo.name}}</h1>
              <v-alert type="error" :value="!!error">{{error}}</v-alert>
              <v-alert type="error" :value="!!errMsg">{{errMsg}}</v-alert>
              <v-alert color="primary" :value="!!success">{{success}}</v-alert>
              <div v-if="type === 'login'">
                <v-form ref="login" @submit.prevent="onLogin" lazy-validation>
                  <v-text-field
                    data-cy="Username Login Page"
                    required
                    :rules="[v => !!v || 'Field is required']"
                    v-model="form.email"
                    prepend-icon="person"
                    name="email"
                    label="Username"
                    type="email"
                    autocomplete="email"
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
                    autocomplete="password"
                  ></v-text-field>
                  <v-card-actions>
                    <v-layout row wrap justify-space-between>
                      <v-flex xs12 sm6 class="py-2 text-center text-sm-left">
                        <div>
                          <span>
                            Forgot your Password?
                            <a @click="changeMode('reset')">Reset Password</a>
                          </span>
                        </div>
                      </v-flex>
                      <v-flex xs12 sm6 class="py-2 text-center text-sm-right">
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
              <div v-if="type === 'reset'">
                <v-form ref="reset" @submit.prevent="onReset" lazy-validation>
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
                    <v-btn :loading="buttonLoading" type="submit" color="primary" dark>Reset</v-btn>
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
import { mapActions } from 'vuex'
import { UserActions } from '@/stores/UserStore'
import { ClaimActions } from '@/stores/ClaimStore'
import { delay } from '@/utils/timer.js'
import { pathOr } from 'rambda'

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
  props: {
    errMsg: String
  },
  methods: {
    ...mapActions({
      claim: ClaimActions.CLAIM,
      reset: ClaimActions.RESET,
      login: UserActions.LOGIN
    }),
    async onLogin () {
      const formValidated = this.$refs.login.validate()
      if (!formValidated) {
        return
      }
      this.buttonLoading = true

      const { email, password } = this.form
      const { $tenantId: tenantId } = this

      try {
        await this.login({ email, password, tenantId })
      } catch (err) {
        console.error(err)
        this.buttonLoading = false
        this.onError(err.message)
      }

      this.buttonLoading = false
      this.$router.push('/dashboard')
    },
    changeMode (type) {
      this.error = null
      this.success = null
      this.type = type
    },
    async onReset () {
      this.error = null
      this.buttonLoading = true
      try {
        await this.reset({
          email: this.form.email,
          tenantId: this.$tenantId,
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
      } else if (errorMessage instanceof Error) {
        this.error = errorMessage.message
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
  margin: 15px 5px;
}
.success {
  margin: 15px 5px;
}
.version {
  opacity: 0.3;
  color: #fff;
  padding: 5px;
}
</style>
