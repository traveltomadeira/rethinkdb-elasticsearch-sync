'use strict'

const r = require('rethinkdb')
const delay = require('delay')

module.exports = async function*({ rethinkOptions, freqPollMS = 5000 }) {
  const conn = await r.connect(rethinkOptions)
  let tables = []

  while (true) {
    for (let newTable of (await poll())) {
      yield newTable
    }

    await delay(freqPollMS)
  }

  function getTables() {
    return r.tableList().run(conn)
  }

  async function poll() {
    const moreNewTables = (await getTables()).filter(notYetIn(tables))
    tables = tables.concat(moreNewTables)
    return moreNewTables
  }

  function makePromise() {
    p = new Promise((resolve) => {
      pendingResolve = resolve
    })
  }
}

function notYetIn (arr) {
  return (o) => {
    return arr.indexOf(o) < 0
  }
}