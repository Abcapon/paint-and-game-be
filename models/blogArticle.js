const mongoose = require(`mongoose`);

const BlogArticleSchema = new mongoose.Schema(
	{
		title: {
			type: String,
		},
		category: {
			type: String,
		},
		content: {
			type: String,
		},
		cover: {
			type: String,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: `userModel`,
		},
	},
	{ timestamps: true, strict: true }
);

module.exports = mongoose.model(
	`blogArticleModel`,
	BlogArticleSchema,
	`blogArticles`
);
