import gql from 'graphql-tag'

export const TRENDS = gql`
query trendsQuery($input: EngineDataRequest!){
  engine{
    bi {
      data(input: $input){
        datasets  {
          ref
          data
          settings
        }
      }
    }
  }
}
`
