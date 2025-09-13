const argon2 = require('argon2');

const { registerSchema } = require("./joi-schemas")
const { verifyEmailDB, registerUserDB, loginUserDB, logLoginAttempt } = require("./sql_requests")

const db_error = {msg:`Error : Something went wrong with the database`,code:500};

async function registerUser(username, email, password){
    try {
        await registerSchema.validateAsync({ username, email, password });
    } catch (error) {
        return {msg:`Error : Invalid inputs.\n${error.details[0].message}`,code:400};
    }
    
    const email_exist_obj = await verifyEmailDB(email);
    if (email_exist_obj.code===500){
        return db_error;
    }
    if (email_exist_obj.data===true){
        return {msg:`Error : Can't create account with ${email}. An account with this email already exist.`,code:403};
    }
    const result = await registerUserDB(username,email,await argon2.hash(password));
    if (result.code===500){
        return db_error;
    } else {
        return {msg:"User created successfully",code:201}
    }
    
}

async function loginUser( email, password){
    const email_exist_obj = await verifyEmailDB(email);
    if (email_exist_obj.code===500){
        return db_error;
    }
    if (email_exist_obj.data!==true){
        return {msg:`Error : Can't login account with ${email}. No account with this email exist.`,code:404};
    }

    const result = await loginUserDB(email,password);
    if (result.code===500){
        return db_error;
    } else {
        return {msg:"User logged in successfully",code:201}
    }
}

async function logConnexion(email, useragent, ip){
    const email_exist_obj = await verifyEmailDB(email);
    if (email_exist_obj.code===500 || email_exist_obj.data===false ){
        return;
    }
    await logLoginAttempt(email,useragent,ip);
}

module.exports = { registerUser, loginUser, logConnexion};