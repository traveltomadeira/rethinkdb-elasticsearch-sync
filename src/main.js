'use strict'

const newTables = require('./table-enumeration-watcher')
const dbTableWatch = require('./table-watch')
const elasticSync = require('./elastic-sync')
const logger = require('./logger')

;(async () => {
  const rethinkOptions = { db: 'ttm-dev' }
  const elasticOptions = { node: 'http://localhost:9200' }
  const newTablesWatcher = newTables({ rethinkOptions })
  const createTableWatch = dbTableWatch({ rethinkOptions })
  const createElasticSync = elasticSync({ elasticOptions })

  for await (const table of newTablesWatcher) {
    if (table.startsWith('_')) {
      continue
    }
    logger.info({ newTable: table })
    const watch = await createTableWatch(table)
    createElasticSync({ table, watch })
  }
})()

process.on('unhandledRejection', (error) => {
  console.error(error)
  console.error(JSON.stringify(error, null, '\t'))
  process.exit(1)
});