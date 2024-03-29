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
import { ADDRESS_BY_MEMBER_SEARCH, UPDATE_ADDRESS, CREATE_ADDRESS } from '@/graphql/Address.js'
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
      query: ADDRESS_BY_MEMBER_SEARCH,
      variables () {
        return {
          addressContactId: {
            contactId: this.contactId,
            tenantId: this.$tenantId
          }
        }
      },
      update ({ addressByContactOrTenant }) {
        if (addressByContactOrTenant && addressByContactOrTenant[0]) {
          return Object.assign({}, addressByContactOrTenant[0])
        } else {
          this.$emit('hasAddress', { type: 'address', isSet: false })
          console.error('No address info found')
          return {}
        }
      },
      skip() {
        return !this.contactId
      }
    }
  },
  methods: {
    async save () {
      if (this.$refs.addressForm.validate()) {
        this.saving = true
        try {
          const input = {
            id: this.address.id,
            name: this.principal.member.name,
            street: this.address.street,
            city: this.address.city,
            province: this.address.province,
            country: this.address.country || 'US',
            postalCode: this.address.postalCode,
            street2: this.address.street2 || '',
            contactId: this.contactId,
            memberId: this.principal.memberId
          }
          if (this.address.id) {
            console.log('updating')
            await this.$apollo.mutate({
              mutation: UPDATE_ADDRESS,
              client: 'federated',
              variables: { input },
              update: (store, { data: { updateAddress } }) => {
                this.saving = false
                this.address = updateAddress
                this.$emit('addressSnackBarEmitSuccess', 'Address successfully updated')
                this.$emit('hasAddress', { type: 'address', isSet: true })
              }
            })
          } else {
            console.log('creating')
            await this.$apollo.mutate({
              mutation: CREATE_ADDRESS,
              client: 'federated',
              variables: { input },
              update: (store, { data: { createAddress } }) => {
                this.saving = false
                this.address = createAddress
                this.$emit('addressSnackBarEmitSuccess', 'Address successfully created')
                this.$emit('hasAddress', { type: 'address', isSet: true })
              }
            })
          }
        } catch (err) {
          console.error({ err })
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
    ...mapGetters(['contactId'])
  }
}
</script>
