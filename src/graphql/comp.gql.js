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
      rankings {
        periodId
        memberId
        mrn 
        name
        market
        marketId
        recognizedRank
        rank
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
        stats
        progression {
          label
          key
          earned
          delta
          threshold
          ordinal
        }
        team{
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
      rankings {
        team{
          teammates(filter: $filter){
            progression {
              label
              key
              earned
              delta
              threshold
              ordinal
            }
            periodId
            memberId
            mrn 
            name
            market
            marketId
            recognizedRank
            rank
            stats
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
  const group = _.get(member, 'team.groupCount', 0)
  const downline = _.get(member, 'team.downlineCount', 0)
  const qualified = _.get(member, 'team.downlineCount', 0)
  const rawLevels = _.get(member, 'team.levels', [])
  const rankCounts = _.get(member, 'rankCounts', {})
  const ranks = {}
  rankNumbers.forEach(r => {
    ranks[r] = rankCounts[`rank${r}`]
  })
  const levels = rawLevels.map(l => {
    return {
      level: l.level,
      total: l.count,
      qualified: l.qualifiedCount
    }
  })
  const reqs = _.get(member, 'progression', [])
  const progression = reqs.map(r => {
    return {
      category: r.key,
      notApplicable: r.status === 'NOT_APPLICABLE',
      achieved: r.status === 'MET',
      earned: r.earned,
      required: r.threshold
    }
  })
  const counts = { group, downline, qualified, levels, ranks }
  const rank = _.get(member, 'rank', [])
  const recognizedRank = _.get(member, 'recognizedRank', [])
  const metadata = {
    requirements: progression,
    counts,
    recognizedRank,
    ranking: { rank, name: `Rank ${rank}` },
    nextRanking: { rank: Math.min(rank + 1, 12), name: `Rank ${Math.min(rank + 1, 12)}` }
  }
  const memberStats = _.get(member, 'stats', [])
  const memberId = _.get(member, 'memberId', [])
  const periodId = _.get(member, 'periodId', [])
  return {
    id: periodId,
    periodId,
    memberId,
    counts,
    metadata,
    stats: memberStats
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
        membersIn: [{
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
    membersIn,
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
          membersIn,
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
