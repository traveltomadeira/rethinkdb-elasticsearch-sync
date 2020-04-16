'use strict'

const connect = require('./connect')

module.exports = async (fn) => {
  const connection = await connect()
  let result
  try {
    result = await fn(connection)
  } catch (err) {
    await connection.close()
    throw err
  }
  connection.close()
  return result
}
