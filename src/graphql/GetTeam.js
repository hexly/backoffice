import gql from 'graphql-tag'

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
        slug
        contacts {
          emails {
            email
          }
        }
        profileUrl
      }
    }
    team: members(first: 100, condition: $bySponsor) {
      nodes {
        id
        tenantId
        name
        displayName
        mrn
        slug
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

export const TEAM_SPONSOR_QUERY = gql`
  query TeamByMemberId($bySponsor: MemberSearchCondition!) {
    team: members(first: 100, condition: $bySponsor) {
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

export const getTeamByMemberId = (memberIdFn, watchLoading) => {
  if (!memberIdFn) return
  return {
    query: TEAM_QUERY,
    variables: function () {
      const { principal: member } = this.$store.state.user
      const memberId = this[memberIdFn] || member.memberId || -1
      return {
        byTarget: { ids: [memberId] },
        bySponsor: { sponsorIds: [memberId] }
      }
    },
    update ({ target, team }) {
      return {
        target: target.nodes[0],
        team: team.nodes
      }
    },
    watchLoading
  }
}

export default getTeamByMemberId
