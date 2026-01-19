const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const twofactor = require('node-2fa');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const { registerSchema, usernameSchema, emailSchema, passwordSchema } = require("./joi-schemas");
const { verifyEmailDB, registerUserDB, loginUserDB, logLoginAttempt, verifyUserEmailAndId, getUserRole, getRolePerms, getSecret2FA, setDefinitiveDB, getDefinitiveDB, setApprovedDB, getUserInfos, getUserConnectionLogs, updateUsername, updateEmail, updatePassword, getAllUsers, getAllRoles, } = require("./sql_requests");
const { jwt_values } = require("../../express_utils/env-values-dictionnary");
const { encrypt, decrypt} = require("../../express_utils/encryption");

const db_error = {msg:`Error : Something went wrong with the database`,code:500};

class User {
    constructor(userdata = {}) {
        this.username = userdata.username || "";
        this.email = userdata.email || "";
        this.password = userdata.password || "";
        this.useragent = userdata.useragent || "";
        this.ip = userdata.ip || "Internal";
        this.user_id= userdata.user_id || "";
        this.session_id = userdata.session_id || uuidv4();
        this.verified_2fa = userdata.verified_2fa || false;
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
        const secret_2fa = this.generateSecret2FA()
        const encrypted = encrypt(secret_2fa);
        if (!encrypted.ok){
             return {msg:`Error: A problem occured in 2FA secret encryption process.`,code:500};
        }
        const result = await registerUserDB(this.username,this.email,await argon2.hash(this.password),encrypted.key);
        if (result.code === 200){
            this.user_id = result.user_id;
            await this.logConnexion("SUCCESS")
            return {msg:"User created successfully",code:201,data:{token:this.generateJWT()}}
        } else {
            if (result.code===500){
                return db_error;
            }
        }
    }
    
    async login(){
        const email_exist_obj = await verifyEmailDB(this.email);
        if (email_exist_obj.code===500){
            return db_error;
        }
        if (email_exist_obj.data!==true){
            return {msg:`Invalid Credentials.`,code:401};
        }
    
        const result = await loginUserDB(this.email,this.password);
        if (result.code === 200){
            this.user_id = result.user_id;
            await this.logConnexion("SUCCESS")
            return {msg:"User logged in successfully",code:200,data:{token:this.generateJWT()}}
        } else {
            await this.logConnexion("FAILED")
            if (result.code===500){
                return db_error
            };
            if (result.code === 401){
                return {msg:`Invalid Credentials.`,code:401};
            }
        }
    }

    async logConnexion(status){
        const email_exist_obj = await verifyEmailDB(this.email);
        if (email_exist_obj.code===500 || email_exist_obj.data===false ){
            return;
        }
        await logLoginAttempt(this.email,this.useragent,this.ip,status,this.user_id,this.session_id);
    }

    generateJWT(){
        const token = jwt.sign({user_id:this.user_id, email:this.email, session_id:this.session_id,ip:this.ip,verified_2fa:this.verified_2fa},jwt_values.secret,{expiresIn:'14d'});
        return token
    }

    async checkUserPerms(perm_id){
    /// Retournes un booléen : 
    /*
    - Vérifie si les informations données sont cohérentes. -> sinon retournes false.
    - Récupères l'id du rôle de l'utilisateur. -> si la requête échoue retournes false.
    - Récupères les permissions du rôle. -> si la requête échoue retournes false.
    - Véries parmis la liste des permissions du rôles si l'une des permission possède l'id perm_id. -> retournes false par défaut.
    - Si il y a une correspondance. -> retournes true.
    */
        const user_verif = await verifyUserEmailAndId(this.email,this.user_id);
        if(user_verif.code !== 200){
            return false;
        }
        const role_id_verif = await getUserRole(this.user_id);
        if (role_id_verif.code!==200){
            return false;
        }
        const perms_verif = await getRolePerms(role_id_verif.role_id);
        if (perms_verif.code!==200){
            return false;
        }
        let has_perm = false;
        for (let i of perms_verif.perms){
            if (i.perm_id === perm_id){
                has_perm=true
            }
        }
        return has_perm;
    }

    generateSecret2FA(){
        const secret = twofactor.generateSecret({
            name: 'Pastanetwork Wiki Manager',
            account: this.email
        });
        return secret.secret
    }

