# rethinkdb-elasticsearch-sync

> Command-line utility that synchronizes RethinkDB database into an ElasticSearch service.

Characteristics:

* Listens to changes on all tables on a RethinkDB database.
* Supports the creation of new tables.
* Sends the document *as is* to Elastic Search.
* Maps a table in RethinkDB to an index on ElasticSearch.
* Outputs logs in JSON format


## Install

```bash
$ npm install rethinkdb-elasticsearch-sync
```

## Run

```bash
$ rethinkdb-elasticsearch-sync
```

## Environment variables

RethinkDB access options:

* `RETHINKDB_HOST`
* `RETHINKDB_PORT`
* `RETHINKDB_DB`
* `RETHINKDB_USER`
* `RETHINKDB_PASSWORD`

ElasticSearch options:

* `ELASTICSEARCH_URI`
* `ELASTICSEARCH_USER`
* `ELASTICSEARCH_PASSWORD`
* `ELASTICSEARCH_API_KEY`

# Test

To run tests locally you need Docker-compose installed (so that it starts RethinkDB and ElasticSearch and runs the tests inside a container connected to those two).

```
$ npm test
```

# License

MIT