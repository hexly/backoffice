import gql from 'graphql-tag'

export const USERNAME_UPSERT = gql`
  mutation iamUpsertUsername($input: IamUpsertUsernameUpsert!){ 
    iamUpsertUsername(input: $input)
  }
`
