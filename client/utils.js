const jwt = require('jsonwebtoken');
const { jwt_values } = require("../express_utils/env-values-dictionnary")
const User = require("../api/users/User")

function checkJWT(token) {
    let valid = false;
    let user = {}
    try {
        const decoded = jwt.verify(token, jwt_values.secret);
        user.user_id=decoded.user_id;
        user.email=decoded.email;
        valid = true;
    } catch (error){
        valid = false;
    }
    return {ok:valid,user:user};
}

async function verifPerm(token,perm_id){
    if(perm_id===0){
        return true;
    }
    const checkedJWT = checkJWT(token);
    if (!checkedJWT.ok){
        return false
    }
    const user = new User({email:checkedJWT.user.email,user_id:checkedJWT.user.user_id});
    return user.checkUserPerms(perm_id);
}

module.exports = { checkJWT, verifPerm };