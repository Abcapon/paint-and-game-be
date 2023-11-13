const express = require("express");
const str = express.Router();
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const calculateOrderAmount = (items) => {
	const totalAmount = items.reduce((accumulator, item) => {
		return accumulator + item.price * item.quantity;
	}, 0);
	console.log("Calculated total amount:", totalAmount);

	return totalAmount;
};

str.post("/create-payment-intent", async (req, res) => {
	const { items } = req.body;
	console.log("Received items:", items);

	// Create a PaymentIntent with the order amount and currency
	const paymentIntent = await stripe.paymentIntents.create({
		amount: calculateOrderAmount(items) * 100,

		currency: "eur",
		// In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
		automatic_payment_methods: {
			enabled: true,
		},
	});

	res.send({
		clientSecret: paymentIntent.client_secret,
	});
});

module.exports = str;
