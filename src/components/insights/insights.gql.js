import gql from 'graphql-tag'

export const RUN_REPORT = gql`
  mutation runReport($input: BIReportRunInput){
    bi {
      reporting {
        run(input: $input){
          sample 
          processUrl
          params
        }
      }
    }
  }
`

export const GET_REPORTS = gql`
  query Reports($input: ReportsQueryInput!){
    reports(input: $input){
      id
      name
      description
      parameters
    }
  }
`
