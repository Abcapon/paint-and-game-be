const express = require(`express`);
const blogArticles = express.Router();
const multer = require(`multer`);
const cloudinary = require(`cloudinary`).v2;
const { CloudinaryStorage } = require(`multer-storage-cloudinary`);
require(`dotenv`).config();
const BlogArticleModel = require(`../models/blogArticle`);

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: `articleCovers`,
		format: async (req, file) => `png`,
		public_id: (req, file) => file.name,
	},
});

const cloudUpload = multer({ storage: cloudStorage });

blogArticles.get(`/blog`, async (req, res) => {
	const { page = 1, pageSize = 10 } = req.query;

	try {
		const articles = await BlogArticleModel.find()
			.populate(`author`)
			.limit(pageSize)
			.skip((page - 1) * pageSize);

		const totalArticles = await BlogArticleModel.count();

		res.status(200).send({
			statusCode: 200,
			currentPage: Number(page),
			totalePages: Math.ceil(totalArticles / pageSize),
			totalArticles,
			articles,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

blogArticles.post(`/blog/create`, async (req, res) => {
	const newBlogArticle = new BlogArticleModel({
		title: req.body.title,
		category: req.body.category,
		content: req.body.content,
		cover: req.body.cover,
		author: req.body.author,
	});

	try {
		const article = await newBlogArticle.save();
		res.status(201).send({
			statusCode: 201,
			message: "Article saved successfully",
			payload: article,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

module.exports = blogArticles;
