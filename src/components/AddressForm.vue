<template>
  <div>
    <v-form
      ref="addressForm"
      @submit.prevent="save()"
      lazy-validation
    >
      <v-text-field
        label="Street"
        name="Street"
        v-model="address.street"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        label="Street 2"
        name="Street 2"
        v-model="address.street2"
      ></v-text-field>
      <v-text-field
        label="City"
        name="City"
        v-model="address.city"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        label="State/Province"
        name="State/Province"
        v-model="address.province"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        label="Postal Code"
        name="Postal Code"
        v-model="address.postalCode"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-select
        label="Country"
        name="Country"
        v-model="address.country"
        :rules="requiredRule"
        required
        :items="SELECT_ITEMS"
      ></v-select>
      <v-btn
        :disabled="saving"
        :loading="saving"
        type="submit"
        color="primary"
      >Save Address</v-btn>
    </v-form>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import _ from 'lodash'
import { ADDRESS_BY_CONTACT_ID, UPDATE_ADDRESS } from '@/graphql/Address.js'

export default {
  name: 'AddressForm',
  data () {
    return {
      SELECT_ITEMS: [
        { text: 'United States of America', value: 'US' },
        { text: 'United Kingdom', value: 'GB' },
        { text: 'Canada', value: 'CA' },
        { text: 'Australia', value: 'AU' },
        { text: 'New Zealand', value: 'NZ' }
      ],
      address: {
        id: null,
        name: null,
        street: null,
        city: null,
        province: null,
        country: null,
        postalCode: null,
        street2: null
      },
      requiredRule: [v => !!v || 'Field is required'],
      digitsOnlyRule: [
        v => !!v || 'Field is required',
        v => /^[\d]+(?:-[\d]+)*$/.test(v) || 'Field can only be digits'
      ],
      saving: false
    }
  },
  apollo: {
    address: {
      query: ADDRESS_BY_CONTACT_ID,
      variables () {
        return {
          input: {
            idIn: [this.memberId],
            tenantIn: [this.$tenantId]
          }
        }
      },
      update (data) {
        const results = _.get(data, 'membership.search.results[0].contacts[0].addresses')
        if (results && results[0]) {
          return Object.assign({}, results[0])
        } else {
          this.$emit('hasAddress', { type: 'address', isSet: false })
          console.error('No address info found')
          return {}
        }
      },
      skip() {
        return !this.memberId
      },
      client: 'federated'
    }
  },
  methods: {
    async save () {
      if (this.$refs.addressForm.validate()) {
        this.saving = true
        try {
          await this.$apollo.mutate({
            mutation: UPDATE_ADDRESS,
            variables: {
              input: {
                id: this.address.id,
                name: this.principal.member.name,
                street: this.address.street,
                city: this.address.city,
                province: this.address.province,
                country: this.address.country || 'US',
                postalCode: this.address.postalCode,
                street2: this.address.street2 || '',
                contactId: this.contactId,
                memberId: this.memberId
              }
            },
            update: (store, { data: { updateAddress } }) => {
              this.saving = false
              this.address = updateAddress
              this.$emit('addressSnackBarEmitSuccess', 'Address successfully updated')
              this.$emit('hasAddress', { type: 'address', isSet: true })
            },
            client: 'federated'
          })
        } catch (err) {
          console.error(err)
          this.saving = false
          this.$emit(
            'addressSnackBarEmitError',
            'Unable to save address information'
          )
        }
      } else {
        this.saving = false
        this.$emit(
          'addressSnackBarEmitError',
          'One or more fields were filled out incorrectly'
        )
      }
    }
  },
  computed: {
    ...mapState({
      principal: state => state.user.principal
    }),
    ...mapGetters(['contactId', 'memberId'])
  }
}
</script>
