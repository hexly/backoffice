<template>
    <div class="stripe-connect-integration">
    <h2>
      Stripe Connect
    </h2>
    <h3> Stripe Connect provides {{tenant.name}} the ability to send money directly to your bank account. </h3>
    <v-alert type="error" :value="error">
      {{error}}
    </v-alert>
    <div v-if="!integrationDetails && !loading && !setup">
      <p> It looks like you do not yet have Stripe configured.
        <br/>
        Please click the button below to begin your account setup! </p>
      <v-btn @click="beginSetup" color="primary">
        Setup Account
      </v-btn>
    </div>
    <div v-if="!loading && setup">
        <h3>Account Setup</h3>
        <p>Please enter the following information</p>
        <v-form @submit.prevent="setupStripe" width="500">
          <v-text-field
            label="First Name"
            v-model="firstName"
            type="text"
            :rules="rules.required"/>
          <v-text-field
            label="Last Name"
            v-model="lastName"
            type="text"
            :rules="rules.required"/>
          <v-text-field
            label="Date of Birth"
            v-model="birthdate"
            placeholder="MM/DD/YYYY"
            :rules="rules.birthdateRule"/>
          <v-text-field
            label="SSN Last Four"
            v-model="ssnLastFour"
            type="text"
            validate-on-blur
            :rules="rules.ssnLastFourRule"/>
          <v-text-field
            label="Bank Account Number"
            v-model="accountNumber"
            type="text"
            :rules="rules.required"/>
          <v-text-field
            label="Routing Number"
            v-model="routingNumber"
            type="text"
            :rules="rules.required"/>
          <v-btn type="submit" color="primary">
            Create Account
          </v-btn>
        </v-form>
      </div>
    <div v-if="integrationDetails">
      <p>Your account has been created</p>
      <v-btn target="_blank" href="" color="primary">
        Send to Zendesk?
      </v-btn>
    </div>
  </div>
</template>

<script>

import Rules from '@/views/Rules.js'
import { mapState } from 'vuex'

export default {
  name: 'StripeIntegration',
  data() {
    return {
      loading: false,
      integrationDetails: null,
      setup: false,
      password: null,
      rules: Rules,
      firstName: "",
      lastName: "",
      birthdate: "",
      accountNumber: "",
      routingNumber: "",
      ssnLastFour: ""
    }
  },
  mounted() {
    this.loading = true
    this.reload()
    this.loading = false
  },
  methods: {
    beginSetup() {
      this.setup = true
    },
    setupStripe() {
      this.$emit('create', {
        command: 'stripe_connect',
        tenantIntegrationId: this.details.id,
        data: {
          password: this.password,
          email: this.member.contacts[0].emails[0].email,
          firstName: this.member.firstName,
          lastName: this.member.lastName,
          birthdate: this.member.birthdate
        }
      })
    },
    reload() {
      this.integrations.forEach(i => {
        if (i.key === 'stripe_connect') {
          this.setup = false
          this.integrationDetails = i
        }
      })
      this.firstName = this.member.firstName
      this.lastName = this.member.lastName
      this.birthdate = this.$moment(this.member.birthdate, 'YYYY-MM-DD').format('MM/DD/YYYY')
      console.log(this.member)
    }
  },
  computed: {
    ...mapState({
      member: state => state.user.principal.member,
      integrations: state => state.user.principal.member.tenantIntegrations,
      tenant: state => state.user.principal.tenant
    })
  }
}
</script>

<style>
.stripe-connect-integration{
  width: 100%;
  max-width: 500px;
  margin: auto;
}
</style>