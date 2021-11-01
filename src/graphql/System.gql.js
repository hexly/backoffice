import gql from 'graphql-tag'

export const DIAGNOSTICS = gql`
  mutation saveUserDiagnostics($input: UserDiagnosticsInput!){
    system {
      userDiagnostics (input: $input ) {
        data
      }
    }
  }
`
