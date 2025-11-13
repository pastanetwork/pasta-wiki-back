const { pool } = require('../../express_utils/postgres-connect');
const argon2 = require('argon2');

async function verifyEmailDB(email) {
    const query = "SELECT 1 FROM users.users WHERE email = $1 LIMIT 1";
    try {
        const result = await pool.query(query, [email]);
        return {code:200,data: result.rowCount > 0};
    } catch (error) {
        return {code:500,data: error};
    }
}

async function registerUserDB(username, email, password_h, secret_2fa) {
    const query = `INSERT INTO users.users (username, email, password, key_2fa) VALUES ($1, $2, $3, $4) RETURNING user_id`;
    try {
        const result = await pool.query(query, [username, email, password_h, secret_2fa]);
        const user_id = result.rows[0].user_id;
        return { code: 200, data: 'Success', user_id:user_id};
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function loginUserDB(email, password) {
    const query = "SELECT password, user_id FROM users.users WHERE email = $1 LIMIT 1";
    try {
        const result = await pool.query(query, [email]);
        const user = result.rows[0];
        const match = await argon2.verify(user.password, password);
        if (!match) {
            return {code: 401, data: "Invalid password"};
        }
        const user_id = result.rows[0].user_id;
        return { code: 200, data: 'Success', user_id:user_id};
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function logLoginAttempt(email,useragent,ip,status,user_id,session_id){
    const query = `INSERT INTO users.connexion_logs (email, user_agent, ip, status, user_id, session_id ) VALUES ($1, $2, $3, $4, $5, $6)`;
    try {
        await pool.query(query, [email,useragent,ip,status,user_id,session_id]);
        return { code: 200, data: 'Success' };
    } catch (error) {
        return { code: 500, data: error };
    }
}
async function verifyUserEmailAndId(email, user_id) {
    const query = "SELECT 1 FROM users.users WHERE email = $1 AND user_id = $2 LIMIT 1";
    try {
        const result = await pool.query(query, [email, user_id]);
        if (result.rows.length > 0) {
            return { code: 200, data: 'Success' };
        } else {
            return { code: 404, data: 'Not found' };
        }
    } catch (error) {
        return { code: 500, data: error};
    }
}

async function getUserRole(user_id) {
    const query = "SELECT role_id FROM users.users WHERE user_id = $1 LIMIT 1";
    try {
        const result = await pool.query(query, [user_id]);
        
        if (result.rows.length > 0) {
            return { code: 200, data: 'Success', role_id: result.rows[0].role_id };
        } else {
            return { code: 404, data: 'Not found' };
        }
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function getRolePerms(role_id){
    const query = "SELECT perm_id FROM perms.roles_perms WHERE role_id = $1";
    try {
        const result = await pool.query(query, [role_id]);
        
        if (result.rows.length > 0) {
            return { code: 200, data: 'Success', perms: result.rows};
        } else {
            return { code: 404, data: 'Not found' };
        }
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function getSecret2FA(user_id){
    const query = "SELECT key_2fa FROM users.users WHERE user_id = $1";
    try {
        const result = await pool.query(query, [user_id]);
        
        if (result.rows.length > 0) {
            return { code: 200, data: 'Success', key: result.rows[0].key_2fa};
        } else {
            return { code: 404, data: 'Not found' };
        }
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function setDefinitiveDB(user_id){
    const query = "UPDATE users.users SET definitive = true WHERE user_id = $1";
    try {
        const result = await pool.query(query, [user_id]);
        if (result.rowCount > 0) {
            return { code: 200, data: 'Success' };
        } else {
            return { code: 404, data: 'Not found' };
        }
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function getDefinitiveDB(user_id){
    const query = "SELECT definitive FROM users.users WHERE user_id = $1";
    try {
        const result = await pool.query(query, [user_id]);
        if (result.rowCount > 0) {
            return { code: 200, data: result };
        } else {
            return { code: 404, data: 'Not found' };
        }
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function setApprovedDB(user_id,status){
    const query = "UPDATE users.users SET approved = $1 WHERE user_id = $2";
    try {
        const result = await pool.query(query, [status,user_id]);
        if (result.rowCount > 0) {
            return { code: 200, data: 'Success' };
        } else {
            return { code: 404, data: 'Not found' };
        }
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function getUserInfos(user_id){
    const query = "SELECT username, email, created_at, r.name as role FROM users.users u LEFT JOIN perms.roles r ON u.role_id = r.id WHERE user_id = $1"
    try {
        const result = await pool.query(query, [user_id]);
        if (result.rowCount > 0) {
            return { code: 200, data: result.rows[0] };
        } else {
            return { code: 404, data: 'Not found' };
        }
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function getUserConnectionLogs(user_id){
    const query = "SELECT email, user_agent, ip, status, date FROM users.connexion_logs WHERE user_id = $1"
    try {
        const result = await pool.query(query, [user_id]);
        if (result.rowCount > 0) {
            return { code: 200, data: result.rows};
        } else {
            return { code: 404, data: 'Not found' };
        }
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function updateUsername(user_id,username) {
    const query = "UPDATE users.users SET username = $2 WHERE user_id = $1"
    try{
        const result= await pool.query(query,[user_id,username])
        return { code: 200, data: 'Success' };
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function updateEmail(user_id,email) {
    const query = "UPDATE users.users SET email = $2 WHERE user_id = $1"
    try{
        const result= await pool.query(query,[user_id,email])
        return { code: 200, data: 'Success' };
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function updatePassword(user_id,password) {
    const query = "UPDATE users.users SET password = $2 WHERE user_id = $1"
    try{
        const result= await pool.query(query,[user_id,password])
        return { code: 200, data: 'Success' };
    } catch (error) {
        return { code: 500, data: error };
    }
}

module.exports = { verifyEmailDB, registerUserDB, loginUserDB, logLoginAttempt, verifyUserEmailAndId, getUserRole, getRolePerms, getSecret2FA, setDefinitiveDB, getDefinitiveDB, setApprovedDB,  getUserInfos, getUserConnectionLogs, updateUsername, updateEmail, updatePassword, }