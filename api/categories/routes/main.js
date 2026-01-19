const { Router } = require("express");
const router = Router();

const { verifPerm } = require("../../../express_utils/utils");
const Category = require("../Category")

router.get("/all",async (req,res)=>{
    let res_log={};

    const category = new Category();

    const hasPermission = await verifPerm(req.cookies.authToken, 9);
    if (hasPermission) {
        res_log=await category.get("all",true)
    } else {
        res_log=await category.get("all");
    }
    res.status(res_log.code).json({data:res_log.msg});
});

router.get("/lang/:lang",async (req,res)=>{
    const { lang } = req.params;
    let res_log={};

    const category = new Category();

    const hasPermission = await verifPerm(req.cookies.authToken, 9);
    if (hasPermission) {
        res_log=await category.get(lang,true)
    } else {
        res_log=await category.get(lang);
    }
    res.status(res_log.code).json({data:res_log.msg});
});

router.post("/publish", async (req,res)=>{

    const { title, lang, enabled} = req.body;

    const hasPermission = await verifPerm(req.cookies.authToken, 2);
    if (!hasPermission) {
        return res.status(401).end();
    }

    const category_data = {
        title:title,
        lang:lang,
        enabled:enabled
    }

    const category = new Category(category_data);
    const res_log=await category.create();
    res.status(res_log.code).json({data:res_log.msg});
});

router.put("/modify", async (req,res)=>{
    const { title, lang, enabled, prev_title, prev_lang} = req.body;
    const hasPermission = await verifPerm(req.cookies.authToken, 3);
    if (!hasPermission) {
        return res.status(401).end();
    }

    const category_data = {
        title:title,
        lang:lang,
        enabled:enabled
    }

    const category = new Category(category_data);

    let res_log=await category.modify(prev_title, prev_lang);
    res.status(res_log.code).json({data:res_log.msg});

});

router.put("/delete", async (req,res)=>{
    const { title, lang } = req.body;
    const hasPermission = await verifPerm(req.cookies.authToken, 4);
    if (!hasPermission) {
        return res.status(401).end();
    }
    const category = new Category({title:title,lang:lang});

    const res_log = await category.delete();
    res.status(res_log.code).json({data:res_log.msg});

});

router.get("/get-langs",async (req,res)=>{
    const category = new Category();
    let res_log = category.getLangs();
    res.status(res_log.code).json({data:res_log.msg});
});
 
module.exports = router;