import gql from 'graphql-tag'

export const QUERY = gql`
  query TeamByMemberId(
    $bySponsor: IdentityCondition!
    $byTarget: IdentityCondition!
  ) {
    target: allIdentities(condition: $byTarget) {
      nodes {
        memberId
        tenantId
        name
        displayName
        mrn
        slug
        email
        profileUrl
      }
    }
    team: allIdentities(condition: $bySponsor) {
      nodes {
        memberId
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
`

export const getTeamByMemberId = memberIdFn => {
  if (!memberIdFn) return
  return {
    query: QUERY,
    variables: function () {
      const { principal: member } = this.$store.state.user
      const memberId = this[memberIdFn] || member.memberId || -1
      return {
        byTarget: { memberId },
        bySponsor: { sponsorId: memberId }
      }
    },
    update ({ target, team }) {
      return {
        target: target.nodes[0],
        team: team.nodes
      }
    }
  }
}

export default getTeamByMemberId
