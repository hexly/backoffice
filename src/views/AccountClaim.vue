<template>
  <v-content>
    <v-container
      fluid
      fill-height
    >
      <v-alert
        type="warning"
        v-if="error"
      >
        {{error}}
      </v-alert>
      <v-layout
        align-center
        justify-center
      >
        <v-flex
          xs12
          sm8
          md8
        >
          <v-card class="elevation-12">
            <v-toolbar
              dark
              color="black"
            >
              <v-toolbar-title>Account Creation</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <img
                class="logo"
                :src="logoPath"
              />
              <div
                class="center"
                v-if="loading"
              >
                <v-progress-circular
                  indeterminate
                  :size="70"
                  :width="7"
                  color="black"
                ></v-progress-circular>
                <p>We are reteiving your information, please hold.</p>
              </div>
              <div
                class="center"
                v-if="!loading"
              >
                <p>Welcome! Please fill out the following information to setup your account.</p>
                <v-form
                  ref="claim"
                  @submit.prevent="onSubmit"
                  lazy-validation
                >
                  <v-text-field
                    label="Name"
                    v-model="editMember.name"
                    :rules="requiredRule"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="E-mail"
                    v-model="editMember.contactEmail"
                    :rules="requiredRule"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="Display name"
                    v-model="editMember.displayName"
                    :rules="requiredRule"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="Store Name"
                    v-model="editMember.slug"
                    :rules="slugRule"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="username"
                    v-model="editMember.contactEmail"
                    disabled
                  ></v-text-field>
                  <v-text-field
                    name="password"
                    label="Enter your password"
                    hint="At least 8 characters"
                    v-model="editMember.password"
                    min="8"
                    :rules="passwordRule"
                    :append-icon="visible ? 'visibility_off' : 'visibility'"
                    :append-icon-cb="() => (visible = !visible)"
                    :type="visible ? 'text' : 'password'"
                  ></v-text-field>
                  <v-autocomplete
                    v-model="editMember.legalLocaleId"
                    label="Select Locale"
                    :rules="requiredRule"
                    :items="settings.legalLocales"
                    item-text="name"
                    item-value="id"
                  />
                  <v-autocomplete
                    v-model="editMember.languageId"
                    label="Select Language"
                    :rules="requiredRule"
                    :items="settings.languages"
                    item-text="name"
                    item-value="id"
                  />
                  <v-autocomplete
                    v-model="editMember.timezoneId"
                    label="Select Timezone"
                    :rules="requiredRule"
                    :items="settings.timezones"
                    item-text="name"
                    item-value="id"
                  />
                  <v-flex xs12>
                    <v-checkbox
                      v-model="agreement.affiliate"
                      :rules="requiredRule"
                      :readonly="!affiliate"
                      :persistent-hint="!affiliate"
                      hint="Note: You must read the agreement before agreeing"
                    >
                      <div slot="label">
                        I agree to the terms in the <a
                          @click="accept('affiliate')"
                          target="_blank"
                          href="/Consultant_Agreement_(March_2018).pdf"
                        >Independent Contractor Agreement</a>
                      </div>
                    </v-checkbox>
                  </v-flex>
                  <v-flex xs12>
                    <v-checkbox
                      v-model="agreement.policies"
                      :rules="requiredRule"
                      :readonly="!policies"
                      :persistent-hint="!policies"
                      hint="Note: You must read the policies and procedures before agreeing"
                    >
                      <div slot="label">
                        I agree to all the <a
                          @click="accept('policies')"
                          target="_blank"
                          href="/Policies_and_Procedures_(April_2018).pdf"
                        >Policies and Procedures</a>
                      </div>
                    </v-checkbox>
                  </v-flex>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      type="submit"
                      color="deep-purple"
                      dark
                    >Create Account</v-btn>
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
import getLocalSettings from '@/graphql/GetLocalSettings'
import { encrypt } from '@/utils/EncryptionService'
import moment from 'moment'

export default {
  data () {
    return {
      loading: true,
      visible: false,
      error: null,
      requiredRule: [v => !!v || 'Field is required'],
      slugRule: [
        v => !!v || 'Field is required',
        v =>
          (v && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) ||
          'Store name must not have spaces, special characters, nor capital letters',
        v => (v && v.length <= 20) || 'Slug must be 20 or less characters'
      ],
      passwordRule: [
        v => !!v || 'Field is required',
        v => (v && v.length > 8) || 'Password must be more than 8 characters'
      ],
      affiliate: null,
      policies: null,
      agreement: {
        affiliate: false,
        policies: false
      },
      editMember: {
        contactEmail: null,
        displayName: null,
        languageId: null,
        legalLocaleId: null,
        memberId: null,
        name: null,
        password: null,
        slug: null,
        timezoneId: null,
        username: null
      },
      settings: {},
      logoPath: tenantInfo.logoPath
    }
  },
  async beforeCreate () {
    // Fetch one time token information
    try {
      const { token } = this.$route.params
      const { data: { oneTimeToken: member } } = await this.$store.dispatch(
        ClaimActions.GET_TOKEN,
        { token }
      )
      this.editMember = {
        ...member,
        memberId: member.id,
        username: member.contactEmail
      }
      this.loading = false
    } catch (err) {
      console.log('ERROR getting token', err)
      this.$router.push('/login')
    }
  },
  apollo: {
    settings: getLocalSettings()
  },
  methods: {
    ...mapMutations({
      setJwt: UserMutations.SET_JWT
    }),
    ...mapActions({
      createAccount: ClaimActions.CREATE_ACCOUNT,
      upsertAttribute: Actions.SET_ATTRIBUTE,
      login: UserActions.LOGIN
    }),
    accept (value) {
      this[value] = moment.utc()
    },
    async onSubmit () {
      if (this.$refs.claim.validate()) {
        this.loading = true
        // Encrypt info
        try {
          const encryptedAffiliate = await encrypt({
            plainText: '',
            metadata: {
              affiliate: this.affiliate,
              policies: this.policies
            }
          })
          const { token } = this.$route.params
          const { data: { consumeOneTimeToken } } = await this.createAccount({
            contactEmail: this.editMember.contactEmail,
            displayName: this.editMember.displayName,
            languageId: this.editMember.languageId,
            legalLocaleId: this.editMember.legalLocaleId,
            memberId: this.editMember.memberId,
            name: this.editMember.name,
            password: this.editMember.password,
            slug: this.editMember.slug,
            timezoneId: this.editMember.timezoneId,
            username: this.editMember.username,
            simpleClaim: false,
            token
          })
          if (consumeOneTimeToken && consumeOneTimeToken !== 'done') {
            this.setJwt(consumeOneTimeToken)
            await this.upsertAttribute({
              private: true,
              key: 'affiliate-agreement',
              value: encryptedAffiliate.payload,
              signature: encryptedAffiliate.signature
            })
            await this.login({
              username: this.editMember.username,
              password: this.editMember.password,
              tenantId: ~~process.env.VUE_APP_TENANT_ID
            })
            this.$router.push('/dashboard')
          }
        } catch (e) {
          console.warn('Failed saving', { e })
          this.error = e
          this.loading = false
        }
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

.center {
  text-align: center;
}
</style>
