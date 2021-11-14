exports.up = (knex) => knex.schema.table('coins', (table) => {
  table.float('last_day_percentage').nullable()
})

exports.down = (knex) => knex.schema.table('coins', (table) => {
  table.dropColumn('last_day_percentage')
})

