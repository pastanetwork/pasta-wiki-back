const { Router } = require("express");

const router = Router();

const User = require("../User")
const { checkJWT, verifPerm } = require("../../../express_utils/utils")

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
    if (res_log.code===201){
        res.cookie('authToken', res_log.data.token, {
            httpOnly: true,
            secure : true,
            sameSite : 'strict',
            maxAge : 14 * 24 * 60 * 1000
        });
    }
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
    if (res_log.code===200){
        res.cookie('authToken', res_log.data.token, {
            httpOnly: true,
            secure : true,
            sameSite : 'strict',
            maxAge : 14 * 24 * 60 * 60 * 1000
        });
    }
    res.status(res_log.code).json({data:res_log.msg});
});

router.get("/qrcode-2fa",async (req,res)=>{
    const data = checkJWT(req.cookies.authToken);
    if (!data.ok){
        return res.status(401).end();
    }
    const userdata = {
        email:data.user.email,
        user_id:data.user.user_id
    }
    const user = new User(userdata);
    const qrcode = await user.generateQRcode2FA();
    if (!qrcode.ok){
        return res.status(404).json({data:'404 Not found'}).end()
    }
    res.type("image/png");
    res.send(qrcode.data);
});

router.post("/verify-code-2fa", async (req,res)=>{
    const useragent = req.headers["user-agent"];
    const ip = req.headers["x-forwarded-for"];
    const code = req.body.code;

    const data = checkJWT(req.cookies.authToken);

    if (!data.ok){
        return res.status(401).end();
    }
    const userdata = {
        email:data.user.email,
        user_id:data.user.user_id,
        session_id:data.user.session_id,
        useragent:useragent,
        ip:ip,
    }
    const user = new User(userdata);
    const valid = await user.verify2FACode(code);
    if (!valid.ok){
        return res.status(401).json({data:"Code not valid"}).end();
    }
    const token = user.generateJWT();
    res.cookie('authToken', token, {
        httpOnly: true,
        secure : true,
        sameSite : 'strict',
        maxAge : 14 * 24 * 60 * 60 * 1000
    });
    return res.status(200).json({data:"OK"}).end();
});

router.get("/get-infos", async(req,res)=>{
    const data = checkJWT(req.cookies.authToken);
    if (!data.ok){
        return res.status(401).end();
    }
    const userdata = {
        email:data.user.email,
        user_id:data.user.user_id
    }
    const user = new User(userdata);
    const result = await user.getInfos();
    return res.status(result.code).json(result).end();
});

router.get("/get-connect-logs", async(req,res)=>{
    const data = checkJWT(req.cookies.authToken);
    if (!data.ok){
        return res.status(401).end();
    }
    const userdata = {
        email:data.user.email,
        user_id:data.user.user_id
    }
    const user = new User(userdata);
    const result = await user.getConnectLogs();
    return res.status(result.code).json(result).end();
});

router.get("/is-admin", async (req,res)=>{
    const hasPermission = await verifPerm(req.cookies.authToken, 10);
      if (!hasPermission) {
        return res.status(403).sendFile('403.html', {root: __dirname});
      }
      return res.status(200).end();
});

module.exports = router;