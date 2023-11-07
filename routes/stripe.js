const express = require("express");
const stripe = express.Router();
require("dotenv").config();
const stripeKey = require("stripe")(process.env.STRIPE_SECRET_KEY);

function calculateTotal(cartItems) {
	let total = 0;
	for (const item of cartItems) {
		total += item.price;
	}
	return total;
}

stripe.post("/create-checkout-session", async (req, res) => {
	const { cartItems } = req.body;

	const cartTotal = calculateTotal(cartItems);

	try {
		const session = await stripeKey.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: cartItems.map((item) => {
				return {
					price_data: {
						currency: "eur",
						product_data: {
							name: item.name,
						},
						unit_amount: item.price * 100000,
					},
					quantity: 1,
				};
			}),
			mode: "payment",
			success_url: "/payment/success?total=" + cartTotal,
			cancel_url: "/payment/cancel",
		});

		res.json({ id: session.id });
	} catch (error) {
		res.status(500).json({
			error: "Errore durante la creazione della sessione di checkout",
		});
	}
});

module.exports = stripe;
