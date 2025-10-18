const { pool } = require('../../express_utils/postgres-connect');
const argon2 = require('argon2');

async function verifyEmailDB(email) {
    const query = "SELECT 1 FROM articles.users WHERE email = $1 LIMIT 1";
    try {
        const result = await pool.query(query, [email]);
        return {code:200,data: result.rowCount > 0};
    } catch (error) {
        return {code:500,data: error};
    }
}

async function registerUserDB(username, email, password_h) {
    const query = `INSERT INTO articles.users (username, email, password) VALUES ($1, $2, $3)`;
    try {
        await pool.query(query, [username, email, password_h]);
        return { code: 200, data: 'Success' };
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function loginUserDB(email, password) {
    const query = "SELECT password FROM articles.users WHERE email = $1 LIMIT 1";
    try {
        const result = await pool.query(query, [email]);
        const user = result.rows[0];
        const match = await argon2.verify(user.password, password);
        if (!match) {return { code: 401, data: "Invalid password" };}
        return {code: 200, data: "Success"};
    } catch (error) {
        console.log(error)
        return { code: 500, data: error };
    }
}

async function logLoginAttempt(email,useragent,ip){
    const query = `INSERT INTO articles.connexion_logs (email, user_agent, ip) VALUES ($1, $2, $3)`;
    try {
        await pool.query(query, [email,useragent,ip]);
        return { code: 200, data: 'Success' };
    } catch (error) {
        return { code: 500, data: error };
    }
}

module.exports = { verifyEmailDB, registerUserDB, loginUserDB, logLoginAttempt}