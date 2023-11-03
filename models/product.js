const mongoose = require(`mongoose`);

const ProductSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		category: {
			type: String,
		},
		description: {
			type: String,
		},
		price: {
			type: Number,
		},
		cover: {
			type: String,
		},
		isInPromo: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true, strict: true }
);

module.exports = mongoose.model(`productModel`, ProductSchema, `products`);
