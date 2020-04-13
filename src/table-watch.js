'use strict'

const r = require('rethinkdb')

module.exports = ({ rethinkOptions }) => {
  return (table) => {
    return watch({ rethinkOptions, table })
  }
}

async function watch ({ rethinkOptions, table }) {
  const conn = await r.connect(rethinkOptions)
  const options = {
    squash: true,
    includeInitial: true,
    includeTypes: true
  }
  const changes = await r.table(table).changes(options).run(conn)

  const iterable = {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          const value = await changes.next()
          return { value, done: false }
        }
      }
    }
  }
  return iterable
}