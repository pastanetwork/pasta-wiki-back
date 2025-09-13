const { pool } = require('../express_utils/postgres-connect');

async function getAllCategories(){
    try {
        const categories = await pool.query(`SELECT c.category_name,c.lang_id, c.enabled, l.lang_code FROM articles.categories c JOIN articles.langs_codes l ON c.lang_id = l.lang_id`);
        return {code:200,data:categories.rows};
    } catch (error) {
        console.log(error);
        return {code:500,data:error};
    }
}

module.exports = { getAllCategories };