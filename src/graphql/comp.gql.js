import gql from 'graphql-tag'
import _ from 'lodash'

export const INSIGHTS = gql`
query insights($input: InsightInput) {
  comp {
    insights(input: $input){
      insights {
        key
        labels {
          header
          tagline
        }
        values {
          tagline
          tooltip
          formatted
        }
        metadata
      }
    }
  }
}
`

export const INSIGHTS_COLLECTION = gql`
query insightCollection($input: InsightCollectionInput){
  comp {
    insightCollection(input: $input) {
      layout 
      sections {
        type
        labels
        display
        components {
          key 
          type
          visualizations
          settings
          metadata
          display
        }
      }
    }
  }
}
`

export const COMP_PREVIEW_QUERY = gql`
query compRunPreview($payload: CompRunDataInput) {
  comp {
    previewRun(input: $payload){
      key
      data
    }
  }
}
`

export const ENGINE_STATS_QUERY = gql`
query getEngineStats($payload: EngineRankingsInput!){
  engine {
    rankings(input: $payload){
      results {
        sponsor {
          id
          displayName
          avatar {
            assetUrl
          }
          contacts{
            emails{
              email
            }
          }
        }
        periodId
        memberId
        mrn
        name
        email
        profileUrl
        market
        marketId
        recognizedRank
        rank
        earnings
        stats
        awarded
        progression {
          label
          key
          earned
          delta
          threshold
          ordinal
          status
          fulfilled
        }
        team{
          activityCounts{
            active
            inactive
          }
          rankCounts {
            rank0
            rank1
            rank2
            rank3
            rank4
            rank5
            rank6
            rank7
            rank8
            rank9
            rank10
            rank11
            rank12
          }
          groupCount
          downlineCount
          qualifiedCount
          levels {
            level
            count
            qualifiedCount
          }
          generations {
            level
            count
            qualifiedCount
          }
        }
      }
    }
  }
}
`

export const ENGINE_TEAM_STATS_QUERY = gql`
query getEngineStats($payload: EngineRankingsInput!, $filter: EngineRankingTeamFilter){
  engine {
    rankings(input: $payload){
      results {
        memberId
        team{
          teammates(input: $filter){
            page
            totalResults
            totalPages
            results {
              metadata
              progression {
                label
                key
                earned
                delta
                threshold
                ordinal
                status
                fulfilled
              }
              periodId
              memberId
              mrn 
              name
              email
              profileUrl
              market
              marketId
              recognizedRank
              rank
              stats
              awarded
              team {
                groupCount 
                downlineCount 
                qualifiedCount
              }
            }
          }
        }
      }
    }
  }
}
`

export const getCompStats = (params) => {
  const {
    memberId,
    types,
    periodId,
    page = 1,
    pageSize = 25,
    levelIn,
    memberIn,
    rankIn,
    qualifiedIn,
    nameIn,
    sortBy
  } = params

  return {
    query: COMP_PREVIEW_QUERY,
    variables: {
      payload: {
        input: {
          memberId,
          periodId,
          rowTypeIn: types,
          page,
          pageSize,
          levelIn,
          memberIn,
          rankIn,
          qualifiedIn,
          nameIn,
          sortBy
        }
      }
    },
    fetchPolicy: 'network-only',
    client: 'federated'
  }
}

