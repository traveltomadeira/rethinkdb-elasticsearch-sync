'use strict'

const { Client } = require('@elastic/elasticsearch')
const logger = require('./logger')

module.exports = ({elasticOptions}) => async ({table, watch}) => {
  const client = new Client(elasticOptions)
  try {
    await client.indices.create({
      index: table
    })
  } catch (err) {
    if (err.message !== 'resource_already_exists_exception') {
      throw err
    }
  }

  for await (const change of watch) {
    const { new_val } = change
    const { id } = new_val
    const index = table
    let exists = false

    try {
      exists = await client.get({
        id,
        index
      })
    } catch (err) {
      // do nothing
    }

    if (exists) {
      const update = {
        id,
        index,
        body: { doc: new_val }
      }

      logger.info({ table, willUpdate: id })
      await client.update(update)
      logger.info({ table, updated: id })
    } else {
      const creation = {
        id,
        index,
        body: new_val
      }
      logger.info({ table, willInsert: id })
      await client.create(creation)
      logger.info({ table, inserted: id })
    }
  }
}