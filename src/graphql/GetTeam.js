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
  query TeamByMemberId($input7: TeamInput!) {
    membership {
      team(input: $input7) {
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
