const { Router } = require("express");
const router = Router();

const { getArticles, publishArticle, modifyArticle } = require("../utils")

router.get("/all",async (req,res)=>{
    let res_log=await getArticles("all");
    res.status(res_log.code).json({data:res_log.msg});
});

router.get("/lang/:lang",async (req,res)=>{
    const { lang } = req.params;
    let res_log=await getArticles(lang);
    res.status(res_log.code).json({data:res_log.msg});
});

router.post("/publish", async (req,res)=>{
    const { title, category, content, enabled} = req.body;
    let res_log=await publishArticle(title, category, content, enabled);
    res.status(res_log.code).json({data:res_log.msg});
});

router.put("/modify", async (req,res)=>{
    const { title, category, content, enabled, prev_title} = req.body;
    let res_log=await modifyArticle(title, category, content, enabled, prev_title);
    res.status(res_log.code).json({data:res_log.msg});

});


module.exports = router;