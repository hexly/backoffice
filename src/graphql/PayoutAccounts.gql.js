import gql from 'graphql-tag'

export const GET_PAYOUT_ACCOUNT = gql`
  query payoutAccount($input: PayoutAccountSearchInput!){
    payouts {
      accounts(input:$input){
        results{
          id
          metadata
          status
          integrationKey
          validation{
            payable
            enabled
            requiresInformation
            notices {
              type
              key
              label
            }
            context
          }
        }
      }
    }
  }
`
export const CREATE_PAYOUT_ACCOUNT = gql`
  mutation createPayoutAccount($input: PayoutAccountCreateInput!){
    payouts {
      accountCreate(input:$input){
        type
        result
        account{
          id
          tenantIntegrationId
          integrationOid
          integrationKey
          priority
          status
          memberId
          metadata
        }
        message
        context
      }
    }
  }
`

export const UPDATE_PAYOUT_ACCOUNT = gql`
  mutation updatePayoutAccount($input: PayoutAccountUpdateInput!){
    payouts {
      accountUpdate(input:$input){
        type
        result
        account{
          id
          tenantIntegrationId
          integrationOid
          integrationKey
          priority
          status
          memberId
          metadata
        }
        message
        context
      }
    }
  }
`
