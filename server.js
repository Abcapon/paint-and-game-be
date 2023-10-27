const express = require(`express`);
const mongoose = require(`mongoose`);

const PORT = 5050;

const app = express();

app.listen(PORT, () => console.log(`server up and running on port ${PORT}`));
