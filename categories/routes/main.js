const { Router } = require("express");
const router = Router();

const { getCategories } = require("../utils")

router.get("/all",async (req,res)=>{
    let res_log=await getCategories("all");
    res.status(res_log.code).json({data:res_log.msg});
});

router.get("/lang/:lang",async (req,res)=>{
    const { lang } = req.params;
    let res_log=await getCategories(lang);
    res.status(res_log.code).json({data:res_log.msg});
});

module.exports = router;