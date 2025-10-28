const { pool } = require('../../express_utils/postgres-connect');
const { URLize } = require("../../express_utils/utils");

async function getAllArticles(){
    try {
        const articles = await pool.query(`SELECT a.article_name, a.content, a.enabled, a.category_id, l.lang_code, c.category_name FROM articles.articles a JOIN articles.langs_codes l ON a.lang_id = l.lang_id JOIN articles.categories c ON a.category_id = c.category_id;`);
        return {code:200,data:articles.rows};
    } catch (error) {
        console.log(error);
        return {code:500,data:error};
    }
}

async function verifyArticleDB(title,category) {
    const category_res_obj = await getCategoryIdFromName(category);
    if (category_res_obj.code===500){
        return {code:500, data: category_res_obj.data};
    }
    const query = "SELECT 1 FROM articles.articles WHERE article_ref = $1 AND category_id = $2 LIMIT 1";
    try {
        const result = await pool.query(query, [URLize(title),category_res_obj.data.category_id]);
        return {code:200, data: result.rowCount > 0};
    } catch (error) {
        return {code:500, data: error};
    }
}

async function createArticle(title, category, content, enabled){
    const category_res_obj = await getCategoryIdFromName(category);
    if (category_res_obj.code===500){
        return {code:500, data: category_res_obj.data};
    }
    const query = `INSERT INTO articles.articles (article_name, category_id, content, lang_id, enabled, article_ref) VALUES ($1, $2, $3, $4, $5, $6)`;
    try {
        await pool.query(query, [title, category_res_obj.data.category_id, content, category_res_obj.data.lang_id, enabled, URLize(title)]);
        return { code: 200, data: "Success" };
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function updateArticle(title, category, content, enabled, prev_title) {
    const category_res_obj = await getCategoryIdFromName(category);
    if (category_res_obj.code===500){
        return {code:500, data: category_res_obj.data};
    }
    const query = `UPDATE articles.articles SET article_name = $1, category_id = $2, content = $3, lang_id = $4, enabled = $5, article_ref = $6 WHERE article_ref = $7 `;
    try {
        await pool.query(query, [title, category_res_obj.data.category_id, content, category_res_obj.data.lang_id, enabled, URLize(title), URLize(prev_title)]);
        return { code: 200, data: "Success" };
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function deleteArticleDB(title,category) {
    const category_res_obj = await getCategoryIdFromName(category);
    if (category_res_obj.code===500){
        return {code:500, data: category_res_obj.data};
    }
    const query = `DELETE FROM articles.articles WHERE article_name = $1 AND category_id = $2`;
    try{
        await pool.query(query, [title,category_res_obj.data.category_id])
        return { code: 200, data: "Success" };
    } catch (error) {
        return { code: 500, data: error };
    }
}


async function getCategoryIdFromName(category) {
    const query = `SELECT category_id, lang_id FROM articles.categories WHERE category_ref = $1`;
    try {
        const result = await pool.query(query, [URLize(category)]);
        if (result.rows.length === 0) {
            return { code: 404, data: `'${category}' doesn't exist.` };
        }
        return { code: 200, data: { category_id:result.rows[0].category_id, lang_id:result.rows[0].lang_id} };
    } catch (error) {
        return { code: 500, data: error };
    }
}

module.exports = { getAllArticles, verifyArticleDB, createArticle, updateArticle, deleteArticleDB }