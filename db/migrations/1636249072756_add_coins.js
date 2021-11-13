exports.up = (knex) => knex.schema.createTable('coins', (table) => {
    table.uuid("id")
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name',200).notNullable()
    table.string('address',1000).notNullable()
    table.double('balance').nullable()
    table.double('exchange_rate_usd').nullable()
    table.timestamps(true, true)
    table.unique(['name', 'address'])
  })

exports.down = (knex) => knex.schema.dropTable('coins')

