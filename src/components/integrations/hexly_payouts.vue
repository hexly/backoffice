<template>
  <div class="stripe-connect-integration">
    <h2>Everra Pay </h2>
    <br />
    <v-alert type="error" :value="!!error || !!localError">{{error || localError}}</v-alert>
    <div v-if="integrationDetails">
      <div v-if="loadingAccountDetails">
        <v-container>
          <v-row class="fill-height" align-content="center" justify="center">
            <v-col class="text-subtitle-1 text-center" cols="12">Loading account information</v-col>
            <v-col cols="6">
              <v-progress-linear color="deep-purple accent-4" indeterminate rounded height="6"></v-progress-linear>
            </v-col>
          </v-row>
        </v-container>
      </div>
      <div v-else-if="validations && !loadingAccountDetails" class="accountInfo">
        <h4>Account Information</h4>
        <div>
          Status:
          <v-chip v-if="!validations.validation.requiresInformation" color="success" outlined>
            Complete
            <v-icon right>mdi-check</v-icon>
          </v-chip>
          <v-chip v-else color="warning" outlined>
            Information Required
            <v-icon right>mdi-clipboard-list</v-icon>
          </v-chip>
        </div>
        <template v-if="validations.validation.requiresInformation">
          Information Needed
          <template v-for="field in validations.validation.requiermentsNeeded.OVERDUE">
            <div v-if="field.key === 'stripe:external_account'" :key="field.key">
              <v-text-field
                label="Bank Account Number"
                v-model="accountNumber"
                type="text"
                :rules="rules.requiredRule"
                :disabled="attemptingStripeSetup"
              />
              <v-text-field
                label="Routing Number / SORT Code"
                v-model="routingNumber"
                type="text"
                validate-on-blur
                :rules="rules.requiredRule"
                :disabled="attemptingStripeSetup"
              />
            </div>
            <div v-else-if="field.key === 'stripe:individual.dob.day'" :key="field.key">
              <v-text-field
                ref="dobInput"
                :error="dobError"
                label="Date of Birth"
                v-model="birthdate"
                placeholder="MM/DD/YYYY"
                :rules="rules.birthdateRule"
                :disabled="true"
              />
            </div>
            <div v-else-if="field.key === 'stripe:tos_acceptance.date'" :key="field.key">
              <v-checkbox
                v-model="stripeToS"
                :rules="rules.requiredRule"
                :disabled="attemptingStripeSetup"
              >
                <div slot="label">
                  I agree to the Everra Pay
                  <a href="https://stripe.com/connect-account/legal" target="_blank">Terms of Service</a>
                </div>
              </v-checkbox>
            </div>
            <div v-else-if="field.key === 'stripe:individual.address.line1'" :key="field.key">
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
            </div>
            <div v-else-if="field.key === 'stripe:individual.id_number'" :key="field.key">
              <small>If Any of the following information is wrong, please contact support</small>
                <v-text-field
                  :label="idNumberNames[country]"
                  v-model="idNumber"
                  type="text"
                  validate-on-blur
                  :rules="rules.requiredRule"
                  :disabled="attemptingStripeSetup"
                />
            </div>
          </template>
          <v-btn @click="updateAccount" class="my-2" color="primary">Update Account</v-btn>
        </template>
        <template v-if="validations.validation.context.externalAccounts.data[0]">
          Bank Account Info
          <v-layout row class="bankInfo">
            <v-flex>
              <v-icon large>account_balance</v-icon>
            </v-flex>
            <v-flex>
              <div>
                <div>
                  {{validations.validation.context.externalAccounts.data[0].bank_name}}
                </div>
                <div>
                  <img class="routing" src="/img/icons/routing.svg">
                  {{validations.validation.context.externalAccounts.data[0].routing_number}}
                  <img class="routing" src="/img/icons/routing.svg">
                  •••••{{validations.validation.context.externalAccounts.data[0].last4}}
                </div>
              </div>
            </v-flex>
          </v-layout>
          <div>
            <v-btn v-if="!displayReplaceForm" @click="displayReplaceForm = true" class="my-2" color="primary">Replace Bank Account</v-btn>
            <div v-if="displayReplaceForm">
              <v-text-field
                label="Bank Account Number"
                v-model="accountNumber"
                type="text"
                :rules="rules.requiredRule"
                :disabled="attemptingStripeSetup"
              />
              <v-text-field
                label="Routing Number / SORT Code"
                v-model="routingNumber"
                type="text"
                validate-on-blur
                :rules="rules.requiredRule"
                :disabled="attemptingStripeSetup"
              />
              <v-layout>
                <v-btn @click="replaceBank" :disabled="saving" class="my-2" color="primary">Replace Bank Account</v-btn>
                <v-spacer />
                <v-btn @click="displayReplaceForm = false" class="my-2" color="grey">cancel</v-btn>
              </v-layout>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div v-if="!loading && !setup && !integrationDetails">
      <p v-if="!integrationDetails">
        It looks like you do not yet have Everra Pay configured.
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
          :label="idNumberNames[country]"
          v-model="idNumber"
          type="text"
          validate-on-blur
          :rules="rules.requiredRule"
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
          label="Routing Number / SORT Code"
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
          {{country}}: <b>{{phones[country]}}</b>555....
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
import { GET_PAYOUT_ACCOUNT, CREATE_PAYOUT_ACCOUNT, UPDATE_PAYOUT_ACCOUNT } from '@/graphql/PayoutAccounts.gql'
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
      displayReplaceForm: false,
      saving: false,
      stripeParams: {
        country: '',
        type: 'custom',
        email: '',
        requested_capabilities: ['transfers', 'card_payments'],
        business_profile: {
          url: '',
          mcc: 5964
        },
        metadata: {
          hexlyId: ''
        },
        account_token: '',
        external_account: '',
        settings: {
          payouts: {
            schedule: {
              interval: 'manual'
            }
          }
        }
      },
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
      attemptingStripeUpdate: false,
      dobError: false,
      address: null,
      addresses: [],
      accountDetails: null,
      loadingAccountDetails: false,
      idNumber: '',
      idNumberNames: {
        US: 'Social Security Number',
        GB: 'Personal ID Number',
        CA: 'Social Insurance Number',
        AU: 'Personal ID Number',
        NZ: 'IRD Number'
      },
      phones: {
        US: '+1',
        GB: '+44',
        CA: '+1',
        AU: '+61',
        NZ: '+64'
      },
      currencies: {
        UK: 'GBP',
        GB: 'GBP',
        US: 'USD',
        PR: 'USD',
        GU: 'USD',
        UM: 'USD',
        CA: 'CAD',
        AU: 'AUD',
        NZ: 'NZD'
      },
      validations: null
    }
  },
  mounted () {
    this.loading = true
    this.reload()
    this.loadValidations()
    this.loading = false
  },
  methods: {
    beginSetup () {
      this.setup = true
    },
    async loadValidations() {
      this.loadingAccountDetails = true
      const { data: { payouts } } = await this.$apollo.query({
        query: GET_PAYOUT_ACCOUNT,
        variables: {
          input: {
            membersIn: [this.member.id]
          }
        },
        fetchPolicy: 'network-only',
        client: 'federated'
      })
      const validations = payouts.accounts.results.find(r => r.status === 'ACTIVE')
      validations.validation.requiermentsNeeded = _.groupBy(validations.validation.notices, 'type')
      this.validations = validations
      this.loadingAccountDetails = false
    },
    accountToken ({ stripe, pii }) {
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
              line1: 'address_full_match', // this.address.street,
              line2: this.address.street2,
              postal_code: this.address.postalCode,
              state: this.address.province
            },
            id_number: pii.token.id,
            dob: {
              day: bdate.date(),
              month: bdate.month() + 1,
              year: bdate.year()
            }
          },
          tos_shown_and_accepted: true
        }
        if (this.country === 'US') {
          params.individual.ssn_last_4 = this.idNumber.substr(this.idNumber.length - 4, this.idNumber.length)
        }
        return stripe.createToken('account', params)
      } catch (e) {
        console.warn('account error!', e)
        throw new Error(e)
      }
    },
    getAccountToken ({ stripe, accountInfo: params }) {
      try {
        if (this.country === 'US' && params.individual.id_number) {
          params.individual.ssn_last_4 = this.idNumber.substr(this.idNumber.length - 4, this.idNumber.length)
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
    piiToken ({ stripe }) {
      try {
        return stripe.createToken('pii', {
          personal_id_number: this.idNumber
        })
      } catch (e) {
        console.warn('pii error!', e)
        throw new Error(e)
      }
    },
    getStripeClient() {
      const integrationMetadata = this.tenant.integrations.find((i) => {
        return i.key === 'stripe_connect'
      }).metadata

      const stripe = Stripe(integrationMetadata.publishableKey)
      return stripe
    },
    async setupStripe () {
      if (this.$refs.informationForm.validate()) {
        this.attemptingStripeSetup = true
        this.localError = ''
        this.dobError = false

        const stripe = this.getStripeClient()
        const url = this.$tenantInfo.storeUrl.replace('{slug}', this.slug)

        let accountToken
        if (!this.integrationDetails) {
          try {
            const pii = await this.piiToken({ stripe })
            accountToken = await this.accountToken({ stripe, pii })
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

        this.stripeParams.country = this.country
        this.stripeParams.email = this.email
        this.stripeParams.metadata.hexlyId = this.member.id
        this.stripeParams.account_token = accountToken.token.id
        this.stripeParams.external_account = bankToken.token.id
        this.stripeParams.business_profile.url = url

        this.$apollo.mutate({
          mutation: CREATE_PAYOUT_ACCOUNT,
          variables: {
            input: {
              integrationKey: 'hexly_payouts',
              memberId: this.member.id,
              integrationDetails: this.stripeParams
            }
          },
          client: 'federated'
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
    async updateAccount() {
      const notices = this.validations.validation.requiermentsNeeded.OVERDUE.map(n => n.key)
      const stripe = this.getStripeClient()
      const updateParams = {}
      let accountInfo = {}
      if (notices.indexOf('stripe:external_account') >= 0) {
        const bankToken = await this.bankToken({ stripe })
        updateParams.external_account = bankToken.token.id
      }
      if (notices.indexOf('stripe:individual.address.line1') >= 0) {
        const address = {
          city: this.address.city,
          country: this.country,
          line1: 'address_full_match', // this.address.street,
          line2: this.address.street2,
          postal_code: this.address.postalCode,
          state: this.address.province
        }
        if (accountInfo.individual) {
          accountInfo.individual.address = address
        } else {
          accountInfo = {
            individual: {
              address
            }
          }
        }
      }
      if (notices.indexOf('stripe:individual.dob.day') >= 0) {
        const bdate = this.$moment(this.birthdate, Rules.birthdayFormat)
        const dob = {
          day: bdate.date(),
          month: bdate.month() + 1,
          year: bdate.year()
        }
        if (accountInfo.individual) {
          accountInfo.individual.dob = dob
        } else {
          accountInfo = {
            individual: {
              dob
            }
          }
        }
      }
      if (notices.indexOf('stripe:individual.id_number') >= 0) {
        const pii = await this.piiToken({ stripe })
        if (accountInfo.individual) {
          accountInfo.individual.id_number = pii.token.id
        } else {
          accountInfo = {
            individual: {
              id_number: pii.token.id
            }
          }
        }
      }
      if (notices.indexOf('stripe:tos_acceptance.date') >= 0) {
        accountInfo.tos_shown_and_accepted = true
      }

      if (Object.keys(accountInfo).length > 0) {
        const accountToken = await this.getAccountToken({ stripe, accountInfo })
        updateParams.account_token = accountToken.token.id
      }

      this.$apollo.mutate({
        mutation: UPDATE_PAYOUT_ACCOUNT,
        variables: {
          input: {
            id: this.validations.id,
            integrationDetails: updateParams
          }
        },
        client: 'federated'
      }).then(integrationDetails => {
        // nada
        this.setup = false
        this.reload()
      }).catch(err => {
        this.localError = err.message || err
      }).finally(() => {
        this.attemptingStripeSetup = false
      })
    },
    async replaceBank() {
      const stripe = this.getStripeClient()
      const bankToken = await this.bankToken({ stripe })
      this.$apollo.mutate({
        mutation: UPDATE_PAYOUT_ACCOUNT,
        variables: {
          input: {
            id: this.validations.id,
            integrationDetails: { external_account: bankToken.token.id }
          }
        },
        client: 'federated'
      }).then(integrationDetails => {
        // nada
        this.setup = false
        this.reload()
      }).catch(err => {
        this.localError = err.message || err
      }).finally(() => {
        this.attemptingStripeSetup = false
      })
    },
    getAccountDetails() {
      // if (this.integrationDetails) {
      //   this.$apollo.mutate({
      //     mutation: MEMBER_INTEGRATION_COMMAND,
      //     variables: {
      //       input: {
      //         command: 'stripe_connect_account_details',
      //         tenantIntegrationId: this.integrationDetails.tenantIntegrationId,
      //         data: {
      //           accountOid: this.integrationDetails.integrationOid
      //         }
      //       }
      //     },
      //     loadingKey: 'loadingAccountDetails',
      //     update: (store, { data: { integrationCommand } }) => {
      //       this.accountDetails = integrationCommand.metadata
      //     }
      //   })
      // }
    },
    reload () {
      this.firstName = this.member.firstName
      this.lastName = this.member.lastName
      this.stripePhone = this.phone
      this.stripeEmail = this.email
      this.birthdate = this.$moment(this.member.birthdate, 'YYYY-MM-DD').format(Rules.birthdayFormat)
      // this.getAccountDetails()
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
    ...mapGetters(['slug', 'contactId']),
    ...mapState({
      email: state => _.get(state, 'user.principal.member.contacts[0].emails[0].email'),
      phone: state => _.get(state, 'user.principal.member.contacts[0].phoneNumbers[0].number'),
      member: state => state.user.principal.member,
      integrations: state => state.user.principal.member.tenantIntegrations,
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
      return options.find(e => e.key === 'hexly_payouts')
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

.accountInfo{
  margin: auto;
}

.accountInfo .bankInfo{
  padding: 5px;
  border: 1px solid black;
  border-radius: 2px;
}

.accountInfo .routing {
  height: 10px;
}
</style>
