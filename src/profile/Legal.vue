<template>
  <div class="legal-form">
    <div>
      <p>Please use this section to manage your legal and compliance details. If you need assistance,
        please contact support.
      </p>
      <v-form
        ref="legalForm"
        @submit.prevent="save"
        lazy-validation
      >
      <v-layout row wrap>
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
            <v-radio
              label="Individual"
              value="ssn"
            ></v-radio>
            <v-radio
              label="Business"
              value="ein"
            ></v-radio>
          </v-radio-group>
        </v-flex>
        <v-flex xs12
          :sm4="value.entity.type === 'ein'"
          :sm8="value.entity.type === 'ssn'">
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
            label="Business / Entity Name"
            v-if="value.entity.type === 'ein'"
            v-model="value.entity.name"
            persistent-hint
            required
          ></v-text-field>
        </v-flex>
      </v-layout>
      <v-flex xs12>
        <v-checkbox
          v-model="value.agreement.affiliate"
          :rules="requiredRule"
          :readonly="!value.clicked.affiliate"
          :persistent-hint="!value.clicked.affiliate"
          :disabled="agreed"
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
          v-model="value.agreement.policies"
          :rules="requiredRule"
          :readonly="!value.clicked.policies"
          :persistent-hint="!value.clicked.policies"
          :disabled="agreed"
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
      <br />
      <v-flex xs12>
        <v-btn
        :disabled="saving || (redacted && agreed)"
        :loading="saving"
        color="success"
        type="submit"
        >Save Legal Details</v-btn>
      </v-flex>
      </v-form>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapActions, mapState } from 'vuex'
import { encrypt } from '@/utils/EncryptionService'

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
      requiredRule: [v => !!v || 'Field is required']
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    ...mapActions({
      upsertAttribute: Actions.SET_ATTRIBUTE,
      getAttributes: Actions.GET_ATTRIBUTES
    }),
    async load() {
      const { data } = await this.getAttributes({
        key: ['affiliate-agreement', 'entity-details'],
        accessMode: 'ALL',
        memberId: this.user.principal.memberId
      })
      if (data.getMemberAttributes.length < 2) {
        this.$emit('hasLegal', { type: 'legal', isSet: false })
      } else {
        this.$emit('hasLegal', { type: 'legal', isSet: true })
      }
      data.getMemberAttributes.forEach(_ => {
        if (_.key === 'affiliate-agreement') {
          this.value.agreement.affiliate = !!_.value.metadata.affiliate
          this.value.agreement.policies = !!_.value.metadata.policies
          this.agreed = true
        } else if (_.key === 'entity-details') {
          this.value.entity.type = _.value.metadata.type
          this.value.entity.name = _.value.metadata.name
          this.value.entity.identifier = _.value.metadata.masked
          this.redacted = true
        }
      })
    },
    accept (value) {
      this.value.clicked[value] = moment.utc()
    },
    async save () {
      this.saving = true
      if (this.$refs.legalForm.validate()) {
        try {
          const { value: { initial } } = this
          if (!initial.entity && !this.redacted) {
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
      const encryptedDetails = await encrypt({ plainText, metadata })
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
      const encryptedAgreements = await encrypt({ plainText: '⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️', metadata: clicked })
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
    ...mapState({
      user: state => state.user
    })
  }
}
</script>

<style scoped>
.legal-form p {
  margin: 15px 3px;
  text-align: left;
}
.radios {
  height: 2em;
}
</style>
