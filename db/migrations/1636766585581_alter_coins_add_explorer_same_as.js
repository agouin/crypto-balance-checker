exports.up = (knex) => knex.schema.table('coins', (table) => {
  table.string('explorer_same_as',200).nullable()
})

exports.down = (knex) => knex.schema.table('coins', (table) => {
  table.dropColumn('explorer_same_as')
})

