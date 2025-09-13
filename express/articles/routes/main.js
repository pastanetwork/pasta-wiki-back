const { Router } = require("express");
const router = Router();

const { getArticles } = require("../utils")

router.get("/all",async (req,res)=>{
    let res_log=await getArticles("all");
    res.status(res_log.code).json({data:res_log.msg});
});

router.get("/lang/:lang",async (req,res)=>{
    const { lang } = req.params;
    let res_log=await getArticles(lang);
    res.status(res_log.code).json({data:res_log.msg});
});

module.exports = router;