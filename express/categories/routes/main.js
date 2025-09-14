const { Router } = require("express");
const router = Router();

const { getCategories, publishCategory, modifyCategory } = require("../utils")

router.get("/all",async (req,res)=>{
    let res_log=await getCategories("all");
    res.status(res_log.code).json({data:res_log.msg});
});

router.get("/lang/:lang",async (req,res)=>{
    const { lang } = req.params;
    let res_log=await getCategories(lang);
    res.status(res_log.code).json({data:res_log.msg});
});

router.post("/publish", async (req,res)=>{
    const { title, lang, enabled} = req.body;
    let res_log=await publishCategory(title, lang, enabled);
    res.status(res_log.code).json({data:res_log.msg});
});

router.post("/modify", async (req,res)=>{
    const { title, lang, enabled, prev_title} = req.body;
    let res_log=await modifyCategory(title, lang, enabled, prev_title);
    res.status(res_log.code).json({data:res_log.msg});

});

module.exports = router;