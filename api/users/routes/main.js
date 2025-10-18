const { Router } = require("express");
const router = Router();

const User = require("../User")

router.post("/register",async (req,res)=>{

    const useragent = req.headers["user-agent"];
    const ip = req.headers["x-forwarded-for"];
    const { username, email, password } = req.body;

    const userdata = {
        username:username,
        email:email,
        password:password,
        useragent:useragent,
        ip:ip,
    }
    
    const user = new User(userdata);
    let res_log=await user.register()
    res.status(res_log.code).json({data:res_log.msg});
});

router.post("/login",async (req,res)=>{
    const useragent = req.headers["user-agent"];
    const ip = req.headers["x-forwarded-for"];
    const { email, password } = req.body;

    const userdata = {
        email:email,
        password:password,
        useragent:useragent,
        ip:ip,
    }
    const user = new User(userdata);
    let res_log=await user.login()
    res.status(res_log.code).json({data:res_log.msg});
});


module.exports = router;