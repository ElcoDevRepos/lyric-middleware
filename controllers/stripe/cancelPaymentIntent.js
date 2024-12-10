const { BasePostController } = require("../base/base");
require("dotenv").config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class CancelPaymentIntentController extends BasePostController {
    constructor() {
        super();

        this.required_fields = [
            'paymentIntentId'
        ];
    }

    async post(verified_fields) {
        const { paymentIntentId } = verified_fields;

        try {
            const canceledPaymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

            return { message: "Successfully canceled payment" };
        } catch (error) {
            console.error('Error canceling Payment Intent:', error.message);
            return { error: { code: 500, message: error.message } };
        }
    }
}

module.exports = {
    CancelPaymentIntentController
}