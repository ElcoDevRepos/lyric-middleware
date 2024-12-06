const { BasePostController } = require("../base/base");
require("dotenv").config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class CreateStripePaymentIntentController extends BasePostController {
    constructor() {
        super();

        this.required_fields = [
        ];
    }

    async post(verified_fields) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: 1000,
                currency: 'usd',
                automatic_payment_methods: { enabled: true },
                capture_method: 'manual',
            });
    
            return { clientSecret: paymentIntent.client_secret };
        } catch (error) {
            console.error('Error creating Payment Intent:', error.message);
            return {error: { code: 500, message: error.message }};
        }
    }
}

module.exports = {
    CreateStripePaymentIntentController
}