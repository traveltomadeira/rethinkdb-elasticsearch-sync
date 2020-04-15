'use strict'

const r = require('rethinkdb')

module.exports = () => {
  const options = {
    db: 'synctest',
    host: 'synctest-rethink'
  }
  return r.connect(options)
}
