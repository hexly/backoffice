import gql from 'graphql-tag'

export const GetMemberEvents = gql`
query Events($input: MembershipMemberSearchInput!, $marketingInput: MarketingMemberEventsInput) {
  membership {
    search(input: $input) {
      results {
        id 
        name
        events {
          memberId
          marketing (input: $marketingInput) {
            results {
              name
              id 
              key 
              status
              startTime
              endTime
              metadata
              settings
              participants {
                id
                label
                name
                email
              }
              template {
                 id 
                 name 
                 tenant {
                   id
                   name
                 }
              }
            }
          }
        }
      }
    }
  }
}
`
