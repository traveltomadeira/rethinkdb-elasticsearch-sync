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
    const { old_val, new_val, type } = change
    const { id } = (new_val || old_val)
    const index = table
    const remove = (type === 'remove')
    let exists = false

    if (!remove) {
      try {
        exists = await client.get({
          id,
          index
        })
      } catch (err) {
        // do nothing
      }
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
    } else if (!remove) {
      const creation = {
        id,
        index,
        body: new_val
      }
      logger.info({ table, willInsert: id })
      await client.create(creation)
      logger.info({ table, inserted: id })
    } else {
      const deletion = {
        id,
        index
      }
      logger.info({ table, willRemove: id })
      await client.delete(deletion)
      logger.info({ table, removed: id })
    }
  }
}