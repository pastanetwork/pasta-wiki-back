const argon2 = require('argon2');

const { registerSchema } = require("./joi-schemas")
const { verifyEmailDB, registerUserDB, loginUserDB, logLoginAttempt } = require("./sql_requests")

const db_error = {msg:`Error : Something went wrong with the database`,code:500};


class User {
    constructor(userdata = {}) {
        this.username = userdata.username || "";
        this.email = userdata.email || "";
        this.password = userdata.password || "";
        this.useragent = userdata.useragent || "";
        this.ip = userdata.ip || "";
        
    }

    async register(){
        try {
            await registerSchema.validateAsync({ username:this.username, email:this.email, password:this.password });
        } catch (error) {
            return {msg:`Error : Invalid inputs.\n${error.details[0].message}`,code:400};
        }
            
        const email_exist_obj = await verifyEmailDB(this.email);
        if (email_exist_obj.code===500){
            return db_error;
        }
        if (email_exist_obj.data===true){
            return {msg:`Error : Can't create account with ${this.email}. An account with this email already exist.`,code:403};
        }
        const result = await registerUserDB(this.username,this.email,await argon2.hash(this.password));
        if (result.code===500){
            return db_error;
        } else {
            return {msg:"User created successfully",code:201}
        }
    }
    
    async login(){
        const email_exist_obj = await verifyEmailDB(this.email);
        if (email_exist_obj.code===500){
            return db_error;
        }
        if (email_exist_obj.data!==true){
            return {msg:`Error : Can't login account with ${this.email}. No account with this email exist.`,code:404};
        }
    
        const result = await loginUserDB(this.email,this.password);
        if (result.code===500){
            await this.logConnexion("FAILED")
            return db_error;
        } else {
            await this.logConnexion("SUCCESS")
            return {msg:"User logged in successfully",code:201}
        }
    }

    async logConnexion(status){
        const email_exist_obj = await verifyEmailDB(this.email);
        if (email_exist_obj.code===500 || email_exist_obj.data===false ){
            return;
        }
        await logLoginAttempt(this.email,this.useragent,this.ip,status);
    }
}

module.exports = User;