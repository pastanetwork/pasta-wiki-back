const { Router } = require("express");
const router = Router();

const { getArticles, publishArticle, modifyArticle, getArticlesWriter, deleteArticle,  } = require("../utils")
const { verifPerm } = require("../../../express_utils/utils");

router.get("/all",async (req,res)=>{
    let res_log={};
    const hasPermission = await verifPerm(req.cookies.authToken, 8);
    if (hasPermission) {
        res_log=await getArticlesWriter("all")
    } else {
        res_log=await getArticles("all");
    }
    res.status(res_log.code).json({data:res_log.msg});
});

router.get("/:lang",async (req,res)=>{
    const { lang } = req.params;
    let res_log={};
    const hasPermission = await verifPerm(req.cookies.authToken, 8);
    if (hasPermission) {
        res_log=await getArticlesWriter(lang)
    } else {
        res_log=await getArticles(lang)
    }
    res.status(res_log.code).json({data:res_log.msg});
});

router.post("/publish", async (req,res)=>{
    const { title, category, content, enabled} = req.body;
    const hasPermission = await verifPerm(req.cookies.authToken, 5);
        if (!hasPermission) {
            return res.status(401).end();
        }
    let res_log=await publishArticle(title, category, content, enabled);
    res.status(res_log.code).json({data:res_log.msg});
});

router.put("/modify", async (req,res)=>{
    const { title, category, content, enabled, prev_title} = req.body;
    const hasPermission = await verifPerm(req.cookies.authToken, 6);
        if (!hasPermission) {
            return res.status(401).end();
        }
    let res_log=await modifyArticle(title, category, content, enabled, prev_title);
    res.status(res_log.code).json({data:res_log.msg});

});

router.put("/delete", async (req,res)=>{
    const { title, category} = req.body;
    const hasPermission = await verifPerm(req.cookies.authToken, 7);
    if (!hasPermission) {
        return res.status(401).end();
    }
   const res_log = await deleteArticle(title,category);
    res.status(res_log.code).json({data:res_log.msg});

});

module.exports = router;