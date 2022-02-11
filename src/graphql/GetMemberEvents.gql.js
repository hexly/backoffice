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
              id 
              key 
              status
              startTime
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
