require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class BaseHandlePaymentBehavior {
    constructor(config) {
        this.config = config;
    }

    async handlePayment() {
        console.log("handling payment: ", this.config);
        const {stripePaymentIntentId} = this.config;
        if(!stripePaymentIntentId) {
            return;
        }

        await stripe.paymentIntents.capture(stripePaymentIntentId);
        return true;
    }
}

module.exports = {
    BaseHandlePaymentBehavior
}