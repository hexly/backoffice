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

export const TEAM_QUERY = gql`
  query TeamByMemberId(
    $bySponsor: MemberSearchCondition!
    $byTarget: MemberSearchCondition!
  ) {
    target: members(condition: $byTarget) {
      nodes {
        id
        tenantId
        name
        displayName
        mrn
        slugs {
          slug
        }
        contacts {
          emails {
            email
          }
        }
        profileUrl
      }
    }
    team: members(first: 500, condition: $bySponsor) {
      nodes {
        awards {
          name
          metadata
        }
        id
        tenantId
        name
        displayName
        mrn
        slugs {
          slug
        }
        contacts {
          emails {
            email
          }
        }
        profileUrl
      }
    }
  }
`