    async generateQRcode2FA() {
        const is_definitive = await getDefinitiveDB(this.user_id);
        if (is_definitive.data.rows[0].definitive){
            if (!is_definitive.code===200 || (is_definitive.code===200 && is_definitive.data)){
                return {ok:false};
            }
        }

        const secret = await getSecret2FA(this.user_id);
        if (secret.code!==200){
            return {ok:false};
        }
        const decrypted = decrypt(secret.key);
        if (!decrypted.ok){
            return {ok:false};
        }
        const url = `otpauth://totp/Pastanetwork%20Wiki%20Editor%3A${this.email}?secret=${decrypted.key}&issuer=Pastanetwork%20Wiki%20Editor`;
        try {
            const qrCodeDataURL = await QRCode.toBuffer(url);
            return {ok:true,data:qrCodeDataURL};
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async setDefinitive(){
        const result = await setDefinitiveDB(this.user_id);
        if (result.code === 200){
            return {ok:true}
        } else {
            if (result.code === 404){
                return {ok:false,error:"User not found"}
            }
            if (result.code === 500){
                return {ok:false,error:db_error}
            }

        }
    }

    async setApproved(status=false){
    /// Prends en entrée un booléen.
    /*
    
    */
        const result = await setApprovedDB(this.user_id,status);
        if (result.code === 200){
            return {ok:true}
        } else {
            if (result.code === 404){
                return {ok:false,error:"User not found"}
            }
            if (result.code === 500){
                return {ok:false,error:db_error}
            }

        }
    }

    async verify2FACode(code){
        const secret = await getSecret2FA(this.user_id);
        if (secret.code!==200){
            return {ok:false};
        }
        const result = twofactor.verifyToken(decrypt(secret.key).key, code);
        if (!result){
            return {ok:false}
        }
        if (result.delta>=0){
            this.verified_2fa=true
            setDefinitiveDB(this.user_id);
            return {ok:true}
        } else {
            return {ok:false}
        }
    }

    async getInfos(){
        const result = await getUserInfos(this.user_id);
        if (result.code !== 200){
            if (result.code === 404){
                return {code:404,msg:"User not found"}
            } else {
                return db_error
            }
        }
        const send_data = {
            username:result.data.username,
            email:result.data.email,
            created_at:result.data.created_at,
            role:result.data.role
        }
        return {code:200,msg:send_data}
    }

    async getConnectLogs(){
        const result =await getUserConnectionLogs(this.user_id);
        if (result.code !== 200){
            if (result.code === 404){
                return {code:404,msg:"User not found"}
            } else {
                return db_error
            }
        }
        let send_data = []
        for (let el of result.data){
            send_data.push({
            email:el.email,
            user_agent:el.user_agent,
            ip:el.ip,
            date:el.date,
            status:el.status,
        })
        }
        return {code:200,msg:send_data}
    }

    async modify(new_username,new_email,new_password){
        if (new_username !==""){
            try {
                await usernameSchema.validateAsync({username:new_username});
            } catch (error) {
                return {msg:`Error : Invalid inputs.\n${error.details[0].message}`,code:400};
            }
            const result = await updateUsername(this.user_id,new_username);
            if (result.code !== 200){
                return db_error;
            }
        }

        if (new_email !== ""){
            try {
                await emailSchema.validateAsync({email:new_email});
            } catch (error) {
                return {msg:`Error : Invalid inputs.\n${error.details[0].message}`,code:400};
            }
            const email_exist_obj = await verifyEmailDB(new_email);
            if (email_exist_obj.code===500){
                return db_error;
            }
            const result = await updateEmail(this.user_id,new_email);
            if (result.code !== 200){
                return db_error;
            }
        }

        if (new_password !== ""){
            try {
                await passwordSchema.validateAsync({password:new_password});
            } catch (error) {
                return {msg:`Error : Invalid inputs.\n${error.details[0].message}`,code:400};
            }
            const result = await updatePassword(this.user_id,await argon2.hash(new_password));
            if (result.code !== 200){
                return db_error;
            }
        }

        return ({code:200,msg:"User modified successfully"})
    }

    async getAll(){
        const result = await getAllUsers();
        if (result.code!==200){
            return db_error;
        }
        return ({code:200,msg:result.data});
    }

    async getRoles(){
        const result = await getAllRoles();
        if (result.code!==200){
            return db_error;
        }
        return ({code:200,msg:result.data});
    }
}

module.exports = User;