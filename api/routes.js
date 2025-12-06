const { Router } = require("express");
const cors = require("cors");

const router = Router();

const { client_langs, client_translations } = require("../express_utils/trads")

router.get("/client-langs",async (req, res)=>{
    res.status(200).json(client_langs);
});

router.get("/client-translations",async (req, res)=>{
    res.status(200).json(client_translations);
});

const category_routes = require("./categories/routes/main");

router.use(`/categories`, cors(corsOptions), category_routes);

const articles_routes = require("./articles/routes/main");

router.use(`/articles`, cors(corsOptions), articles_routes);

const users_routes = require("./users/routes/main");

router.use(`/users`, users_routes);

module.exports = router;