const { Router } = require("express");
const router = Router();

const category_routes = require("./categories/routes/main");

router.use(`/categories`, category_routes);

const articles_routes = require("./articles/routes/main");

router.use(`/articles`, articles_routes);

const users_routes = require("./users/routes/main");

router.use(`/users`, users_routes);

module.exports = router;