const { Router } = require("express");
const router = Router();

const { getCategories, publishCategory, modifyCategory, getLangs, getCategoriesWriter } = require("../utils");
const { verifPerm } = require("../../../express_utils/utils");

router.get("/all",async (req,res)=>{
    let res_log={};
    const hasPermission = await verifPerm(req.cookies.authToken, 9);
    if (hasPermission) {
        res_log=await getCategoriesWriter();
    } else {
        res_log=await getCategories("all");
    }
    res.status(res_log.code).json({data:res_log.msg});
});

router.get("/lang/:lang",async (req,res)=>{
    const { lang } = req.params;
    let res_log=await getCategories(lang);
    res.status(res_log.code).json({data:res_log.msg});
});

router.post("/publish", async (req,res)=>{
    const { title, lang, enabled} = req.body;
    const hasPermission = await verifPerm(req.cookies.authToken, 3);
        if (!hasPermission) {
            return res.status(401).end();
        }
    let res_log=await publishCategory(title, lang, enabled);
    res.status(res_log.code).json({data:res_log.msg});
});

router.put("/modify", async (req,res)=>{
    const { title, lang, enabled, prev_title, prev_lang} = req.body;
    const hasPermission = await verifPerm(req.cookies.authToken, 4);
        if (!hasPermission) {
            return res.status(401).end();
        }
    let res_log=await modifyCategory(title, lang, enabled, prev_title, prev_lang);
    res.status(res_log.code).json({data:res_log.msg});

});

router.put("/delete", async (req,res)=>{
    const { title} = req.body;
    const hasPermission = await verifPerm(req.cookies.authToken, 5);
        if (!hasPermission) {
            return res.status(401).end();
        }
    ///// SUPPPRESSION À IMPLÉMENTER let res_log=await modifyCategory(title, lang, enabled, prev_title);
    res.status(res_log.code).json({data:res_log.msg});

});

router.get("/get-langs",async (req,res)=>{
    let res_log = await getLangs();
    res.status(res_log.code).json({data:res_log.msg});
});

module.exports = router;