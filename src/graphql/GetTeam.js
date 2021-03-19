import gql from 'graphql-tag'

export const TEAM_SPONSOR_QUERY = gql`
  query TeamByMemberId($bySponsor: MemberSearchCondition!) {
    team: members(first: 500, condition: $bySponsor) {
      nodes {
        id
        tenantId
        name
        displayName
        mrn
        slugs{
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

export const TEAM_SPONSOR_QUERY_FEDERATED = gql`
  query TeamByMemberId($input: TeamInput!) {
    membership {
      team(input: $input) {
        nodes {
          id
          tenantId
          name
          displayName
          mrn
          slug
          email
          profileUrl
        }
      }
    }
  }
`
