<template>
  <v-content class="account-create">
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md8>
          <v-card class="elevation-12">
            <v-toolbar dark color="secondary">
              <v-toolbar-title>Account Creation</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <img class="logo" :src="logoPath">
              <div class="center" v-if="loading">
                <v-alert v-if="loadingError" type="warning">
                  <div>{{loadingError}}</div>
                </v-alert>
                <template v-else>
                  <v-progress-circular indeterminate :size="70" :width="7" color="black"></v-progress-circular>
                  <p>We are reteiving your information, please hold.</p>
                </template>
              </div>
              <div class="center" v-if="saving">
                <v-progress-circular indeterminate :size="70" :width="7" color="black"></v-progress-circular>
                <p>Creating your account... We're excited to have you join Everra!</p>
              </div>
              <div class="center" v-if="!loading && !saving">
                <p class="headline">Welcome {{editMember.firstName}}!</p>
                <p>Congratulations! We are excited to work with you! Please fill out the following information to create your account.</p>
                <v-alert type="warning" v-if="error">{{error}}</v-alert>
                <v-form ref="claim" @submit.prevent="onSubmit" lazy-validation>
                  <h3 class="text-left pb-1 pt-4">Account Information</h3>
                  <v-row>
                    <v-col cols="12" sm="6" class="py-0">
                      <v-text-field
                        v-model="editMember.firstName"
                        id="givenName"
                        autocomplete="give-name"
                        label="First Name*"
                        :rules="requiredRule"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6"  class="py-0">
                      <v-text-field
                        v-model="editMember.lastName"
                        id="familyName"
                        autocomplete="family-name"
                        label="Last Name*"
                        :rules="requiredRule"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-col cols="12" class="pa-0">
                    <v-text-field
                      id="displayName"
                      name="displayName"
                      label="Display Name*"
                      autocomplete="nickname"
                      v-model="editMember.displayName"
                      :rules="requiredRule"
                      hint="This is how people will see your name publicly"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pa-0">
                    <v-text-field
                      id="email"
                      autocomplete="email"
                      name="email"
                      label="Email*"
                      v-model="email"
                      :rules="emailRule"
                      disabled="disabled"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pa-0">
                    <v-text-field
                      name="password"
                      label="Password*"
                      hint="At least 8 characters"
                      v-model="editMember.password"
                      min="8"
                      :rules="passwordRule"
                      :append-icon="visible ? 'visibility_off' : 'visibility'"
                      @click:append="visible = !visible"
                      :type="visible ? 'text' : 'password'"
                    ></v-text-field>
                  </v-col>
                  <div class="text-left pt-4">
                    <h3>Your Influencer Link</h3>
                    <small>This is the link you will use to share with your customers. Pick a name that matches your brand.</small>
                    <br/>
                    <code style="white-space: nowrap;">{{$tenantInfo.storeUrl.replace('{slug}', '')}}{{editMember.slug}}</code>
                  </div>
                  <v-text-field
                    ref="slugField"
                    :loading="checkingSlug"
                    placeholder="my-personal-link"
                    class="slug-field edit-link"
                    v-model="editMember.slug"
                    @keyup="slugChanged"
                    :rules="slugRule"
                    :error-messages="slugErrors"
                    outline
                    label="Influencer Link Name"
                  ></v-text-field>
                  <h3 class="text-left pb-2 pt-4">Personal Information</h3>
                  <v-text-field
                    id="street"
                    autocomplete="address-line1"
                    label="Street*"
                    name="street"
                    v-model="editMember.street"
                    :rules="requiredRule"
                    required
                  ></v-text-field>
                  <v-text-field
                    id="street2"
                    autocomplete="address-line2"
                    label="Street 2"
                    name="street2"
                    v-model="editMember.street2"
                  ></v-text-field>
                  <v-row>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        label="City*"
                        name="city"
                        id="city"
                        autocomplete="address-level2"
                        v-model="editMember.city"
                        :rules="requiredRule"
                        required
                      ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                      <v-text-field
                        id="state"
                        autocomplete="address-level1"
                        label="State/Province*"
                        name="state"
                        v-model="editMember.province"
                        :rules="requiredRule"
                        required
                      ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                      <v-text-field
                        label="Postal Code*"
                        name="postalCode"
                        id="postalCode"
                        autocomplete="postal-code"
                        v-model="editMember.postalCode"
                        :rules="requiredRule"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-select
                    label="Country*"
                    name="country"
                    v-model="editMember.country"
                    :rules="requiredRule"
                    id="country"
                    autocomplete="country"
                    required
                    :items="SELECT_ITEMS"
                  ></v-select>
                  <v-text-field
                    v-model="editMember.phone"
                    id="phone"
                    autocomplete="tel"
                    label="Phone*"
                    name="phone"
                    :rules="requiredRule"
                  >
                  </v-text-field>
                  <v-dialog ref="dialog" v-model="datePickerModal" lazy full-width width="290px">
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-on="on"
                        id="bday"
                        autocomplete="bday"
                        v-model="editMember.birthday"
                        label="Date of Birth*"
                        prepend-icon="event"
                        readonly
                        :rules="birthdateRule"
                      ></v-text-field>
                    </template>
                    <v-date-picker scrollable v-model="datePickerDate" :active-picker.sync="picker">
                      <v-spacer></v-spacer>
                      <v-btn text color="primary" @click="datePickerModal = false">Cancel</v-btn>
                      <v-btn text color="primary" @click="dateSave(datePickerDate); $refs.dialog.save()">OK</v-btn>
                    </v-date-picker>
                  </v-dialog>
                  <v-autocomplete
                    v-model="editMember.legalLocaleId"
                    label="Select Country of Citizenship*"
                    :rules="requiredRule"
                    :items="settings.legalLocales"
                    item-text="name"
                    item-value="id"
                  />
                  <!-- <v-autocomplete
                    v-model="editMember.languageId"
                    label="Select Preferred Language*"
                    :rules="requiredRule"
                    :items="settings.languages"
                    item-text="name"
                    item-value="id"
                  /> -->
                  <v-autocomplete
                    v-model="editMember.timezoneId"
                    label="Select Timezone*"
                    :rules="requiredRule"
                    :items="settings.timezones"
                    item-text="name"
                    item-value="id"
                  />
                  <div class="text-left pt-4">
                    <h3>Your Preffered Payout Method</h3>
                    <small>Please select the method in which you'd like to get paid. For more information please click on the following links: </small>
                    <ul>
                      <li><a href="https://paypal.com/" target="_blank">PayPal</a></li>
                      <li><a href="https://www.everra.com/wp-content/uploads/2020/11/Everra-eWallet-FAQ_compressed.pdf" target="_blank">eWallet Information</a></li>
                    </ul>
                  </div>
                  <v-radio-group v-model="preferredPayout" mandatory>
                    <v-radio label="eWallet" value="45" @change="showPaypalEmail=!showPaypalEmail"></v-radio>
                    <v-radio label="PayPal" value="53" @change="showPaypalEmail=!showPaypalEmail"></v-radio>
                  </v-radio-group>
                  <v-text-field
                    v-if="showPaypalEmail"
                    id="paypalEmail"
                    label="PayPal Email*"
                    name="paypalEmail"
                    v-model="paypalEmail"
                    :rules="emailRule"
                  ></v-text-field>
                  <h3 class="text-left pb-2 pt-4">Legal Information</h3>
                  <v-flex xs12>
                    <v-checkbox
                      v-model="agreement.affiliate"
                      :rules="requiredRule"
                      :persistent-hint="!affiliate"
                      @click="accept('affiliate')"
                    >
                      <template slot="label">
                        I agree to the&nbsp;<a @click.stop target="_blank" :href="$tenantInfo.agreements[0].url">Independent Contractor Agreement</a>*
                      </template>
                    </v-checkbox>
                  </v-flex>
                  <!-- <v-flex xs12 v-for="agreement in agreements" :key="agreement.key">
                    <AgreementCheckbox :agreement="agreement" />
                  </v-flex> -->
                  <v-flex xs12>
                    <v-checkbox
                      v-model="agreement.policies"
                      :rules="requiredRule"
                      :persistent-hint="!policies"
                      @click="accept('policies')"
                    >
                      <div slot="label">
                        I agree to the <a @click.stop target="_blank" :href="$tenantInfo.agreements[1].url">Policies and Procedures</a>*
                      </div>
                    </v-checkbox>
                  </v-flex>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn type="submit" color="primary" dark>Create Account</v-btn>
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
import { debounce } from 'lodash'
import { mapActions } from 'vuex'
import tenantInfo from '@/tenant.js'
import { ClaimActions } from '@/stores/ClaimStore'
import { UserActions } from '@/stores/UserStore'
import { Actions } from '@/Members/Store'
import { LOCALE_QUERY } from '@/graphql/GetLocalSettings'
import { CHECK_IF_UNIQUE_SLUG } from '@/graphql/Slug'
import { UPSERT_MEMBER_TENANT_INTEGRATION } from '@/graphql/Integrations'
import { GET_INQUIRY_RESPONSE } from '@/graphql/Inquiry.gql'
import { CREATE } from '@/graphql/AccountCreate.gql'
import { encrypt } from '@/utils/EncryptionService'
import AgreementCheckbox from '@/components/Agreement'
import Rules from '@/views/Rules.js'

