<template>
  <div class="stripe-connect-integration">
    <h2>{{$tenantInfo.strings['stripeConnect'] || 'Stripe'}} </h2>
    <h3>{{$tenantInfo.strings['stripeConnect'] || 'Stripe'}} provides {{tenant.name}} the ability to send money directly to your bank account.</h3>
    <br />
    <v-alert type="error" :value="(error || localError)">{{error || localError}}</v-alert>
    <div v-if="!integrationDetails && !loading && !setup">
      <p>
        It looks like you do not yet have {{$tenantInfo.strings['stripeConnect'] || 'Stripe'}} configured.
        <br />Please click the button below to begin your account setup!
      </p>
      <v-btn @click="beginSetup" color="primary">Setup Account</v-btn>
    </div>
    <div v-if="!integrationDetails && !loading && setup">
      <h3>Account Setup</h3>
      <p>Please enter the following information</p>
      <v-form @submit.prevent="setupStripe" ref="informationForm" width="500">
        <v-text-field
          label="First Name"
          v-model="firstName"
          type="text"
          :rules="rules.requiredRule"
          :disabled="attemptingStripeSetup"
        />
        <v-text-field
          label="Last Name"
          v-model="lastName"
          type="text"
          :rules="rules.requiredRule"
          :disabled="attemptingStripeSetup"
        />
        <v-text-field
          ref="dobInput"
          :error="dobError"
          label="Date of Birth"
          v-model="birthdate"
          placeholder="MM/DD/YYYY"
          :rules="rules.birthdateRule"
          :disabled="attemptingStripeSetup"
        />
        <v-text-field
          v-if="country === 'US'"
          label="SSN Last Four"
          v-model="ssnLastFour"
          type="text"
          validate-on-blur
          :rules="rules.ssnLastFourRule"
          :disabled="attemptingStripeSetup"
        />
        <v-text-field
          label="Bank Account Number"
          v-model="accountNumber"
          type="text"
          :rules="rules.requiredRule"
          :disabled="attemptingStripeSetup"
        />
        <v-text-field
          label="Routing Number/ SORT Code"
          v-model="routingNumber"
          type="text"
          validate-on-blur
          :rules="rules.requiredRule"
          :disabled="attemptingStripeSetup"
        />
        <v-text-field
          label="email"
          v-model="stripeEmail"
          type="text"
          validate-on-blur
          :rules="rules.requiredRule"
          :disabled="attemptingStripeSetup"
        />
        <v-text-field
          label="phone"
          v-model="stripePhone"
          type="text"
          validate-on-blur
          :rules="rules.requiredRule"
          :disabled="attemptingStripeSetup"
        />
        <p class="text-xs-left caption phone-hint">
          Please speficy your country code as follows:
          <br/>
          US: +1555....
          <br/>
          UK: +44555...
        </p>
        <small>If Any of the following information is wrong, please contact support</small>
        <v-text-field
          label="country"
          v-model="country"
          type="text"
          readonly
          disabled
        />
        <v-checkbox
          v-model="stripeToS"
          :rules="rules.requiredRule"
          :disabled="attemptingStripeSetup"
        >
          <div slot="label">
            I agree to the {{$tenantInfo.strings['stripeConnect'] || 'Stripe'}}
            <a
              href="https://stripe.com/connect-account/legal"
              target="_blank"
            >Terms of Service</a>
          </div>
        </v-checkbox>
        <v-btn
          :loading="attemptingStripeSetup"
          :disabled="attemptingStripeSetup"
          type="submit"
          color="primary"
        >Create Account</v-btn>
      </v-form>
    </div>
    <div v-if="integrationDetails">
      <p>Your {{$tenantInfo.strings['stripeConnect'] || 'Stripe'}} account has been created!</p>
    </div>
  </div>
</template>

