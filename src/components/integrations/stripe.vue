<template>
    <div class="stripe-connect-integration">
    <h2>
      Stripe Connect
    </h2>
    <h3> Stripe Connect provides {{tenant.name}} the ability to send money directly to your bank account. </h3>
    <v-alert type="error" :value="(error || localError)">
      {{error || localError}}
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
        <v-form @submit.prevent="setupStripe" ref="informationForm" width="500">
          <v-text-field
            label="First Name"
            v-model="firstName"
            type="text"
            :rules="rules.requiredRule"/>
          <v-text-field
            label="Last Name"
            v-model="lastName"
            type="text"
            :rules="rules.requiredRule"/>
          <v-text-field
            ref="dobInput"
            :error="dobError"
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
            :rules="rules.requiredRule"/>
          <v-text-field
            label="Routing Number"
            v-model="routingNumber"
            type="text"
            validate-on-blur
            :rules="rules.routingNumberRule"/>
          <v-checkbox
            v-model="stripeToS"
            :rules="rules.requiredRule">
            <div slot="label">
              I agree to the Stripe <a href='https://stripe.com/connect-account/legal' target="_blank">Terms of Service</a>
            </div>
          </v-checkbox>
          <v-btn :loading="attemptingStripeSetup" :disabled="attemptingStripeSetup" type="submit" color="primary">
            Create Account
          </v-btn>
        </v-form>
      </div>
    <div v-if="integrationDetails">
      <p>Your stripe account has been created!</p>
    </div>
  </div>
</template>

<script>

import Rules from '@/views/Rules.js'
import { mapState } from 'vuex'

export default {
  name: 'StripeIntegration',
  props: {
    details: Object,
    error: String
  },
  data() {
    return {
      loading: false,
      integrationDetails: null,
      setup: false,
      password: null,
      rules: Rules,
      firstName: '',
      lastName: '',
      birthdate: '',
      accountNumber: '',
      routingNumber: '',
      ssnLastFour: '',
      stripeToS: false,
      localError: '',
      attemptingStripeSetup: false,
      dobError: false
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
    accountToken({ stripe }) {
      const bdate = this.$moment(this.birthdate, 'MM/DD/YYYY')
      try {
        return stripe.createToken('account', {
          business_type: 'individual',
          individual: {
            first_name: this.firstName,
            last_name: this.lastName,
            dob: {
              day: bdate.date(),
              month: bdate.month(),
              year: bdate.year()
            },
            ssn_last_4: this.ssnLastFour
          },
          tos_shown_and_accepted: true
        })
      } catch (e) {
        console.warn('account error!', e)
        throw new Error(e)
      }
    },
    bankToken({ stripe }) {
      try {
        return stripe.createToken('bank_account', {
          bank_account: {
            country: 'US',
            currency: 'usd',
            account_holder_type: 'individual',
            routing_number: this.routingNumber,
            account_number: this.accountNumber
          }
        })
      } catch (e) {
        console.warn('bank error!', e)
        throw new Error(e)
      }
    },
    async setupStripe() {
      if (this.$refs.informationForm.validate()) {
        this.attemptingStripeSetup = true
        this.localError = ''
        this.dobError = false
        const integrationMetadata = this.tenant.integrations.find((i) => {
          return i.key === 'stripe_connect'
        }).metadata

        const stripe = Stripe(integrationMetadata.publishableKey)
        const url = `${window.location.origin}?memberId=${this.member.id}`

        let accountToken
        try {
          accountToken = await this.accountToken({ stripe })
          if (accountToken.error) {
            if (accountToken.error.param && accountToken.error.param.includes("dob")){
              this.dobError = true
              this.$refs.dobInput.focus()
            }
            this.localError = accountToken.error.message
            this.attemptingStripeSetup = false
            return
          }
        } catch (e) {
          this.localError = e.message
          this.attemptingStripeSetup = false
          return
        }

        let bankToken
        try {
          bankToken = await this.bankToken({ stripe })
          if (bankToken.error) {
            this.localError = bankToken.error.message
            this.attemptingStripeSetup = false
            return
          }
        } catch (e) {
          this.localError = e.message
          this.attemptingStripeSetup = false
          return
        }

        this.attemptingStripeSetup = false
        this.$emit('create', {
          command: 'stripe_connect',
          tenantIntegrationId: this.details.id,
          data: { accountToken: accountToken.token, bankToken: bankToken.token, url }
        })
      }
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
