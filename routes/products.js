const express = require(`express`);
const products = express.Router();
const multer = require(`multer`);
const cloudinary = require(`cloudinary`).v2;
const { CloudinaryStorage } = require(`multer-storage-cloudinary`);
require(`dotenv`).config();
const ProductModel = require(`../models/product`);

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: `products`,
		format: async (req, file) => `png`,
		public_id: (req, file) => file.name,
	},
});

const cloudUpload = multer({ storage: cloudStorage });

products.get("/products", async (req, res) => {
	const { page = 1, pageSize = 12 } = req.query;

	try {
		const products = await ProductModel.find()
			.limit(pageSize)
			.skip((page - 1) * pageSize);

		const totalProducts = await ProductModel.count();

		res.status(200).send({
			statusCode: 200,
			currentPage: Number(page),
			totalPages: Math.ceil(totalProducts / pageSize),
			totalProducts,
			products,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

products.post(
	`/products/create`,
	cloudUpload.single("cover"),
	async (req, res) => {
		const existingProduct = await ProductModel.findOne({ name: req.body.name });

		if (existingProduct) {
			return res.status(400).send({
				statusCode: 400,
				message: "This product already exist",
			});
		}

		const newProduct = new ProductModel({
			name: req.body.name,
			category: req.body.category,
			description: req.body.description,
			price: req.body.price,
			cover: req.file.path,
			isInPromo: req.body.promo,
		});

		try {
			const product = await newProduct.save();
			res.status(201).send({
				statusCode: 201,
				message: "Product saved successfully",
				product,
			});
		} catch (error) {
			console.error("Error during product saving:", error);
			res.status(500).send({
				statusCode: 500,
				message: "Server internal error",
			});
		}
	}
);

products.patch(
	`/products/:productId`,
	cloudUpload.single("cover"),
	async (req, res) => {
		const { productId } = req.params;
		const productExist = await ProductModel.findById(productId);

		if (!productExist) {
			return res.status(404).send({
				statusCode: 404,
				message: "This product doesn't exist",
			});
		}
		try {
			const dataToUpdate = req.body;
			if (req.file) {
				const imageUrl = req.file.path;
				dataToUpdate.cover = imageUrl;
			}
			const options = { new: true };
			const updatedProduct = await ProductModel.findByIdAndUpdate(
				productId,
				dataToUpdate,
				options
			);
			res.status(200).send({
				statusCode: 200,
				message: "Product successfully modified",
				updatedProduct,
			});
		} catch (e) {
			res.status(500).send({
				statusCode: 500,
				message: "Server internal error",
			});
		}
	}
);

products.delete(`/products/delete/:productId`, async (req, res) => {
	const { productId } = req.params;

	try {
		const product = await ProductModel.findByIdAndDelete(productId);
		if (!product) {
			return res.status(404).send({
				statusCode: 404,
				message: "Product not found or already deleted",
			});
		}
		res.status(200).send({
			statusCode: 200,
			message: "Product deleted successfully",
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

module.exports = products;
