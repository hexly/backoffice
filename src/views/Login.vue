<template>
  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md8>
          <v-card v-if="!register" class="elevation-12">
            <v-toolbar dark color="black">
              <v-toolbar-title>{{title}} Login</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <img class="logo" :src="logoPath"/>
              <h2 class="error" v-if="error">{{error}}</h2>
              <v-form ref="login" @submit.prevent="onLogin" lazy-validation>
                <v-text-field required :rules="[v => !!v || 'Field is required']" v-model="form.email" prepend-icon="person" name="email" label="Username" type="email"></v-text-field>
                <v-text-field required :rules="[v => !!v || 'Field is required']" v-model="form.password" prepend-icon="lock" name="password" label="Password" id="password" type="password"></v-text-field>
                <v-card-actions>
                  <span>Need access to your account?<a @click="changeMode"> Register</a></span>
                  <v-spacer></v-spacer>
                  <v-btn type="submit" color="deep-purple" dark>Login</v-btn>
                </v-card-actions>
              </v-form>
            </v-card-text>
          </v-card>
          <v-card v-if="register" class="elevation-12">
            <v-toolbar dark color="black">
              <v-toolbar-title>{{title}} Register</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <img class="logo" :src="logoPath"/>
              <h2 class="error" v-if="error">{{error}}</h2>
              <h2 class="success" v-if="emailSentSuccess">An email has been succesfully sent!</h2>
              <v-form ref="register" @submit.prevent="onRegister" lazy-validation>
                <v-text-field required :rules="[v => !!v || 'Field is required']" v-model="form.email" prepend-icon="person" name="email" label="Email" type="email"></v-text-field>
                <v-card-actions>
                  <span>Already have an account?<a @click="changeMode"> Login</a></span>
                  <v-spacer></v-spacer>
                  <v-btn type="submit" color="deep-purple" dark>Register</v-btn>
                </v-card-actions>
              </v-form>
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

export default {
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      title: tenantInfo.name,
      logoPath: tenantInfo.logoPath,
      register: false,
      error: null,
      emailSentSuccess: false
    }
  },
  methods: {
    onLogin() {
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
              this.error = 'Invalid Username/Password.'
            }
          }
        })
      } else {
        console.log('Error in form')
      }
    },
    changeMode() {
      this.error = null
      this.emailSentSuccess = false
      this.register = !this.register
    },
    async onRegister() {
      try {
        await this.$store.dispatch(ClaimActions.CLAIM, this.form.email)
        this.emailSentSuccess = true
      } catch (error) {
        // this.error = error
        this.error =
          'There seems to be a problem. Please try again later or contact customer support.'
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
