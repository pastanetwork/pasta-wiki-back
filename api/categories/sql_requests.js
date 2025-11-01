const { pool } = require('../../express_utils/postgres-connect');
const { URLize } = require("../../express_utils/utils");

async function getAllCategories(){
    try {
        const categories = await pool.query(`SELECT c.category_name,c.lang_id, c.enabled, l.lang_code, COUNT(a.category_id) as article_count FROM articles.categories c JOIN articles.langs_codes l ON c.lang_id = l.lang_id LEFT JOIN articles.articles a ON c.category_id = a.category_id GROUP BY c.category_id, c.category_name, c.lang_id, c.enabled, l.lang_code ORDER BY c.category_name;`);
        return {code:200,data:categories.rows};
    } catch (error) {
        console.log(error);
        return {code:500,data:error};
    }
}

async function verifyCategoryDB(title, lang) {
    const lang_res_obj = await getLangIdFromName(lang);
    if (lang_res_obj.code===500){
        return {code:500, data: lang_res_obj.data};
    }
    if (lang_res_obj.code===404){
        return {code:404, data: lang_res_obj.data};
    }
    const query = "SELECT 1 FROM articles.categories WHERE category_ref = $1 AND lang_id = $2 LIMIT 1";
    try {
        const result = await pool.query(query, [URLize(title),lang_res_obj.data]);
        return {code:200, data: result.rowCount > 0};
    } catch (error) {
        return {code:500, data: error};
    }
}

async function createCategory(title, lang, enabled){
    const lang_res_obj = await getLangIdFromName(lang);
    if (lang_res_obj.code===500){
        return {code:500, data: lang_res_obj.data};
    }
    if (lang_res_obj.code===404){
        return {code:404, data: lang_res_obj.data};
    }
    const query = `INSERT INTO articles.categories (category_name, lang_id, enabled, category_ref) VALUES ($1, $2, $3, $4)`;
    try {
        await pool.query(query, [title, lang_res_obj.data, enabled, URLize(title)]);
        return { code: 200, data: "Success" };
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function updateCategory(title, lang, enabled, prev_title) {
    const lang_res_obj = await getLangIdFromName(lang);
    if (lang_res_obj.code===500){
        return {code:500, data: lang_res_obj.data};
    }
    if (lang_res_obj.code===404){
        return {code:404, data: lang_res_obj.data};
    }
    const query = `UPDATE articles.categories SET category_name = $1, lang_id = $2, enabled = $3, category_ref = $4 WHERE category_ref = $5 `;
    try {
        await pool.query(query, [title, lang_res_obj.data, enabled, URLize(title), URLize(prev_title)]);
        return { code: 200, data: "Success" };
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function getLangIdFromName(lang) {
    const query = `SELECT lang_id FROM articles.langs_codes WHERE lang_code = $1`;
    try {
        const result = await pool.query(query, [lang]);
        if (result.rows.length === 0) {
            return { code: 404, data: `'${lang}' doesn't exist.` };
        }
        return { code: 200, data: result.rows[0].lang_id };
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function getLangsDB() {
    const query=`SELECT lang_code, lang_name FROM articles.langs_codes`;
    try {
        const result = await pool.query(query);
        if (result.rows.length === 0){
            return { code: 404, data: `No langs found.` };
        }
        return { code: 200, data:result.rows}
    } catch (error) {
        return { code:500, data:error};
    }
}

async function deleteCategoryDB(title,lang) {
    const lang_res_obj = await getLangIdFromName(lang);
    if (lang_res_obj.code===500){
        return {code:500, data: lang_res_obj.data};
    }
    const query = `DELETE FROM articles.categories WHERE category_name = $1 AND lang_id = $2`;
    try{
        await pool.query(query, [title,lang_res_obj.data])
        return { code: 200, data: "Success" };
    } catch (error) {
        return { code: 500, data: error };
    }
}
module.exports = { getAllCategories, verifyCategoryDB, createCategory, updateCategory, getLangsDB, deleteCategoryDB, };