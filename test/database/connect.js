'use strict'

const r = require('rethinkdb')

module.exports = () => {
  const options = {
    db: 'synctest',
    host: 'rethink'
  }
  return r.connect(options)
}
