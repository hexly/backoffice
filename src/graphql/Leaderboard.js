import gql from 'graphql-tag'

export const SALES_LEADERBOARD = gql`
  query salesleadersByTeam($leaderInput: LeaderboardInput!) {
    monthlySalesLeaderboardByTeam(input: $leaderInput) {
      name
      contactEmail
      total
      profileUrl
      joinedOn
    }
  }
`

export const FRONTLINE_LEADERBOARD = gql`
  query frontlineLeaderByTeam($leaderInput: LeaderboardInput!) {
    monthlyFrontlineLeaderboardByTeam(input: $leaderInput) {
      name
      contactEmail
      total
      profileUrl
      joinedOn
    }
  }
`

export const FRONTLINE_LEADERBOARD_BY_RANGE = gql`
  query frontlineLeaderByTeam ($input: RangedLeaderboardInput!) {
    engine {
      rangedFrontlineLeaderboardByTeam(input: $input) {
        name
        contactEmail
        total
        profileUrl
        joinedOn
      }
    }
  }
`

export const COMPANY_SALES_LEADERBOARD = gql`
  query salesleaders($leaderInput: LeaderboardInput!) {
    monthlySalesLeaderboard(input: $leaderInput) {
      name
      contactEmail
      total
      profileUrl
      joinedOn
    }
  }
`

export const COMPANY_FRONTLINE_LEADERBOARD = gql`
  query frontlineLeader($leaderInput: LeaderboardInput!) {
    monthlyFrontlineLeaderboard(input: $leaderInput) {
      name
      contactEmail
      total
      profileUrl
      joinedOn
    }
  }
`

export const COMPANY_FRONTLINE_LEADERBOARD_BY_RANGE = gql`
  query frontlineLeader($input: RangedLeaderboardInput!) {
    rangedFrontlineLeaderboard(input: $input) {
      name
      contactEmail
      total
      profileUrl
      joinedOn
    }
  }
`

export const SELLER_LEADERBOARD = gql`
  query sellerLeaderboard($input: LeaderboardInput!) {
    comp{
      salesLeaderboard(input: $input) {
        memberId
        displayName
        points
        rank
        marketRank
        profileUrl
        market
      }
    }
  }
`