export default {
  name: 'AccountCreate',
  components: {
    AgreementCheckbox
  },
  data () {
    return {
      loadingError: null,
      picker: null,
      SELECT_ITEMS: [
        { text: 'United States of America', value: 'US' },
        { text: 'United Kingdom', value: 'GB' },
        { text: 'Canada', value: 'CA' },
        { text: 'Australia', value: 'AU' },
        { text: 'New Zealand', value: 'NZ' }
      ],
      datePickerModal: false,
      datePickerDate: null,
      loading: true,
      saving: false,
      visible: false,
      error: null,
      requiredRule: Rules.requiredRule,
      passwordRule: Rules.passwordRule,
      birthdateRule: Rules.birthdateRule,
      emailRule: Rules.emailRule,
      slugRule: Rules.slugRule,
      birthdayFormat: Rules.birthdayFormat,
      checkingSlug: false,
      slugErrors: [],
      affiliate: null,
      policies: null,
      agreement: {
        affiliate: false,
        policies: false
      },
      showPaypalEmail: false,
      preferredPayout: 45,
      paypalEmail: null,
      memberContext: {},
      editMember: {
        market: null,
        tenantId: tenantInfo.id,
        firstName: null,
        lastName: null,
        displayName: null,
        languageId: 1, // Default to English for now
        legalLocaleId: null,
        password: null,
        timezoneId: null,
        email: null,
        phone: null,
        street: null,
        city: null,
        province: null,
        country: null,
        postalCode: null,
        street2: null
      },
      settings: {},
      logoPath: tenantInfo.logoLoginPath,
      agreements: tenantInfo.agreements
    }
  },
  async mounted () {
    try {
      const { applicationId, hashId } = this.$route.params
      const params = {
        tenantId: tenantInfo.id,
        responseId: ~~applicationId,
        sessionToken: hashId
      }
      const response = await this.$apollo.query({
        query: GET_INQUIRY_RESPONSE,
        variables: {
          input: params
        },
        client: 'federated'
      })
      const { data: { communications: { inquiryResponse } } } = response
      console.log(inquiryResponse)
      if (!inquiryResponse || inquiryResponse.status !== 'APPROVED') {
        this.loadingError = 'We\'re sorry, but this is not a valid Everra account creation request.'
      } else {
        const firstName = inquiryResponse.answers.find(answer => answer.question.atomicName === 'first')
        const lastName = inquiryResponse.answers.find(answer => answer.question.atomicName === 'last')
        const email = inquiryResponse.answers.find(answer => answer.question.atomicName === 'email')
        this.editMember.firstName = firstName.value
        this.editMember.lastName = lastName.value
        this.editMember.email = email.value
        this.email = email.value
        this.editMember.sponsorOid = inquiryResponse.metadata.sponsorId
        this.editMember.customerOid = inquiryResponse.metadata.customerId !== '0' ? inquiryResponse.metadata.customerId : null
        this.editMember.market = inquiryResponse.metadata.market
        this.editMember.tenantIntegrationId = ~~inquiryResponse.metadata.tenantIntegrationId
        this.memberContext.responseId = ~~applicationId
        this.memberContext.responseCode = hashId
        this.loading = false
      }
    } catch (err) {
      console.error('ERROR getting token', err)
    }
  },
  apollo: {
    settings: {
      query: LOCALE_QUERY,
      update ({ allLegalLocales, allTimezones, allLanguages }) {
        const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        allTimezones.nodes.forEach(tz => {
          if (tz.name === localTimezone) {
            this.editMember.timezoneId = tz.id
          }
        })

        const localLanguage = navigator.language.toLowerCase()
        allLanguages.nodes.forEach(lang => {
          const isTwoPart = lang.bcp47.indexOf('-') >= 0
          if (isTwoPart && localLanguage === lang.bcp47) {
            this.editMember.languageId = lang.id
          } else if (localLanguage.split('-') === lang.bcp47) {
            this.editMember.languageId = lang.id
          }
        })

        // Momentary until we get better country support
        if (localLanguage.indexOf('us') >= 0) {
          this.editMember.legalLocaleId = 235
        } else if (localLanguage.indexOf('gb') >= 0) {
          this.editMember.legalLocaleId = 80
        }

        return {
          legalLocales: allLegalLocales.nodes,
          timezones: allTimezones.nodes,
          languages: allLanguages.nodes
        }
      }
    }
  },
  watch: {
    datePickerModal (val) {
      val && setTimeout(() => (this.picker = 'YEAR'))
    }
  },
  methods: {
    ...mapActions({
      createAccount: ClaimActions.CREATE_ACCOUNT,
      getToken: ClaimActions.GET_TOKEN,
      upsertAttribute: Actions.SET_ATTRIBUTE,
      login: UserActions.LOGIN
    }),
    dateSave(datePickerDate) {
      this.editMember.birthday = this.$moment(datePickerDate).format(this.birthdayFormat)
    },
    accept (value) {
      this[value] = this.$moment.utc()
      this.agreement[value] = true
    },
    async onSubmit () {
      if (this.$refs.claim.validate()) {
        this.saving = true
        try {
          const encryptedAffiliate = await encrypt({
            plainText: 'on-register',
            metadata: {
              affiliate: this.affiliate,
              policies: this.policies
            }
          })
          console.log(encryptedAffiliate, this.editMember)
          const createMemberResponse = await this.$apollo.mutate({
            mutation: CREATE,
            variables: {
              input: {
                ...this.editMember,
                birthday: this.$moment(this.editMember.birthday, this.birthdayFormat).format('YYYY-MM-DD'),
                context: this.memberContext
              }
            },
            client: 'federated'
          })
          const newMember = createMemberResponse.data.membership.create
          if (newMember && newMember.id) {
            await this.login({
              email: this.editMember.email,
              password: this.editMember.password,
              tenantId: ~~process.env.VUE_APP_TENANT_ID
            })
            await this.upsertAttribute({
              private: true,
              key: 'affiliate-agreement',
              value: encryptedAffiliate.payload,
              signature: encryptedAffiliate.signature
            })
            if (this.preferredPayout === 53) {
              const toSave = [
                {
                  tenantIntegrationId: this.preferredPayout,
                  tenantIntegrationOid: this.paypalEmail,
                  metadata: {
                    type: 'email'
                  },
                  priority: 0
                }
              ]
              await this.$apollo.mutate({
                mutation: UPSERT_MEMBER_TENANT_INTEGRATION,
                variables: {
                  input: {
                    integrations: toSave
                  }
                },
                client: 'federated'
              })
            }
            this.$router.push('/dashboard')
          }
        } catch (e) {
          console.warn('Failed saving', { e })
          this.error = e
          this.saving = false
        }
      } else {
        this.saving = false
        console.error('Error in form')
      }
    },
    slugChanged: debounce(async function(searchTerm) {
      this.slugUnique = false
      this.slugErrors = []
      this.checkingSlug = true
      if (this.editMember.slug) {
        const { data } = await this.$apollo.query({
          query: CHECK_IF_UNIQUE_SLUG,
          variables: {
            input: {
              tenantId: this.$tenantId,
              slug: this.editMember.slug
            }
          },
          fetchPolicy: 'network-only'
        })
        const { checkSlug } = data
        if (!checkSlug && this.generateSlug) {
          this.slugUnique = true
        } else if (checkSlug) {
          this.slugErrors = ['Your link needs to be unique']
        }
        this.checkSlug = checkSlug
        this.checkingSlug = false
      }
    }, 500)
  }
}
</script>

<style scoped>
.account-create{
  margin-bottom: 75px;
}
.box-card {
  width: 480px;
  margin: auto;
}

.logo {
  width: 100%;
  max-width: 450px;
  margin: auto;
  display: block;
}

.center {
  text-align: center;
}
</style>
