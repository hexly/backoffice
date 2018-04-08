import gql from 'graphql-tag'

export const QUERY = gql`
  query TeamByMemberId(
    $bySponsor: IdentityCondition!
    $byTarget: IdentityCondition!
  ) {
    target: allIdentities(condition: $byTarget) {
      nodes {
        id
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
        id
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

export const getTeamByMemberId = memberIdFn => ({
  query: QUERY,
  variables: function() {
    const memberId = this[memberIdFn] || -1
    return {
      byTarget: {
        memberId: memberId
      },
      bySponsor: {
        sponsorId: memberId
      }
    }
  },
  update({ target, team }) {
    return {
      target: target.nodes[0],
      team: team.nodes
    }
  }
})

export default getTeamByMemberId
