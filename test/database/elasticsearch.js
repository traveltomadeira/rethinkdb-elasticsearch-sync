'use strict'

const { Client } = require('@elastic/elasticsearch')

module.exports = new Client({
  node: 'http://elasticsearch:9200'
})
