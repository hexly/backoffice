import gql from 'graphql-tag'

export const zendeskUsers = gql`
  query Agents {
    supportUsers(input: { memberIds: [1030] }) {
      results {
        agentId
        memberId
        type
        name
        identifier
        claims
      }
    }
  }
`

export const zendeskAuth = gql`
  mutation AgentAction($input: SupportUserCommand!) {
    supportUserCommand(input: $input) {
      metadata
    }
  }
`
