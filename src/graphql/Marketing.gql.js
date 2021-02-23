import gql from 'graphql-tag'

export const COUPONS = gql`
query couponSearch($input: CouponSearchInput!) {
  marketing {
    couponSearch(input: $input){
      id
      tenantId
      awardedDate
      status
      type
      memberId
      code
      config
      metadata
      issuedOn
      expiresOn
      lock
    }
  }
}
`
