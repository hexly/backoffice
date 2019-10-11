import gql from 'graphql-tag'

export const MEMBER_STATS_BY_DEPTH = gql`
  query teamDataByDepth($input: getTeamDataByDepthInput!){ 
    getTeamDataByDepth(input: $input) {
      id
      lineage
      name
      firstName
      lastName
      displayName
      mrn
      profileUrl
      createdOn
      joinedOn
      claimedOn
      slugs
      counts
      emails
    }
  }
`

export const MEMBER_TOTAL_COUNT = gql`
  query memberCount($input: CountInput!){ 
    memberCount(input: $input) {
      count
      type
    }
  }
`
export const MAX_MRN = gql`
  query getMaxMrn($input: MrnForTenantInput){
    memberGetMaxMrnForTenant(input: $input)
  }
`
