import gql from 'graphql-tag'

export const ADJUST_TAGS = gql`
  mutation adjustMemberTags($input: MemberTagAdjustmentInput!){ 
    adjustTags(input: $input){
      tags
    }
  }
`

export const GET_MEMBER_PAYOUTS = gql`
  query payoutsThroughPrincipal {
    getPrincipal {
      member{
        id
        payouts {
          id
          status
          currency
          amount
          note
          params
          metadata
          holdUntil
          issuedOn
          releasedOn
          acceptedOn
          integration {
            name
            key
          }
          deductions {
            id
            amount
            type
            issuedOn
            note
          }
        }
      }
    }
  }
`

export const SEARCH_MEMBER_DIRECTORY = gql`
  query searchMemberDirectory($input: searchTeamWithUplineInput!) {
    searchTeamWithUpline(input: $input)
  }
`

export const MEMBER_AWARDS = gql`
  query memberAwards($input: MembershipMemberSearchInput!){
    membership {
      search(input: $input) {
        results {
          id
          joinedOn
          awards {
            name
            metadata
          }
        }
      }
    }
  }
`

export const GET_MEMBERS = gql`
  query Member($input: MembershipMemberSearchInput!){
    membership {
      search(input: $input) {
        results {
          firstName
          lastName
          id
          birthdate
          tenantId
          name
          displayName
          mrn
          slug
          contacts {
            id
            emails {
              id
              email
            }
          }
          avatar {
            assetUrl
          }
        }
      }
    }
  }
`

export const UPDATE_PROFILE = gql`
  mutation updateMemberSubset($input: MemberInfoInputSubset!) {
    updateMemberSubset(input: $input) {
        id
    }
  }
`

export const MARKET_COUNT = gql`
query marketCount($input: MarketTresholdCountInput) {
  membership {
    marketThresholdCount(input: $input){
      name
      key
      count
    }
  }
}
`

export const WELCOME_EMAIL = gql`
mutation welcomeEmail($input: WelcomeEmailInput) {
  membership {
    welcomeEmail(input: $input){
      status
    }
  }
}
`
