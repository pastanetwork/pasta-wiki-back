const express = require('express');
const cookieParser = require('cookie-parser');
const { express_values } = require("./express_utils/env-values-dictionnary");

const app = express();
const port = express_values.port
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', true);

app.listen(port, () => {
	console.log(`Server is running on port ${port}.`);
});

const api_routes = require("./api/routes");

app.use(`/${express_values.public_route}`, api_routes);

const client_routes = require("./client/routes")

app.use(`/`, client_routes);

/*app.use((req, res) => {
	res.status(418).end();
});*/