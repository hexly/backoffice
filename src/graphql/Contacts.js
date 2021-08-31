import gql from 'graphql-tag'

export const CONTACT_UPSERT = gql`
  mutation contactsUpsert($input: ContactUpsertInput!){ 
    contactsUpsert(input: $input){
      id
    }
  }
`

export const CONTACT_EMAIL_UPSERT = gql`
  mutation contactsUpsertEmail($input: EmailInput){
    contactsUpsertEmail(input: $input){
      id
    }
  }
`

export const LAT_LONGS = gql`
  query latLongs ($input: LatLongByTenantInput) {
    membership {
      latLongByTenant(input: $input) {
        lat
        long
      }
    }
  }
`
