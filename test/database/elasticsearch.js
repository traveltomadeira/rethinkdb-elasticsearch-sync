'use strict'

const { Client } = require('@elastic/elasticsearch')

module.exports = new Client({
  node: 'http://synctest-elasticsearch:9200'
})
