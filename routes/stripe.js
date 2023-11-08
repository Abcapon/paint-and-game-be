const express = require("express");
const stripe = express.Router();
require("dotenv").config();

const stripeKey = require("stripe")(process.env.STRIPE_SECRET_KEY);

stripe.post("/create-checkout-session", async (req, res) => {
	const { cartItems } = req.body;
	console.log("Dati del carrello:", cartItems);

	const line_items = cartItems.map((item) => {
		return {
			price_data: {
				currency: "eur",
				product_data: {
					name: item.name,
				},
				unit_amount: item.price * 100,
			},
			quantity: item.quantity,
		};
	});

	const session = await stripeKey.checkout.sessions.create({
		line_items,
		mode: "payment",
		ui_mode: "embedded",
		return_url:
			"https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}",
	});

	res.send({ clientSecret: session.client_secret });
});

module.exports = stripe;
