const express = require("express");
const gh = express.Router();
const passport = require("passport");
const GithubStrategy = require("passport-github2").Strategy;
const jwt = require("jsonwebtoken");
const session = require("express-session");
require("dotenv").config();

gh.use(
	session({
		secret: process.env.GITHUB_CLIENT_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

gh.use(passport.initialize());
gh.use(passport.session());

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

passport.use(
	new GithubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: process.env.GITHUB_CALLBACK_URL,
		},
		(accessToken, refreshToken, profile, done) => {
			return done(null, profile);
		}
	)
);

gh.get(
	"/auth/github",
	passport.authenticate("github", {
		scope: ["user:email"],
	}),
	(req, res) => {
		const redirectUrl = `https://hilarious-duckanoo-65dd6e.netlify.app/success?user=${encodeURIComponent(
			JSON.stringify(req.user)
		)}`;
		res.redirect(redirectUrl);
	}
);

gh.get(
	"/auth/github/callback",
	passport.authenticate("github", {
		failureRedirect: "/",
	}),
	(req, res) => {
		const user = req.user;
		const token = jwt.sign(user, process.env.JWT_SECRET);
		const redirectUrl = `https://hilarious-duckanoo-65dd6e.netlify.app/success/${encodeURIComponent(
			token
		)}`;
		res.redirect(redirectUrl);
	}
);

gh.get("/success", (req, res) => {
	res.redirect("https://hilarious-duckanoo-65dd6e.netlify.app/");
});

module.exports = gh;
