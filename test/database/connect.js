'use strict'

const r = require('rethinkdb')

module.exports = () => {
  const options = {
    db: 'synctest',
    host: 'synctestrethink'
  }
  return r.connect(options)
}
