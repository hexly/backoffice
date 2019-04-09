<template>
  <div class="legal-form">
    <div>
      <p>Please use this section to manage your legal and compliance details. If you need assistance,
        please contact support.
      </p>

      <v-radio-group
        class="radios"
        v-model="value.entity.type"
        :mandatory="false"
        row
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
      <v-text-field
        v-if="value.entity.type"
        :label="value.entity.type.toUpperCase()"
        v-model="value.entity.identifier"
        hint="This data is stored encrypted and used only for tax purposes"
        persistent-hint
        required
      >
      </v-text-field>
      <v-text-field
        label="Business / Entity Name"
        v-if="value.entity.type === 'ein'"
        v-model="value.entity.name"
        persistent-hint
        required
      ></v-text-field>
      <v-flex xs12>
        <v-checkbox
          v-model="value.agreement.affiliate"
          :rules="requiredRule"
          :readonly="!value.clicked.affiliate"
          :persistent-hint="!value.clicked.affiliate"
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
        <v-btn @click="save()">Someone pretty me</v-btn>
      </v-flex>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapActions } from 'vuex'
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
      requiredRule: [v => !!v || 'Field is required']
    }
  },
  methods: {
    ...mapActions({
      upsertAttribute: Actions.SET_ATTRIBUTE
    }),
    accept (value) {
      this.value.clicked[value] = moment.utc()
    },
    async save () {
      let entity, policies
      const { value: { initial } } = this
      if (!initial.entity) {
        entity = await this.saveEntity()
        console.log({ entity })
      }
      if (!initial.policies || !initial.affiliate) {
        policies = await this.savePolicies()
        console.log({ policies })
      }
      this.$emit('saved', { entity, policies })
    },
    async saveEntity () {
      const { value: { entity } } = this

      const plainText = entity.identifier
      const metadata = {
        type: entity.type
      }
      if (entity.type === 'ein') {
        metadata.name = entity.name
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
      const { value: { agreement } } = this
      const encryptedAgreements = await encrypt({ plainText: '', metadata: agreement })
      const result = await this.upsertAttribute({
        private: true,
        key: 'affiliate-agreement',
        value: encryptedAgreements.payload,
        signature: encryptedAgreements.signature
      })
      return result
    }
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
