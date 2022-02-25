import gql from 'graphql-tag'

export const GetMemberEvents = gql`
query Events($input: MembershipMemberSearchInput!, $marketingInput: MarketingMemberEventSearchInput) {
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
                role
              }
              rewards {
                id
                progression {
                  awarded
                  claimed
                  delta
                  earned
                  label
                  progress
                  target
                  visible
                }
                reward {
                  id
                  key
                  metadata
                  name
                  settings
                  type
                }
              }
              template {
                 id 
                 name 
                 tenant {
                   id
                   name
                 }
                windows {
                  duration
                  id
                  key
                  name
                  rewards {
                    name
                    id
                    requirements {
                      expressions
                      key
                      metadata
                      type
                    }
                    metadata
                  }
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
