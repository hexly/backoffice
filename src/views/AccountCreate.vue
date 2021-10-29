<template>
  <v-content>
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
                <v-progress-circular indeterminate :size="70" :width="7" color="black"></v-progress-circular>
                <p>We are reteiving your information, please hold.</p>
              </div>
              <div class="center" v-if="!loading">
                <p class="headline">Welcome {{editMember.name}}!</p>
                <p>Please fill out the following information to create your account.</p>
                <v-alert type="warning" v-if="error">{{error}}</v-alert>
                <v-form ref="claim" @submit.prevent="onSubmit" lazy-validation>
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
                      v-model="editMember.email"
                      :rules="emailRule"
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
                  <v-flex xs12>
                    <v-checkbox
                      v-model="agreement.affiliate"
                      :rules="requiredRule"
                      :persistent-hint="!affiliate"
                      @click="accept('affiliate')"
                    >
                      <template slot="label">
                        <!-- WTF? Why does that need to be there? -->
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
import { mapActions, mapMutations } from 'vuex'
import tenantInfo from '@/tenant.js'
import { ClaimActions } from '@/stores/ClaimStore'
import { UserMutations, UserActions } from '@/stores/UserStore'
import { Actions } from '@/Members/Store'
import { LOCALE_QUERY } from '@/graphql/GetLocalSettings'
import { WELCOME_EMAIL } from '@/graphql/Member.gql'
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
      visible: false,
      error: null,
      requiredRule: Rules.requiredRule,
      passwordRule: Rules.passwordRule,
      birthdateRule: Rules.birthdateRule,
      emailRule: Rules.emailRule,
      birthdayFormat: Rules.birthdayFormat,
      affiliate: null,
      policies: null,
      agreement: {
        affiliate: false,
        policies: false
      },
      editMember: {
        tenantId: tenantInfo.id,
        firstName: null,
        lastName: null,
        displayName: null,
        languageId: null,
        legalLocaleId: null,
        memberId: null,
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
      console.log(applicationId, hashId)
      // Go check who this applicationId and hashId belong to and get their existing details
      // const { data: { oneTimeToken: member } } = await this.getToken({ token })
      // const { id: contactId, emails } = member.contacts[0]
      // const { email, id: emailId } = emails[0]
      // this.editMember = {
      //   ...this.editMember,
      //   ...member,
      //   memberId: member.id,
      //   username: email,
      //   contactId,
      //   emailId,
      //   contactEmail: email
      // }
      this.loading = false
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
        // this.loading = true
        // Encrypt info
        try {
          // const encryptedAffiliate = await encrypt({
          //   plainText: 'on-register',
          //   metadata: {
          //     affiliate: this.affiliate,
          //     policies: this.policies
          //   }
          // })
          // const { token } = this.$route.params
          // console.log(encryptedAffiliate, this.editMember)
          console.log(this.editMember)
          await this.$apollo.mutate({
            mutation: CREATE,
            variables: {
              input: this.editMember
            },
            client: 'federated'
          })
          // const { data: { consumeOneTimeToken } } = await this.createAccount({
          //   emailId: this.editMember.emailId,
          //   contactId: this.editMember.contactId,
          //   contactEmail: this.editMember.contactEmail,
          //   displayName: this.editMember.displayName,
          //   languageId: this.editMember.languageId,
          //   legalLocaleId: this.editMember.legalLocaleId,
          //   memberId: this.editMember.memberId,
          //   name: this.editMember.name,
          //   password: this.editMember.password,
          //   timezoneId: this.editMember.timezoneId,
          //   username: this.editMember.username,
          //   birthday: this.$moment(this.editMember.birthday, this.birthdayFormat).format('YYYY-MM-DD'),
          //   simpleClaim: false,
          //   token
          // })

          // if (consumeOneTimeToken && consumeOneTimeToken !== 'done') {
          //   await this.login({
          //     username: this.editMember.username,
          //     password: this.editMember.password,
          //     tenantId: ~~process.env.VUE_APP_TENANT_ID
          //   })
          //   await this.upsertAttribute({
          //     private: true,
          //     key: 'affiliate-agreement',
          //     value: encryptedAffiliate.payload,
          //     signature: encryptedAffiliate.signature
          //   })
          //   // Temporary Welcome Email
          //   const emailTemplate = process.env.VUE_APP_WELCOME_EMAIL_TEMPLATE
          //   if (emailTemplate) {
          //     await this.$apollo.mutate({
          //       mutation: WELCOME_EMAIL,
          //       variables: {
          //         input: {
          //           memberId: this.editMember.memberId,
          //           tenantId: ~~process.env.VUE_APP_TENANT_ID,
          //           templateId: process.env.VUE_APP_WELCOME_EMAIL_TEMPLATE
          //         }
          //       },
          //       client: 'federated'
          //     })
          //   }
          //   this.$router.push('/dashboard')
          // }
        } catch (e) {
          console.warn('Failed saving', { e })
          this.error = e
          this.loading = false
        }
      } else {
        console.error('Error in form')
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
  max-width: 450px;
  margin: auto;
  display: block;
}

.center {
  text-align: center;
}
</style>
