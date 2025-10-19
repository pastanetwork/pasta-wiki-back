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

async function registerUserDB(username, email, password_h) {
    const query = `INSERT INTO users.users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id`;
    try {
        await pool.query(query, [username, email, password_h]);
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

async function logLoginAttempt(email,useragent,ip,status,user_id){
    const query = `INSERT INTO users.connexion_logs (email, user_agent, ip, status, user_id) VALUES ($1, $2, $3, $4, $5)`;
    try {
        await pool.query(query, [email,useragent,ip,status,user_id]);
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

module.exports = { verifyEmailDB, registerUserDB, loginUserDB, logLoginAttempt, verifyUserEmailAndId, getUserRole, getRolePerms, }