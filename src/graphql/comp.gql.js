import gql from 'graphql-tag'

export const TEST_QUERY = gql`
query Foo1($payload: CompRunDataInput) {
  comp {
    previewRun(input: $payload){
      key
      data
    }
  }
}
`
