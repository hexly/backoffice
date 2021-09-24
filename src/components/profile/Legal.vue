<template>
  <div class="legal-form">
    <div>
      <p>
        Please use this section to manage your legal and compliance details. If you need assistance,
        please contact support.
      </p>
      <v-form ref="legalForm" @submit.prevent="save" lazy-validation>
        <v-layout row wrap v-if="$tenantInfo.features.legal.ssn !== false">
          <v-flex xs12 sm4>
            <v-radio-group
              class="radios"
              v-model="value.entity.type"
              :mandatory="false"
              row
              :disabled="redacted"
              xs12
              md4
            >
              <v-radio label="Individual" value="ssn"></v-radio>
              <v-radio label="Business" value="ein"></v-radio>
            </v-radio-group>
          </v-flex>
          <v-flex xs12 :sm4="value.entity.type === 'ein'" :sm8="value.entity.type === 'ssn'">
            <v-text-field
              :label="value.entity.type.toUpperCase()"
              :value="value.entity.identifier"
              required
              :disabled="redacted"
              v-if="redacted"
            />
            <v-text-field
              v-if="value.entity.type && !redacted"
              :label="value.entity.type.toUpperCase()"
              v-model="value.entity.identifier"
              :mask="value.entity.type === 'ssn' ? '###-##-####' : '##-#######'"
              hint="This data is stored encrypted and used only for tax purposes"
              :append-icon="visible ? 'visibility_off' : 'visibility'"
              :append-icon-cb="() => (visible = !visible)"
              :type="visible ? 'text' : 'password'"
              persistent-hint
              required
            />
          </v-flex>
          <v-flex xs12 sm4>
            <v-text-field
              :disabled="redacted"
              label="Business / Entity Name"
              v-if="value.entity.type === 'ein'"
              v-model="value.entity.name"
              persistent-hint
              required
            ></v-text-field>
          </v-flex>
        </v-layout>
        <v-flex xs12 class="text-left">
          <h2>Legal Documents</h2>
          <template v-if="agreed">
            <div class="text-left py-2">
              You have agreed to the terms in the
              <a class="doc-links"
                target="_blank"
                :href="$tenantInfo.agreements[0].url"
              >Independent Contractor Agreement</a>
            </div>
          </template>
          <template v-else>
            <a
              class="doc-links"
              target="_blank"
              :href="$tenantInfo.agreements[0].url"
            >Independent Contractor Agreement</a>
            <v-checkbox
              v-model="value.agreement.affiliate"
              :rules="requiredPolicyRule"
              label="I agree to the terms in the Independent Contractor Agreement"
            >
            </v-checkbox>
          </template>
        </v-flex>
        <v-flex xs12 class="text-left mt-5">
          <template v-if="agreed">
            <div class="text-left py-2">
                You have agreed to all the
                <a
                  class="doc-links"
                  target="_blank"
                  :href="$tenantInfo.agreements[1].url"
                >Policies and Procedures</a>
              </div>
          </template>
          <template v-else>
            <a
              class="doc-links"
              target="_blank"
              :href="$tenantInfo.agreements[1].url"
            >Policies and Procedures</a>
            <v-checkbox
              v-model="value.agreement.policies"
              :rules="requiredPolicyRule"
              label="I agree to all the Policies and Procedures"
            >
            </v-checkbox>
          </template>
        </v-flex>
        <br>
        <v-flex xs12>
          <v-btn
            :disabled="saving || !canSave"
            :loading="saving"
            color="primary"
            type="submit"
          >Save Legal Details</v-btn>
        </v-flex>
      </v-form>
    </div>
  </div>
</template>

<script>
// DO NOT TOUCH THIS FILE!
import { mapActions, mapState } from 'vuex'
import { encrypt } from '@/utils/EncryptionService'
import * as _ from 'lodash'

import { Actions } from '@/Members/Store'

export default {
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      visible: false,
      agreed: false,
      redacted: false,
      saving: false,
      requiredRule: [v => !!v || 'Field is required'],
      requiredPolicyRule: [v => !!v || 'Note: You must read the policies and procedures before agreeing']
    }
  },
  mounted () {
    this.load()
  },
  watch: {
    'value.agreement.affiliate'() {
      this.value.clicked['affiliate'] = this.$moment.utc()
    },
    'value.agreement.policies'() {
      this.value.clicked['policies'] = this.$moment.utc()
    }
  },
  methods: {
    ...mapActions({
      upsertAttribute: Actions.SET_ATTRIBUTE,
      getAttributes: Actions.GET_ATTRIBUTES
    }),
    async load () {
      const res = await this.getAttributes({
        idIn: [this.user.principal.memberId],
        tenantIn: [this.$tenantId]
      })
      const getMemberAttributes = _.get(res, 'data.membership.search.results.0.attributes', [])
      getMemberAttributes.forEach(_ => {
        if (_.key === 'affiliate-agreement') {
          // We only care about the existance of the property, not the value
          this.value.agreement.affiliate = _.value.metadata.hasOwnProperty('affiliate')
          this.value.agreement.policies = _.value.metadata.hasOwnProperty('policies')
          this.agreed = true
        } else if (_.key === 'entity-details') {
          this.value.entity.type = _.value.metadata.type
          this.value.entity.name = _.value.metadata.name
          this.value.entity.identifier = _.value.metadata.masked
          this.redacted = true
        }
      })
      if (this.$tenantInfo.features.legal === true && getMemberAttributes.length < 2) {
        this.$emit('hasLegal', { type: 'legal', isSet: false })
      } else {
        this.$emit('hasLegal', { type: 'legal', isSet: true })
      }
    },
    async save () {
      this.saving = true
      if (this.$refs.legalForm.validate()) {
        try {
          const { value: { initial } } = this
          if (!initial.entity && !this.redacted && this.$tenantInfo.features.legal.ssn !== false) {
            await this.saveEntity()
          }
          if ((!initial.policies || !initial.affiliate) && !this.agreed) {
            await this.savePolicies()
          }
          this.load()
          this.saving = false
        } catch (e) {
          this.saving = false
        }
      } else {
        this.saving = false
      }
    },
    async saveEntity () {
      const { value: { entity } } = this

      const plainText = entity.identifier
      const metadata = {
        type: entity.type,
        masked: `***-**-**${plainText.slice(-2)}`
      }
      if (entity.type === 'ein') {
        metadata.name = entity.name
        metadata.masked = `**-*****${plainText.slice(-2)}`
      }
      const encryptedDetails = await encrypt({ plainText, metadata }, 'tax-entity')
      const result = await this.upsertAttribute({
        private: true,
        key: 'entity-details',
        value: encryptedDetails.payload,
        signature: encryptedDetails.signature
      })

      return result
    },
    async savePolicies () {
      const { value: { clicked } } = this
      const encryptedAgreements = await encrypt({ plainText: 'on-legal', metadata: clicked })
      const result = await this.upsertAttribute({
        private: true,
        key: 'affiliate-agreement',
        value: encryptedAgreements.payload,
        signature: encryptedAgreements.signature
      })
      return result
    }
  },
  computed: {
    canSave() {
      if (this.$tenantInfo.features.legal.ssn || this.$tenantInfo.features.legal === true) {
        return !this.redacted || !this.agreed
      }
      return !this.agreed
    },
    ...mapState({
      user: state => state.user
    })
  }
}
</script>

<style scoped>
.doc-links {
  pointer-events: all;
}

.legal-form p {
  margin: 15px 3px;
  text-align: left;
}
.radios {
  height: 2em;
}
</style>
