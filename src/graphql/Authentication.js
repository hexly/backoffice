import gql from 'graphql-tag'

export const AUTHENTICATE = gql`
  mutation authenticate($authInput: AuthenticateInput!){ 
    authenticate(input: $authInput) {
      jwtToken 
    }
  }
`

export const GENERATE_TOKEN = gql`
  mutation generateOneTimeToken($input: GenerateOneTimeTokenInput!) {
    generateOneTimeToken(input: $input)
  }
`

export const VALIDATE_TOKEN = gql`
  query oneTimeToken($token: OneTimeTokenInput!){ 
    oneTimeToken(input: $token) {
      contacts {
        id
        emails {
          id
          email
        }
      }
      displayName
      id
      name
    }
  }
`

export const CONSUME_TOKEN = gql`
  mutation consumeOneTimeToken($input: ConsumeOneTimeTokenInput!){ 
    consumeOneTimeToken(input: $input)
  }
`

export const RESET_TOKEN = gql`
  mutation resetOneTimeToken($input:ResetOneTimeTokenInput!) {
    resetOneTimeToken(input:$input)
  }
`
