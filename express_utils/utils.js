const jwt = require('jsonwebtoken');
const { jwt_values } = require("./env-values-dictionnary")
const User = require("../api/users/User")

function URLize(input){
  return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_")
}

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
    return await user.checkUserPerms(perm_id);
}

module.exports = { URLize, checkJWT, verifPerm };