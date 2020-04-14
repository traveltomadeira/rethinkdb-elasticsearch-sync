'use strict'

const r = require('rethinkdb')
const childProcess = require('child_process')
const path = require('path')
const delay = require('delay')
const elasticsearchClient = require('./database/elasticsearch')
const withConnection = require('./database/with-connection')
const fakeUsers = require('./fake/users')

const WAIT_FOR_ELASTIC_POLL_INTERVAL_MS = 2000
const WAIT_FOR_ELASTIC_POLL_MAX_RETRIES = 20

const elasticGetAllUsers = {
  index: 'users',
  body: {
    query: {
      match_all: {}
    }
  }
}

describe('sync', () => {
  beforeEach(setupRethink)
  beforeAll(waitForElastic)

  let syncChild
  beforeAll(() => {
    syncChild = startSync()
  })

  afterAll(() => {
    syncChild.kill()
  })

  beforeEach(createManyUsers)

  it('sync 100 users', async () => {
    const usersLength = await getUsers()
    expect(usersLength).toBe(usersLength)

    await delay(10000)

    const { body } = await elasticsearchClient.search(elasticGetAllUsers)
    expect( body.hits.total.value).toBe(usersLength)
  })

  it('delete 50 users', async () => {
    await deleteUsers(50)

    await delay(10000)

    const usersLength = await getUsers()
    const { body } = await elasticsearchClient.search(elasticGetAllUsers)
    expect(body.hits.total.value).toBe(usersLength)
  })

  it('updates one user', async () => {
    await updateRandomUser()

    await delay(5000)

    const { body } = await elasticsearchClient.search({
      index: 'users',
      body: {
        query: {
          multi_match: {
            query: 'Potato'
          }
        }
      }
    })

    expect(body.hits.total.value).toBe(1)

    expect(body.hits.hits[0]._source).toEqual({
      id: '9dc65d91438b',
      fullName: 'Potato Potato',
      email: 'luis.leannon70@hotmail.com'
    })
  })
})

function setupRethink() {
  return withConnection(async(conn) => {
    await r.dbList().contains('synctest')
      .do(databaseExists => {
        return r.branch(
          databaseExists,
          { dbs_created: 0 },
          r.dbCreate('synctest')
        );
      }).run(conn);

    await r.tableList().contains('users')
      .do(tableExists => {
        return r.branch(
          tableExists,
          { tables_created: 0 },
          r.db('synctest').tableCreate('users')
        );
      }).run(conn);

    await r.db('synctest')
      .table("users")
      .delete()
      .run(conn)
  })
}

function createManyUsers() {
  return withConnection((conn) =>
    r
      .table('users')
      .insert(fakeUsers())
      .run(conn)
  )
}
function getUsers() {
  return withConnection((conn) =>
    r
      .table('users')
      .count()
      .run(conn)
  )
}
function deleteUsers(limit) {
  return withConnection((conn) =>
    r
      .table('users')
      .limit(limit)
      .delete()
      .run(conn)
  )
}

function updateRandomUser() {
  return withConnection((conn) =>
    r
      .table('users')
      .get('9dc65d91438b')
      .update({
        fullName: 'Potato Potato'
      })
      .run(conn)
  )
}

function startSync() {
  return childProcess.fork(path.join(__dirname, '..', 'src', 'main.js'), {
    env: {
      ELASTICSEARCH_URI: 'http://synctest-elasticsearch:9200',
      RETHINKDB_HOST: 'synctest-rethink',
      RETHINKDB_DB: 'synctest'
    },
    // silent: false,
    stdio: 'inherit'
  })
}

async function waitForElastic(retried = 0) {
  try {
    await elasticsearchClient.ping()
  } catch (err) {
    if (retried > WAIT_FOR_ELASTIC_POLL_MAX_RETRIES) {
      throw err
    }
    await delay(WAIT_FOR_ELASTIC_POLL_INTERVAL_MS)
    await waitForElastic(retried + 1)
  }

  await delay(4000)
}