import gql from 'graphql-tag'

export const CreateMemberEvent = gql`
  mutation CreateMemberEvent($input: MarketingMemberEventInput!) {
    marketing {
      memberEvent(input: $input) {
        id
        participants {
          name
          id
          memberId
          role
        }
        template {
          id
          name
          status
        }
      }
    }
  }
`

export const ClaimEventReward = gql`
  mutation ClaimRewards($input: MarketingMemberEventRewardClaimInput!) {
    marketing {
      claimEventReward(input: $input) {
        message
      }
    }
  }
`

export const ResendPromoEmails = gql`
  mutation ResendCreatedNotification($input: MarketingMemberEventOpsInput!, $input1: MarketingMemberEventResendNotificationInput!) {
    marketing {
      event(input: $input){
        resendNotification(input: $input1){
          message
          metadata
        }
      }
    }
  }
`
