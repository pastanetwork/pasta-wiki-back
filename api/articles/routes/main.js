const { Router } = require("express");
const router = Router();

const Article = require("../Article");
const { verifPerm } = require("../../../express_utils/utils");

/* 
/api/v1/articles/all - GET :
*/

router.get("/all",async (req,res)=>{
    const hasPermission = await verifPerm(req.cookies.authToken, 8);
    const article = new Article;
    const res_log=await article.getAll("all",hasPermission);
    res.status(res_log.code).json({data:res_log.msg});
});

/* 
/api/v1/articles/:lang - GET :
*/

router.get("/:lang",async (req,res)=>{
    const { lang } = req.params;
    const hasPermission = await verifPerm(req.cookies.authToken, 8);
    const article = new Article;
    const res_log=await article.getAll(lang,hasPermission);
    res.status(res_log.code).json({data:res_log.msg});
});

/* 
/api/v1/articles/publish - POST :
*/


router.post("/publish", async (req,res)=>{
    const { title, category ,lang, content, enabled} = req.body;
    const hasPermission = await verifPerm(req.cookies.authToken, 5);
        if (!hasPermission) {
            return res.status(401).end();
        }
    const article_data = {
        title:title,
        category:category,
        content:content,
        enabled:enabled
    }
    const article = new Article(article_data);
    const res_log = await article.create();
    res.status(res_log.code).json({data:res_log.msg});
});

router.put("/modify", async (req,res)=>{
    const { title, category, content, enabled, prev_title,prev_category} = req.body;
    
    const hasPermission = await verifPerm(req.cookies.authToken, 6);
    if (!hasPermission) {
        return res.status(401).end();
    }

    const article_data = {
        title:title,
        category:category,
        content:content,
        enabled:enabled
    }

    const article= new Article(article_data)
    const res_log= await article.modify(prev_title,prev_category);
    res.status(res_log.code).json({data:res_log.msg});

});

router.put("/delete", async (req,res)=>{
    const { title, category} = req.body;
    const hasPermission = await verifPerm(req.cookies.authToken, 7);
    if (!hasPermission) {
        return res.status(401).end();
    }
    const article_data = {
        title:title,
        category:category,
    }
    const article = new Article(article_data)
    const res_log = await article.delete();
    console.log(res_log)
    res.status(res_log.code).json({data:res_log.msg});

});

module.exports = router;