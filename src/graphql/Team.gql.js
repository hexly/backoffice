import gql from 'graphql-tag'

export const TEAM_SEARCH_QUERY = gql`
  query teamSearch($input: TeamMemberSearchInput!) {
    membership {
      teamMemberSearch(input:$input){
        totalCount
        team {
          id
          name
          profileUrl
          slug
          email
          joinedOn
          relativeDepth
          birthdate
          status {
            key
          }
          tags {
            name
          }
          address {
            street
            street2
            city
            province
            postalCode
            country
          }
          ancestors {
            profileUrl
            name
          }
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
        birthdate
        contacts {
          emails {
            email
          }
        }
        profileUrl
      }
    }
    team: members(first: 10000, condition: $bySponsor) {
      nodes {
        awards {
          name
          metadata
        }
        id
        joinedOn
        tenantId
        name
        displayName
        mrn
        birthdate
        slugs {
          slug
        }
        addresses {
          street
          street2
          city
          province
          postalCode
          country
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

export const AWARDS_BY_ID = gql`
  query awardsById($input: MemberSearchCondition!){
    members(condition: $input) {
      nodes {
        id
        tenantId
        awards {
          id
          awardedOn
          name
          metadata
        }
      }
    }
  }
`

export const TEAM_STATS_BY_LEVEL = gql`
  query teamStatsByLevel($teamInput: TeamStatsInput) {
    teamStatsByLevel(input: $teamInput) {
      memberId
      tenantId
      personal
      firstLevel
      secondLevel
      thirdLevel
      fourthLevel
    }
  }
`
