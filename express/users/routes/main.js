const { Router } = require("express");
const router = Router();

const { registerUser, loginUser, logConnexion } = require("../utils")

router.post("/register",async (req,res)=>{
    const useragent = req.headers["user-agent"];
    const ip = req.headers["x-forwarded-for"];
    const { username, email, password } = req.body;
    let res_log=await registerUser(username, email, password);
    res.status(res_log.code).json({data:res_log.msg});
});

router.post("/login",async (req,res)=>{
    const useragent = req.headers["user-agent"];
    const ip = req.headers["x-forwarded-for"];
    const { email, password } = req.body;
    let res_log=await loginUser(email,password);
    await logConnexion(email,useragent,ip)
    res.status(res_log.code).json({data:res_log.msg});
});


module.exports = router;