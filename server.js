const express = require(`express`);
const mongoose = require(`mongoose`);

const usersRoute = require(`./routes/users`);
const productsRoute = require(`./routes/products`);
const loginRoute = require(`./routes/login`);
const githubRoute = require(`./routes/github`);
const blogRoute = require(`./routes/blogArticles`);
const stripeRoute = require(`./routes/stripe`);

const cors = require(`cors`);

require(`dotenv`).config();

const PORT = 5050;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use(`/`, usersRoute);
app.use(`/`, loginRoute);
app.use(`/`, productsRoute);
app.use(`/`, githubRoute);
app.use(`/`, blogRoute);
app.use(`/`, stripeRoute);

mongoose.connect(process.env.MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on(`error`, console.error.bind(console, `Error during db connection`));
db.once(`open`, () => {
	console.log(`Database successfully connected!`);
});

app.listen(PORT, () => console.log(`server up and running on port ${PORT}`));
