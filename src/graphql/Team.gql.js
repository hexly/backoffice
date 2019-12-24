import gql from 'graphql-tag'

export const TEAM_SEARCH_QUERY = gql`
  query teamSearch($input: MemberTeamSearchInput!) {
    memberTeamSearch(input:$input){
      totalCount
      team {
        id
        name
        profileUrl
        slug
        email
        joinedOn
        relativeDepth
        relativePathMembers {
          profileUrl
          name
        }
      }
    }
  }
`
