<template>
  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-toolbar dark color="black">
              <v-toolbar-title>Login</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <img class="logo" src="../assets/logo.png"/>
              <h2 v-if="$store.state.user.loginError">{{$store.state.user.loginError}}</h2>
              <v-form ref="login" @submit.prevent="onSubmit()">
                <v-text-field required v-model="form.email" prepend-icon="person" name="login" label="Login" type="email"></v-text-field>
                <v-text-field required v-model="form.password" prepend-icon="lock" name="password" label="Password" id="password" type="password"></v-text-field>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn type="submit" color="deep-purple" dark>Login</v-btn>
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
import AUTHENTICATE_MUTATION from '../graphql/Authenticate.gql'
import { UserActions, UserMutations } from '@/stores/UserStore'

export default {
  data() {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    onSubmit() {
      if (this.$refs.login.validate()) {
        this.$apollo.mutate({
          mutation: AUTHENTICATE_MUTATION,
          variables: {
            authInput: {
              tenantId: process.env.VUE_APP_TENANT_ID,
              username: this.form.email,
              password: this.form.password
            }
          },
          update: async (store, { data: { authenticate: { jwtToken } } }) => {
            if (jwtToken) {
              this.$store.commit(UserMutations.SET_JWT, jwtToken)
              await this.$store.dispatch(UserActions.LOGIN_SUCCESS)
              this.$router.push('/home')
            } else {
              this.$store.commit(
                UserMutations.LOGIN_ERROR,
                'Invalid Username/Password.'
              )
            }
          }
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
</style>
