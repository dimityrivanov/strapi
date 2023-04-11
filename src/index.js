'use strict';

const stripe = require('stripe')('sk_test_MwaUHxwoYwjncVDQNi1yUGSX008jSPXA4b');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  // bootstrap(/*{ strapi }*/) {},
  async bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],

      async afterCreate(user) {
        // console.log(user.result.username);

        stripe.customers.create({
          email: user.result.email,
          description: user.result.username,
        }).then(customer => {
          strapi.query('plugin::users-permissions.user').update({
            where: { id: user.result.id },
            data: {
              stripe_customer_id: customer.id,
            }
          });
        });
      },
    });
  },
};
