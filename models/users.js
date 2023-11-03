const mongoose = require(`mongoose`);

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		surname: {
			type: String,
		},
		email: {
			type: String,
		},
		avatar: {
			type: String,
		},
		password: {
			type: String,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
	},
	{ timestamps: true, strict: true }
);

module.exports = mongoose.model(`userModel`, UserSchema, `users`);
