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

export const parseData = (res) => {
  let idx = 0
  const data = _.chain(res)
    .get('comp.previewRun.data.slice')
    .transform((map, obj, key) => {
      const rl = obj.relativeLevel
      const token = rl || 'root'
      switch (obj.type) {
      case 'level':
        map.levels[`${token}`] = obj
        break

      case 'descendant':
        obj._id = idx++
        obj._level = map.levels[`${token}`]
        if (obj.metadata) {
          map.members.push(obj)
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
