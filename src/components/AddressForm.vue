<template>
  <div>
    <v-form @submit.prevent="save">
      <v-text-field
        label="Name"
        v-model="address.name"
        required
      ></v-text-field>
      <v-text-field
        label="Street"
        v-model="address.street"
        required
      ></v-text-field>
      <v-text-field
        label="Street 2"
        v-model="address.street2"
        required
      ></v-text-field>
      <v-text-field
        label="City"
        v-model="address.city"
        required
      ></v-text-field>
      <v-text-field
        label="State/Province"
        v-model="address.province"
        required
      ></v-text-field>
      <v-text-field
        label="Postal Code"
        v-model="address.postalCode"
        required
      ></v-text-field>
      <v-text-field
        label="Country"
        v-model="address.country"
        required
      ></v-text-field>
      <v-btn color="success" @click="save()">Save Address</v-btn>
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
      }
    }
  },
  apollo: {
    address: {
      query: ADDRESS_BY_MEMBER_ID,
      variables() {
        return {
          addressMemberId: {
            memberId: this.$store.state.user.principal.member.id
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
            street2: this.address.street2,
            memberId: this.$store.state.user.principal.member.id
          }
        },
        update: async (store, { data: { updateAddress } }) => {
          this.address = updateAddress
        }
      })
    }
  }
}
</script>
