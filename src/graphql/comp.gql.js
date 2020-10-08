import gql from 'graphql-tag'
import _ from 'lodash'

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

export const BINDER = {
  query: COMP_PREVIEW_QUERY,
  variables () {
    return {
      dummy: {
        input: {
          memberId: 82889,
          runId: 8,
          rowTypeIn: ['level', 'descendant']
        }
      }
    }
  },
  result ({ data, loading, networkStatus }) {
    this.closeAllGroups()
  },
  update (res) {
    let idx = 0
    const data = this._.chain(res)
      .get('comp.dummy.data.slice')
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
          map.members.push(obj)
          break

        default:
          console.warn('Unexpected case of row', obj)
          break
        }
      }, { levels: {}, members: [] })
      .value()

    return data
  },
  client: 'federated'
}

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
    nameIn
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
          nameIn
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
