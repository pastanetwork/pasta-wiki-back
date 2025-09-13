const express = require('express');
const { express_values } = require("./express_utils/env-values-dictionnary");

const app = express();
const port = express_values.port
app.use(express.json());
app.set('trust proxy', true);

app.listen(port, () => {
	console.log(`Server is running on port ${port}.`);
});

const category_routes =require("./category/routes/main");

app.use(`/${express_values.public_route}/category`, category_routes);
