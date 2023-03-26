'use strict';

/**
 * table controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::table.table', ({ strapi }) => ({
    async update(ctx) {
        ctx.request.body = JSON.parse(ctx.request.body);

        const { data, meta } = await super.update(ctx);

        return { data, meta };
    }
}));
