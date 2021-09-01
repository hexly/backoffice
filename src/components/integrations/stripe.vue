<template>
  <div class="stripe-connect-integration">
    <h2>{{$tenantInfo.strings['stripeConnect'] || 'Stripe'}} </h2>
    <h3>{{$tenantInfo.strings['stripeConnect'] || 'Stripe'}} provides {{tenant.name}} the ability to send money directly to your bank account.</h3>
    <br />
    <v-alert type="error" :value="!!error || !!localError">{{error || localError}}</v-alert>
    <div v-if="integrationDetails">
      <div v-if="loadingAccountDetails">
        Loading Bank Info...
      </div>
      <div v-else-if="accountDetails && !loadingAccountDetails" class="bankAccount">
        Bank Account Info
        <v-layout row class="bankInfo">
          <v-flex>
            <v-icon large>account_balance</v-icon>
          </v-flex>
          <v-flex>
            <div>
              <div>
                {{accountDetails.bank_name}}
              </div>
              <div>
                <img class="routing" src="/img/icons/routing.svg">
                {{accountDetails.routing_number}}
                <img class="routing" src="/img/icons/routing.svg">
                •••••{{accountDetails.last4}}
              </div>
            </div>
          </v-flex>
        </v-layout>
      </div>
    </div>
    <div v-if="!loading && !setup">
      <p v-if="!integrationDetails">
        It looks like you do not yet have {{$tenantInfo.strings['stripeConnect'] || 'Stripe'}} configured.
        <br />Please click the button below to begin your account creation!
      </p>
      <v-btn @click="beginSetup" class="my-2" color="primary">Create New Account</v-btn>
    </div>
    <div v-if="!loading && setup">
      <h3>Account Creation</h3>
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
        <p class="text-left caption phone-hint">
          Please speficy your country code as follows:
          <br/>
          US: <b>+1</b>555....
          <br/>
          UK: <b>+44</b>555...
        </p>
        <small>If Any of the following information is wrong, please contact support</small>
        <v-select
          v-if="addresses.length > 1"
          label="Select Address"
          v-model="address"
          :items="addresses"
          item-text="street"
          item-value="id"
          return-object
        ></v-select>
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
        <p v-if="accountDetails">
          <small>Looks like you already have an account set up, by creating a new one you will be replacing your old account.</small>
        </p>
        <v-btn
          :loading="attemptingStripeSetup"
          :disabled="attemptingStripeSetup"
          type="submit"
          color="primary"
        >Create Account</v-btn>
      </v-form>
    </div>
  </div>
</template>

<script>
/* global Stripe */
import _ from 'lodash'
import Rules from '@/views/Rules.js'
import { MEMBER_INTEGRATION_COMMAND } from '@/graphql/Integrations'
import { ADDRESS_BY_CONTACT_ID } from '@/graphql/Address.js'
import { mapState, mapGetters } from 'vuex'

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
      accountNumber: isHost ? '000123456789' : '',
      routingNumber: isHost ? '110000000' : '',
      ssnLastFour: '',
      stripeToS: false,
      localError: '',
      attemptingStripeSetup: false,
      dobError: false,
      address: null,
      addresses: [],
      accountDetails: null,
      loadingAccountDetails: false,
      currencies: {
        UK: 'GBP',
        GB: 'GBP',
        US: 'USD',
        PR: 'USD',
        GU: 'USD',
        UM: 'USD'
      }
    }
  },
  mounted () {
    this.loading = true
    this.reload()
    this.loading = false
  },
  methods: {
    beginSetup () {
      this.setup = true
    },
    accountToken ({ stripe }) {
      const bdate = this.$moment(this.birthdate, Rules.birthdayFormat)
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
        if (!this.integrationDetails) {
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
            data: {
              integrationOid: this.integrationDetails ? this.integrationDetails.integrationOid : null,
              bankAccountOid: this.accountDetails ? this.accountDetails.id : null,
              accountToken: accountToken ? accountToken.token : null,
              bankToken: bankToken.token,
              url,
              country: this.country,
              email: this.email
            },
            resolve,
            reject
          })
        }).then(integrationDetails => {
          // nada
          this.setup = false
          this.reload()
        }).catch(err => {
          this.localError = err.message || err
        }).finally(() => {
          this.attemptingStripeSetup = false
        })
      }
    },
    getAccountDetails() {
      if (this.integrationDetails) {
        this.$apollo.mutate({
          mutation: MEMBER_INTEGRATION_COMMAND,
          variables: {
            input: {
              command: 'stripe_connect_account_details',
              tenantIntegrationId: this.integrationDetails.tenantIntegrationId,
              data: {
                accountOid: this.integrationDetails.integrationOid
              }
            }
          },
          loadingKey: 'loadingAccountDetails',
          update: (store, { data: { integrationCommand } }) => {
            this.accountDetails = integrationCommand.metadata
          }
        })
      }
    },
    reload () {
      this.firstName = this.member.firstName
      this.lastName = this.member.lastName
      this.stripePhone = this.phone
      this.stripeEmail = this.email
      this.birthdate = this.$moment(this.member.birthdate, 'YYYY-MM-DD').format(Rules.birthdayFormat)
      this.getAccountDetails()
    }
  },
  apollo: {
    addresses: {
      query: ADDRESS_BY_CONTACT_ID,
      variables () {
        return {
          addressContactId: {
            contactId: this.contactId,
            tenantId: this.$tenantId
          }
        }
      },
      update ({ addressByContactOrTenant }) {
        this.address = addressByContactOrTenant[0]
        return addressByContactOrTenant
      },
      loadingKey: 'loadingAddresses',
      skip() {
        return !this.contactId
      }
    }
  },
  computed: {
    ...mapGetters(['contactId']),
    ...mapState({
      email: state => _.get(state, 'user.principal.member.contacts[0].emails[0].email'),
      phone: state => _.get(state, 'user.principal.member.contacts[0].phoneNumbers[0].number'),
      member: state => state.user.principal.member,
      integrations: state => state.user.principal.member.integrations,
      tenant: state => state.user.principal.tenant
    }),
    currency() {
      return this.currencies[this.address.country] || 'USD'
    },
    country() {
      if (this.address && this.address.country === 'UK') {
        return 'GB'
      }
      return this.address.country || 'US'
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

.bankAccount{
  width: 250px;
  margin: auto;
}

.bankAccount .bankInfo{
  padding: 5px;
  border: 1px solid black;
  border-radius: 2px;
}

.bankAccount .routing {
  height: 10px;
}
</style>
