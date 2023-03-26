'use-strict';

module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/generatePaymentLink',
            handler: 'order.processOrder',
            config: {
                auth: false,
            }
        },
        {
            method: 'POST',
            path: '/validateOrder',
            handler: 'order.validateOrder',
            config: {
                auth: false,
            }
        }
    ]
}