<script>
/* global Stripe */
import _ from 'lodash'
import Rules from '@/views/Rules.js'
import { GET_MEMBER_PAYOUTS } from '@/graphql/Member.gql'
import { ADDRESS_BY_CONTACT_ID } from '@/graphql/Address.js'
import { mapState, mapGetters } from 'vuex'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'StripeIntegration',
  props: {
    details: Object,
    error: String
  },
  data () {
    const host = window.location.hostname || ''
    const isHost = host.indexOf('localhost') >= 0
    return {
      loading: false,
      setup: false,
      password: null,
      rules: Rules,
      firstName: '',
      lastName: '',
      birthdate: '',
      accountNumber: isHost ? this.getTestAccount() : '',
      routingNumber: isHost ? this.getTestRouting() : '',
      ssnLastFour: '',
      stripeToS: false,
      localError: '',
      attemptingStripeSetup: false,
      dobError: false,
      address: null,
      payouts: []
    }
  },
  mounted () {
    this.loading = true
    this.reload()
    this.loading = false
  },
  methods: {
    getTestAccount() {
      if (this.country === 'GB') {
        return '00012345'
      }
      return '000123456789'
    },
    getTestRouting() {
      if (this.country === 'GB') {
        return '108800'
      }
      return '110000000'
    },
    beginSetup () {
      this.setup = true
    },
    accountToken ({ stripe }) {
      const bdate = this.$moment(this.birthdate)
      console.log({ bdate })
      console.log(bdate.date())
      try {
        const params = {
          business_type: 'individual',
          individual: {
            first_name: this.firstName,
            last_name: this.lastName,
            phone: this.stripePhone,
            email: this.stripeEmail,
            address: {
              city: this.address.city,
              country: this.country,
              line1: this.address.street,
              line2: this.address.street2,
              postal_code: this.address.postalCode,
              state: this.address.province
            },
            dob: {
              day: bdate.date(),
              month: bdate.month() + 1,
              year: bdate.year()
            }
          },
          tos_shown_and_accepted: true
        }
        if (this.country === 'US') {
          params.individual.ssn_last_4 = this.ssnLastFour
        }
        return stripe.createToken('account', params)
      } catch (e) {
        console.warn('account error!', e)
        throw new Error(e)
      }
    },
    bankToken ({ stripe }) {
      try {
        return stripe.createToken('bank_account', {
          bank_account: {
            country: this.country,
            currency: this.currency,
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
    async setupStripe () {
      if (this.$refs.informationForm.validate()) {
        this.attemptingStripeSetup = true
        this.localError = ''
        this.dobError = false
        const integrationMetadata = this.tenant.integrations.find((i) => {
          return i.key === 'stripe_connect'
        }).metadata

        const stripe = Stripe(integrationMetadata.publishableKey)
        let host = window.location.origin.replace('localhost', 'localhost.hexly.io')
        const url = `${host}?memberId=${this.member.id}`

        let accountToken
        try {
          accountToken = await this.accountToken({ stripe })
          if (accountToken.error) {
            if (accountToken.error.param && accountToken.error.param.includes('dob')) {
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

        new Promise((resolve, reject) => {
          this.$emit('create', {
            command: 'stripe_connect',
            tenantIntegrationId: this.details.id,
            data: { accountToken: accountToken.token, bankToken: bankToken.token, url, country: this.country, email: this.email },
            resolve,
            reject
          })
        }).then(integrationDetails => {
          // nada
        }).catch(err => {
          this.localError = err.message || err
        }).finally(() => {
          this.attemptingStripeSetup = false
        })
      }
    },
    reload () {
      this.firstName = this.member.firstName
      this.lastName = this.member.lastName
      this.stripePhone = this.phone
      this.stripeEmail = this.email
      this.birthdate = this.$moment(this.member.birthdate, 'YYYY-MM-DD').format('MM/DD/YYYY')
    }
  },
  apollo: {
    address: {
      query: ADDRESS_BY_CONTACT_ID,
      variables () {
        return {
          addressContactId: {
            contactId: this.contactId,
            tenantId
          }
        }
      },
      update ({ addressByContactOrTenant }) {
        return addressByContactOrTenant[0]
      },
      loadingKey: 'loadingAddresses',
      skip() {
        return !this.contactId
      }
    },
    payouts: {
      query: GET_MEMBER_PAYOUTS,
      variables() {
        return {
          saleSearchInput: {
            sellerId: this.member.id,
            tenantId,
            query: null
          }
        }
      },
      error(err) {
        console.error({ err })
      },
      debounce: 500,
      update({ getPrincipal }) {
        return getPrincipal.member.payouts
      }
    }
  },
  computed: {
    ...mapGetters(['contactId']),
    ...mapState({
      email: state => _.get(state, 'user.principal.member.contacts[0].emails[0].email'),
      phone: state => _.get(state, 'user.principal.member.contacts[0].phoneNumbers[0].number'),
      member: state => state.user.principal.member,
      integrations: state => state.user.principal.member.tenantIntegrations,
      tenant: state => state.user.principal.tenant
    }),
    currency() {
      if (this.address && this.address.country === 'UK') {
        return 'GBP'
      }
      return 'USD'
    },
    country() {
      if (this.address && this.address.country === 'UK') {
        return 'GB'
      }
      return 'US'
    },
    integrationDetails () {
      const options = this.integrations || []
      return options.find(e => e.key === 'stripe_connect')
    }
  }
}
</script>

<style>
.phone-hint {
  position: relative;
  top: -15px;
}
.stripe-connect-integration {
  width: 100%;
  max-width: 500px;
  margin: auto;
}
</style>
