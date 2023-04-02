'use strict';
const stripe = require('stripe')('sk_test_MwaUHxwoYwjncVDQNi1yUGSX008jSPXA4b');

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;


const YOUR_DOMAIN = 'https://site-production-8405.up.railway.app/index.html';

const fromDecimalToInt = (number) => parseInt(number * 100);

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
    async update(ctx) {
        ctx.request.body = JSON.parse(ctx.request.body);

        //TODO: Push Notification

        const { data, meta } = await super.update(ctx);

        return { data, meta };
    },


    async create(ctx) {

        ctx.request.body = JSON.parse(ctx.request.body);
        // console.log(ctx.request.body);
        ctx.request.body['data']['products'] = JSON.parse(ctx.request.body['data']['products']);
        ctx.request.body['data']['table'] = JSON.parse(ctx.request.body['data']['table']);
        //console.log(ctx.request.body);

        const tableUpdate = await strapi.entityService.update('api::table.table', ctx.request.body['data']['table'], {
            data: {
                occupied: true,
            },
        });

        const { data, meta } = await super.create(ctx);

        return { data, meta };
    },

    // async validateOrder(ctx) {
    //     console.log(JSON.parse(ctx.request.body));
    //     ctx.request.body = JSON.parse(ctx.request.body);
    //     // ctx.request.body['session'] = JSON.parse(ctx.request.body['session']);
    //     ctx.request.body['data']['products'] = JSON.parse(ctx.request.body['data']['products']);
    //     ctx.request.body['data']['table'] = JSON.parse(ctx.request.body['data']['table']);

    //     const stripe_session = await stripe.checkout.sessions.retrieve(
    //         ctx.request.body['session']
    //     );

    //     if (stripe_session['status'] == 'complete') {
    //         await super.create(ctx);
    //     }

    //     return stripe_session['status'] == 'complete';
    // },

    async validateOrder(ctx) {
        // console.log(ctx.request.body);
        ctx.request.body = JSON.parse(ctx.request.body);
        // console.log(ctx.request.body);
        ctx.request.body['data']['products'] = JSON.parse(ctx.request.body['data']['products']);
        ctx.request.body['data']['table'] = JSON.parse(ctx.request.body['data']['table']);
        // console.log(ctx.request.body);

        const stripe_session = await stripe.checkout.sessions.retrieve(
            ctx.request.body['data']['stripeid']
        );

        if (stripe_session['status'] == 'complete') {
            await strapi.entityService.update('api::table.table', ctx.request.body['data']['table'], {
                data: {
                    occupied: true,
                },
            });

            ctx.request.body['publishedAt'] = Date.now();
            ctx.request.body['data']['publishedAt'] = Date.now();

            await strapi.entityService.create('api::order.order', ctx.request.body);
        }

        return stripe_session['status'] == 'complete';
    },


    async processOrder(ctx) {
        // stripe.checkout.sessions.listLineItems(
        //     'cs_test_b1Cx9ejmw5I64xrw0YrhF5dd2rz7sReyO9uLGEUgc4xMDNLgXwse2D66T8',
        //     { limit: 100 },
        //     function (err, lineItems) {
        //         // asynchronously called
        //         console.log(lineItems);
        //     }
        // );
        const { email, products } = ctx.request.body;

        var productsAsJson = JSON.parse(products);

        const lineItems = productsAsJson.map(orderItem => {
            return {
                price_data: {
                    currency: "BGN",
                    product_data: {
                        name: orderItem.attributes.name
                    },
                    unit_amount: fromDecimalToInt(orderItem.attributes.price[0].price),
                },

                quantity: orderItem.attributes.price.length,
            }
        });



        try {
            const session = await stripe.checkout.sessions.create({
                // line_items: [
                //     {
                //         price_data: {
                //             currency: "BGN",
                //             product_data: {
                //                 name: "testProduct"
                //             },
                //             unit_amount: fromDecimalToInt(1.50),
                //         },
                //           65// Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                //         // price: '{{PRICE_ID}}',
                //         quantity: 1,
                //     },
                // ],
                line_items: lineItems,
                mode: 'payment',
                payment_method_types: ['card'],
                customer_email: email,
                success_url: `${YOUR_DOMAIN}?success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${YOUR_DOMAIN}?success=false`,
            });
            return {
                url: session.url
            };
        } catch (err) {
            return {
                manqk: err
            };
        }
    }
}));
