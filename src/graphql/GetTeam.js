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
        birthdate
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
