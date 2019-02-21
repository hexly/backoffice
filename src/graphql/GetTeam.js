import gql from 'graphql-tag'

export const QUERY = gql`
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
        contactEmail
        profileUrl
      }
    }
    team: members(condition: $bySponsor) {
      nodes {
        id
        tenantId
        name
        displayName
        mrn
        slug
        contactEmail
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
      console.log('query', memberId)
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
    }
  }
}

export default getTeamByMemberId
