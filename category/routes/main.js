const { Router } = require("express");
const router = Router();

const { URLize } = require("../../express_utils/utils")

router.get("/get-all",async (req,res)=>{

    const res_code=200;
    const res_type="Success";

    let res_log=[
        {title:"Tutorials",title_urlized:'',articles:[""]},
    ];

    for (let i of res_log){
        i.title_urlized=URLize(i.title);
    }

    res.status(res_code).json({code:res_code,type:res_type,log:res_log});

});

module.exports = router