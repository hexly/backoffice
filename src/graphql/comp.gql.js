import gql from 'graphql-tag'
import _ from 'lodash'

export const TEST_QUERY = gql`
query Foo1($payload: CompRunDataInput) {
  comp {
    previewRun(input: $payload){
      key
      data
    }
  }
}
`

export const BINDER = {
  query: TEST_QUERY,
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

export const getCompStats = (memberId, types) => ({
  query: TEST_QUERY,
  variables: {
    payload: {
      input: {
        memberId,
        rowTypeIn: types
      }
    }
  },
  client: 'federated'
})

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
        map.members.push(obj)
        break

      default:
        console.warn('Unexpected case of row', obj)
        break
      }
    }, { levels: {}, members: [] })
    .value()

  return data
}
