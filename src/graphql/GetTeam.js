import gql from 'graphql-tag'

export const QUERY = gql`
  query TeamByMemberId(
    $bySponsor: IdentityCondition!
    $byTarget: IdentityCondition!
  ) {
    target: allIdentities(condition: $byTarget) {
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
    team: allIdentities(condition: $bySponsor) {
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
`

export default cfg => {
  const result = {
    ...cfg,
    query: QUERY,
    update({ target, team }) {
      return {
        target: target.nodes[0],
        team: team.nodes
      }
    }
  }
  return result
}
