const express = require("express");
const users = express.Router();
const bcrypt = require(`bcrypt`);
const multer = require(`multer`);
const cloudinary = require(`cloudinary`).v2;
const { CloudinaryStorage } = require(`multer-storage-cloudinary`);
require(`dotenv`).config();
const crypto = require(`crypto`);
const UserModel = require(`../models/users`);

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: `users`,
		format: async (req, file) => `png`,
		public_id: (req, file) => file.name,
	},
});

const cloudUpload = multer({ storage: cloudStorage });

users.get("/users", async (req, res) => {
	const { page = 1, pageSize = 10 } = req.query;

	try {
		const users = await UserModel.find()
			.limit(pageSize)
			.skip((page - 1) * pageSize);

		const totalUsers = await UserModel.count();

		res.status(200).send({
			statusCode: 200,
			currentPage: Number(page),
			totalPages: Math.ceil(totalUsers / pageSize),
			totalUsers,
			users,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

users.get(`/users/:userId`, async (req, res) => {
	const { userId } = req.params;

	try {
		const user = await UserModel.findById(userId);
		if (!user) {
			return res.status(404).send({
				statusCode: 404,
				message: "User don't found",
			});
		}
		res.status(200).send({
			statusCode: 200,
			user,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

users.post(`/users/create`, cloudUpload.single("avatar"), async (req, res) => {
	const existingUser = await UserModel.findOne({ email: req.body.email });

	if (existingUser) {
		return res.status(400).send({
			statusCode: 400,
			message: "Email already in use",
		});
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	const newUser = new UserModel({
		name: req.body.name,
		surname: req.body.surname,
		email: req.body.email,
		avatar: req.file.path,
		password: hashedPassword,
	});

	try {
		const user = await newUser.save();
		res.status(201).send({
			statusCode: 201,
			message: "User saved successfully",
			user,
		});
	} catch (error) {
		console.error("Error during user saving:", error);
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

users.patch(`/users/:userId`, async (req, res) => {
	const { userId } = req.params;
	const user = await UserModel.findById(userId);
	if (!user) {
		return res.status(400).send({
			statusCode: 400,
			message: "User don't found",
		});
	}
	try {
		const dataToUpdate = req.body;
		const options = { new: true };
		const result = await UserModel.findByIdAndUpdate(
			postId,
			dataToUpdate,
			options
		);
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

users.delete(`/users/:usersId`, async (req, res) => {
	const { usersId } = req.params;
	try {
		const user = await UserModel.findByIdAndDelete(userId);
		if (!user) {
			return res.status(404).send({
				statusCode: 404,
				message: `User don't found or already deleted`,
			});
		}
		res.status(200).send({
			statusCode: 200,
			message: `User deleted successfully`,
			user,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

module.exports = users;
