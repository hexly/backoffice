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

export const GET_TEAM_SALES = gql`
  query teamAttribution($input: EngineAttributionSearchInput!){
    engine {
      getTeamAttributions(input: $input){
        page
        pageSize
        results {
          purchaseOrder {
            id
            statusOid
          }
          awardedDate
          awardee {
            id
            mrn
            displayName
            avatar{
              assetUrl
            }
            contacts {
              emails {
                email
              }
            }
          }
          integrationOid
          stats
          taxonomy
        }
        totalPages
        totalResults
      }
    }
  }
`
