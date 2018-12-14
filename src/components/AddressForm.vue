<template>
  <div>
    <v-form ref="addressForm" @submit.prevent="save()" lazy-validation>
      <v-text-field
        label="Name"
        v-model="address.name"
        :rules="requiredRule"
        required
        id="AddressName"
      ></v-text-field>
      <v-text-field
        label="Street"
        v-model="address.street"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        label="Street 2"
        v-model="address.street2"
      ></v-text-field>
      <v-text-field
        label="City"
        v-model="address.city"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        label="State/Province"
        v-model="address.province"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        label="Postal Code"
        v-model="address.postalCode"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        label="Country"
        v-model="address.country"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-btn :disabled="saving" :loading="saving" type="submit" color="success">Save Address</v-btn>
    </v-form>
  </div>
</template>

<script>
import { ADDRESS_BY_MEMBER_ID, UPDATE_ADDRESS } from '@/graphql/Address.js'
export default {
  name: 'AddressForm',
  data() {
    return {
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
      saving: false
    }
  },
  apollo: {
    address: {
      query: ADDRESS_BY_MEMBER_ID,
      variables() {
        return {
          addressMemberId: {
            memberId: this.$store.state.user.principal.memberId
          }
        }
      },
      update({ addressByMemberOrTenant }) {
        return Object.assign({}, addressByMemberOrTenant[0])
      }
    }
  },
  methods: {
    save() {
      if (this.$refs.addressForm.validate()) {
        this.saving = true
        this.$apollo.mutate({
          mutation: UPDATE_ADDRESS,
          variables: {
            addressInput: {
              id: this.address.id,
              name: this.address.name,
              street: this.address.street,
              city: this.address.city,
              province: this.address.province,
              country: this.address.country,
              postalCode: this.address.postalCode,
              street2: this.address.street2 || '',
              memberId: this.$store.state.user.principal.memberId
            }
          },
          update: (store, { data: { updateAddress } }) => {
            this.saving = false
            this.address = updateAddress
            this.$emit('addressSaved')
          }
        })
      }
    }
  }
}
</script>
