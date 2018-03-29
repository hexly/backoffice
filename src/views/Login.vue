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
              {{sellerId}}
              <span v-if="allSales">{{allSales.nodes[0].totalAmount}}</span>
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
import SALES_QUERY from '../graphql/Sales.gql'

export default {
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loginError: null,
      sellerId: 45,
      allSales: null
    }
  },
  apollo: {
    allSales: {
      query: SALES_QUERY,
      variables() {
        return {
          saleCondition: {
            sellerId: this.sellerId
          }
        }
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
              pTenantId: 1001,
              pUsername: this.form.email,
              pPassword: this.form.password
            }
          },
          update: (store, { data: { authenticate } }) => {
            if (authenticate.jwtToken) {
              console.log('Setting JWT', authenticate.jwtToken)
              localStorage.setItem('apollo-token', authenticate.jwtToken)
              this.sellerId = 46
              // this.state.dispatch('LOGIN_SUCCESS')
            } else {
              this.loginError = 'Invalid Username/Password.'
            }
            console.log('AUTH DONE', authenticate, store)
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
