'use strict'

const newTables = require('./table-enumeration-watcher')
const dbTableWatch = require('./table-watch')
const elasticSync = require('./elastic-sync')
const logger = require('./logger')

;(async () => {
  const rethinkOptions = {
    host: process.env.RETHINKDB_HOST,
    port: process.env.RETHINKDB_PORT,
    db: process.env.RETHINKDB_DB,
    user: process.env.RETHINKDB_USER,
    password: process.env.RETHINKDB_PASSWORD,
  }

  if (!process.env.ELASTICSEARCH_URI) {
    throw new Error('Please define the ELASTICSEARCH_URI environment variable')
  }

  const elasticOptions = {
    node: process.env.ELASTICSEARCH_URI,
    auth: {
      username: process.env.ELASTICSEARCH_USER,
      password: process.env.ELASTICSEARCH_PASSWORD,
      apiKey: process.env.ELASTICSEARCH_API_KEY
    }
  }

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
  logger.fatal({ error: error.message, detail: error })
  process.exit(1)
})