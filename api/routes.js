const { Router } = require("express");
const router = Router();

const { client_langs } = require("../express_utils/trads")

router.get("/client-langs",async (req, res)=>{
    res.status(200).json(client_langs);
});

const category_routes = require("./categories/routes/main");

router.use(`/categories`, category_routes);

const articles_routes = require("./articles/routes/main");

router.use(`/articles`, articles_routes);

const users_routes = require("./users/routes/main");

router.use(`/users`, users_routes);

module.exports = router;