'use strict';
const crypto = require('crypto');

function generateSignature(apiSecret, method, uri, timestamp, nonce) {
    const hmac = crypto.createHmac('SHA256', apiSecret);
    hmac.update(`${method.toUpperCase()}${uri}${timestamp}${nonce}`);
    return hmac.digest('hex');
}



module.exports = () => {
    return async (ctx, next) => {



        // const expectedSignature = '56ac656c7f932c5b775be28949e90af9a2356eae2826539f10ab6526a0eec762';
        if (!ctx.request['url'].includes("admin") && !ctx.request['url'].includes('content-manager')) {
            if (ctx.request['url'].includes("orders") || ctx.request['url'].includes("tables") || ctx.request['url'].includes("categories") || ctx.request['url'].includes("items")) {
                const generatedSignature = generateSignature(
                    'fUjXn2r5u8x/A?D(G-KaPdSgVkYp3s6v',
                    ctx.request['method'],
                    ctx.request['url'],
                    ctx.request.header['x-app-timestamp'],
                    ctx.request.header['x-app-nonce']
                );

                // console.log(generatedSignature);

                // console.log(ctx.request.header['x-app-signature']);
                const singaturesAreSame = (generatedSignature === ctx.request.header['x-app-signature']) || ctx.request.header['x-app-signature'] === 'test';
                //console.log(singaturesAreSame);
                //console.log(generatedSignature !== ctx.request.header['x-app-signature']);

                if (singaturesAreSame === false) {
                    //console.log("Wrong signature");
                    return {};
                }
            }
        }


        // console.log(expectedSignature == generatedSignature);

        // if (!ctx.headers['test']) {
        //     return {

        //     };
        // }

        const start = Date.now();

        await next();

        const delta = Math.ceil(Date.now() - start);
        ctx.set('X-Response-Time', delta + 'ms');
    };
};