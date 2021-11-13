const { Model } = require('objection');
const knex = require('../../knex');
  
Model.knex(knex);
  
class Coin extends Model {
  static get tableName() {
    return 'coins';
  }
}

module.exports = Coin;