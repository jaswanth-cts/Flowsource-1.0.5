/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('order_items', table => {
    table.comment('order_item table');
    table.uuid('id').primary().comment('Automatically generated unique ID');
    table.string('user_id').comment('user id who created this entry');
    table.integer('order_id').unique().notNullable().comment('orderid from api response');
    table.integer('catalog_id').comment('catalog id which is used in the order');
    table.string('catalog_name').notNullable().comment('The name of the catalog used');
    table.string('catalog_code').notNullable().comment('The code of the catalog used');
    table.jsonb('order_response').comment('raw reponse of order data');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('order_items');
};
