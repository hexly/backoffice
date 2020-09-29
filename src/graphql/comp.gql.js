import gql from 'graphql-tag'

export const TEST_QUERY = gql`
query Foo1($dummy: CompRunDataInput) {
  comp {
    dummy(input: $dummy){
      key
      data
    }
  }
}
`