export const formatData = (member) => {
  const rankNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  const group = _.get(member, 'team.groupCount', 0) || 0
  const downline = _.get(member, 'team.downlineCount', 0) || 0
  const qualified = _.get(member, 'team.qualifiedCount', 0) || 0
  const rawLevels = _.get(member, 'team.levels', []) || []
  const rankCounts = _.get(member, 'team.rankCounts', {}) || {}
  const activeCount = _.get(member, 'team.activityCounts.active', 0) || 0
  const inactiveCount = _.get(member, 'team.activityCounts.inactive', 0) || 0
  const ranks = {}
  rankNumbers.forEach(r => {
    if (rankCounts[`rank${r}`]) {
      ranks[r] = rankCounts[`rank${r}`]
    }
  })
  const levels = rawLevels.map(l => {
    return {
      level: l.level,
      total: l.count,
      qualified: l.qualifiedCount
    }
  })
  levels.shift()
  const reqs = _.get(member, 'progression', []) || []
  const progression = reqs.map(r => {
    return {
      delta: r.delta,
      category: r.key,
      notApplicable: r.status === 'NOT_APPLICABLE',
      achieved: r.status === 'MET',
      earned: r.earned,
      required: r.threshold
    }
  })
  const counts = { group, downline, qualified, levels, ranks, allTime: activeCount + inactiveCount, activeCount, inactiveCount }
  const rank = _.get(member, 'rank', 0) || 0
  const recognizedRank = _.get(member, 'recognizedRank', 0) || 0
  const market = _.get(member, 'market', 0) || 0
  const mrn = _.get(member, 'mrn', 0) || 0
  const name = _.get(member, 'name', null)
  const profileUrl = _.get(member, 'profileUrl', null)
  const email = _.get(member, 'email', null)
  const metadata = {
    profileAsset: profileUrl,
    email,
    name,
    requirements: progression,
    counts,
    market,
    mrn,
    recognizedRank,
    ranking: { rank, name: `Rank ${rank}` },
    nextRanking: { rank: Math.min(rank + 1, 12), name: `Rank ${Math.min(rank + 1, 12)}` }
  }
  const sponsor = _.get(member, 'sponsor', {}) || {}
  const memberStats = _.get(member, 'stats', {}) || {}
  const earnings = _.get(member, 'earnings')
  const awarded = _.get(member, 'awarded', {}) || {}
  const memberId = _.get(member, 'memberId')
  const periodId = _.get(member, 'periodId')
  const { relativeDepth: relativeLevel } = _.get(member, 'metadata', {})
  return {
    id: memberId,
    relativeLevel,
    awarded,
    periodId,
    memberId,
    counts,
    metadata,
    stats: { ...memberStats, earnings },
    earnings,
    sponsor
  }
}

export const parseData = (res) => {
  let idx = 0
  const data = _.chain(res)
    .get('comp.previewRun.data.slice')
    .transform((map, obj, key) => {
      const _obj = Object.assign({}, obj)
      const rl = obj.relativeLevel
      const token = rl || 'root'
      switch (obj.type) {
      case 'level':
        map.levels[`${token}`] = obj
        break

      case 'descendant':
        _obj._id = idx++
        _obj._level = map.levels[`${token}`]
        if (obj.metadata) {
          map.members.push(_obj)
        }
        break

      default:
        console.warn('Unexpected case of row', obj)
        break
      }
    }, { levels: {}, members: [] })
    .value()

  return data
}

export const getEngineStats = (params) => {
  const {
    memberId,
    periodId
  } = params

  return {
    query: ENGINE_STATS_QUERY,
    variables: {
      payload: {
        memberIn: [{
          memberId,
          periodId
        }]
      }
    },
    fetchPolicy: 'network-only',
    client: 'federated'
  }
}

export const getTeamEngineStats = (params) => {
  const {
    memberIn,
    memberId,
    periodId,
    levelIn,
    rankIn,
    qualifiationIn,
    nameLikeIn,
    sort,
    page = 1,
    pageSize = 25
  } = params

  return {
    query: ENGINE_TEAM_STATS_QUERY,
    variables: {
      payload: {
        input: {
          memberIn: [{
            memberId,
            periodId
          }]
        },
        filter: {
          nameLikeIn,
          memberIn,
          rankIn,
          levelIn,
          qualifiationIn,
          sort,
          page,
          pageSize
        }
      }
    },
    fetchPolicy: 'network-only',
    client: 'federated'
  }
}

export const FRONTLINE_STATS = gql`
query frontlineStats($input: FrontlineStatsInput!){
  engine {
    frontlineStats(input:$input){
      memberId
      sponsorId
      teamSize
      frontlineSize
      stats
      member{
        avatar {
          assetUrl
        }
        displayName
      }
    }
  }
}
`
