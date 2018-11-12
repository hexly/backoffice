import gql from 'graphql-tag'

export const CREATE_OTT = gql`
  mutation generateOneTimeToken($input: GenerateOneTimeTokenInput!) {
    generateOneTimeToken(input: $input)
  }
`
