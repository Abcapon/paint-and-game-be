const express = require(`express`);
const login = express.Router();
const bcrypt = require(`bcrypt`);
const UserModel = require(`../models/users`);
const jwt = require(`jsonwebtoken`);
require(`dotenv`).config();

login.post(`/login`, async (req, res) => {
	const user = await UserModel.findOne({ email: req.body.email });

	if (!user) {
		return res.status(404).send({
			message: `Invalid User name or password 1`,
			statusCode: 404,
		});
	}

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) {
		return res.status(400).send({
			statusCode: 400,
			message: "Invalid User name or password 2",
		});
	}
	const token = jwt.sign(
		{
			id: user._id,
			name: user.name,
			surname: user.surname,
			email: user.email,
			avatar: user.avatar,
			role: user.role,
		},
		process.env.JWT_SECRET,
		{ expiresIn: "24h" }
	);

	res.header("Authorization", token).status(200).send({
		message: "Successful login",
		statusCode: 200,
		token,
	});
});

login.get(`/login`, (req, res) => {
	const token = req.header("loggedInUser");

	if (!token) {
		return res.status(401).send({
			message: "Missing token",
			statusCode: 401,
		});
	}

	jwt.verify(token, process.env.JWT_SECRET, (err) => {
		if (err) {
			return res.status(401).send({
				message: "Invalid token",
				statusCode: 401,
			});
		}

		res.status(200).send({
			message: "Successfully retrieved token",
			statusCode: 200,
			token,
		});
	});
});

login.get(`/me`, async (req, res) => {
	const token = req.header("loggedInUser");

	if (!token) {
		return res.status(401).send({
			message: "Missing token",
			statusCode: 401,
		});
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(401).send({
				message: "Invalid token",
				statusCode: 401,
			});
		}

		const userData = decoded;

		res.status(200).send({
			message: "Successfully retrieved token",
			statusCode: 200,
			userData,
		});
	});
});

module.exports = login;
