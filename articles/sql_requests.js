const { pool } = require('../express_utils/postgres-connect');

async function getAllArticles(){
    try {
        const articles = await pool.query(`SELECT a.article_name, a.content, a.enabled, a.category_id, l.lang_code, c.category_name FROM articles.articles a JOIN articles.langs_codes l ON a.lang_id = l.lang_id JOIN articles.categories c ON a.category_id = c.category_id;`);
        return {code:200,data:articles.rows};
    } catch (error) {
        console.log(error);
        return {code:500,data:error};
    }
}

module.exports = { getAllArticles }