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
