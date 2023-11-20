const express = require("express");
const users = express.Router();
const bcrypt = require(`bcrypt`);
require(`dotenv`).config();
const crypto = require(`crypto`);
const UserModel = require(`../models/users`);
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const { createTransport } = require("nodemailer");

const transporter = nodemailer.createTransport({
	host: "smtp.ethereal.email",
	port: 587,
	auth: {
		user: "ruby.strosin@ethereal.email",
		pass: "7GTv3C7F4gdK2PsvuP",
	},
});

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

users.post(`/users/create`, async (req, res) => {
	console.log("user:", req.body);
	try {
		const existingUser = await UserModel.findOne({ email: req.body.email });

		if (existingUser) {
			return res.status(400).send({
				statusCode: 400,
				message: "Email already in use",
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		const verificationToken = generateVerificationToken();

		const newUser = new UserModel({
			name: req.body.name,
			surname: req.body.surname,
			email: req.body.email,
			password: hashedPassword,
			verificationToken: verificationToken,
			verified: false,
		});

		const user = await newUser.save();

		const mailOptions = {
			from: "ruby.strosin@ethereal.email",
			to: user.email,
			subject: "Conferma registrazione",
			text: `Grazie per esserti registrato! Clicca sul seguente link per confermare la tua registrazione: ${process.env.REACT_APP_BASE_URL}/confirm/${verificationToken}`,
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error("Errore nell'invio dell'email di conferma:", error);
				res.status(500).send({
					statusCode: 500,
					message: "Errore nell'invio dell'email di conferma",
				});
			} else {
				console.log("Email di conferma inviata:", info.response);
				res.status(201).send({
					statusCode: 201,
					message: `User saved successfully. Email di conferma inviata a:${user.email}`,
					user,
				});
			}
		});
	} catch (error) {
		console.error("Errore durante il salvataggio dell'utente:", error);
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
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

// chiamata di verifica tramite mail llink mail
users.get("/confirm/:token", async (req, res) => {
	const token = req.params.token;

	try {
		const user = await UserModel.findOneAndUpdate(
			{ verificationToken: token, verified: false },
			{ $set: { verified: true, verificationToken: null } },
			{ new: true }
		);

		if (!user) {
			return res.status(404).json({
				error: "Token di verifica non valido o utente già verificato",
			});
		}

		res
			.status(200)
			.json({ message: "Indirizzo email verificato con successo" });
	} catch (error) {
		console.error("Errore durante la verifica dell'indirizzo email:", error);
		res.status(500).json({ error: "Errore interno del server" });
	}
});

function generateVerificationToken() {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = "1d";

	const verificationToken = jwt.sign({}, secretKey, { expiresIn });

	return verificationToken;
}

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
		const updatedUser = await UserModel.findByIdAndUpdate(
			userId,
			dataToUpdate,
			options
		);
		res.status(200).sendStatus({
			statusCode: 200,
			message: "User successfully modified",
			updatedUser,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

users.delete(`/users/:usersId`, async (req, res) => {
	const { userId } = req.params;
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

// chiamata per modificare role ad admin

users.patch(`/users/promote/:userId`, async (req, res) => {
	try {
		// Verifica se l'utente che fa la richiesta è un amministratore
		/*
		if (req.user.role !== "admin") {
			return res.status(403).send({
				statusCode: 403,
				message: "Solo gli amministratori possono promuovere gli utenti.",
			});
		}
		*/

		// Trova l'utente da promuovere
		const userToPromote = await UserModel.findById(req.params.userId);

		if (!userToPromote) {
			return res.status(404).send({
				statusCode: 404,
				message: "Utente non trovato.",
			});
		}

		// Aggiorna il ruolo dell'utente a "admin"
		userToPromote.role = "admin";
		await userToPromote.save();

		res.status(200).send({
			statusCode: 200,
			message: "Utente promosso con successo a amministratore.",
			user: userToPromote,
		});
	} catch (error) {
		console.error(
			"Errore durante la promozione dell'utente a amministratore:",
			error
		);
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

module.exports = users;
