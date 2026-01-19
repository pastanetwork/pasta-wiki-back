const { pool } = require('../../express_utils/postgres-connect');
const { URLize } = require("../../express_utils/utils");

async function getAllArticles(){
    try {
        const articles = await pool.query(`SELECT a.article_name, a.content, a.enabled, a.category_id, l.lang_code, c.category_name, c.enabled AS category_enabled FROM articles.articles a JOIN articles.langs_codes l ON a.lang_id = l.lang_id JOIN articles.categories c ON a.category_id = c.category_id;`);
        return {code:200,data:articles.rows};
    } catch (error) {
        console.log(error);
        return {code:500,data:error};
    }
}

async function verifyArticleDB(title,category,lang) {
    const lang_res_obj = await getLangIdFromName(lang);
    if (lang_res_obj.code===500){
        return {code:500, data: lang_res_obj.data};
    }

    const category_res_obj = await getCategoryIdFromNameAndLangId(category,lang_res_obj.data);
    if (category_res_obj.code!==200){
        return {code:category_res_obj.code, data: category_res_obj.data};
    }
    
    const query = "SELECT 1 FROM articles.articles WHERE article_ref = $1 AND category_id = $2 LIMIT 1";
    try {
        const result = await pool.query(query, [URLize(title),category_res_obj.data]);
        return {code:200, data: result.rowCount > 0};
    } catch (error) {
        return {code:500, data: error};
    }
}

async function createArticle(title, category_name, category_lang, content, enabled){
    
    const lang_res_obj = await getLangIdFromName(category_lang);
    if (lang_res_obj.code===500){
        return {code:500, data: lang_res_obj.data};
    }

    const category_res_obj = await getCategoryIdFromNameAndLangId(category_name,lang_res_obj.data);
    if (category_res_obj.code===500){
        return {code:500, data: category_res_obj.data};
    }

    const query = `INSERT INTO articles.articles (article_name, category_id, content, lang_id, enabled, article_ref) VALUES ($1, $2, $3, $4, $5, $6)`;
    try {
        await pool.query(query, [title, category_res_obj.data, content, lang_res_obj.data, enabled, URLize(title)]);
        return { code: 200, data: "Success" };
    } catch (error) {
        return { code: 500, data: error };
    }
    
}

async function updateArticle(title, category, content, enabled, prev_title, prev_category) {
    const lang_res_obj = await getLangIdFromName(category.lang);
    if (lang_res_obj.code!==200){
        return {code:500, data: lang_res_obj.data};
    }

    const category_res_obj = await getCategoryIdFromNameAndLangId(category.name,lang_res_obj.data);
    if (category_res_obj.code!==200){
        return {code:500, data: category_res_obj.data};
    }

    const prev_lang_res_obj = await getLangIdFromName(prev_category.lang);
    if (prev_lang_res_obj.code!==200){
        return {code:500, data: prev_lang_res_obj.data};
    }

    const prev_category_res_obj = await getCategoryIdFromNameAndLangId(prev_category.name,prev_lang_res_obj.data);
    if (prev_category_res_obj.code!==200){
        return {code:500, data: prev_category_res_obj.data};
    }

    const query = `UPDATE articles.articles SET article_name = $1, category_id = $2, content = $3, lang_id = $4, enabled = $5, article_ref = $6 WHERE article_ref = $7 AND category_id =$8`;
    try {
        await pool.query(query, [title, category_res_obj.data, content, lang_res_obj.data, enabled, URLize(title), URLize(prev_title),prev_category_res_obj.data]);
        return { code: 200, data: "Success" };
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function changeArticleLang(old_lang,category,article){
    const old_lang_res_obj = await getLangIdFromName(old_lang);
    if (old_lang_res_obj.code!==200){
        return {code:500, data: old_lang_res_obj.data};
    }

    const new_lang_res_obj = await getLangIdFromName(category.lang);
    if (new_lang_res_obj.code!==200){
        return {code:500, data: new_lang_res_obj.data};
    }

    const category_res_obj = await getCategoryIdFromNameAndLangId(category.name,new_lang_res_obj.data);
    if (category_res_obj.code!==200){
        return {code:500, data: category_res_obj.data};
    }

    const query = `UPDATE articles.articles SET lang_id = $1 WHERE article_ref = $2 AND category_id =$3`;
    
    try {
        await pool.query(query, [new_lang_res_obj.data,URLize(article),category_res_obj.data]);
        return { code: 200, data: "Success" };
    } catch (error) {
        return { code: 500, data: error };
    }
}

async function deleteArticleDB(title,category) {
    const lang_res_obj = await getLangIdFromName(category.lang);
    if (lang_res_obj.code!==200){
        return {code:500, data: lang_res_obj.data};
    }
    const category_res_obj = await getCategoryIdFromNameAndLangId(category.name,lang_res_obj.data);
    if (category_res_obj.code===500){
        return {code:500, data: category_res_obj.data};
    }
    const query = `DELETE FROM articles.articles WHERE article_name = $1 AND category_id = $2`;

    try{
        const result = await pool.query(query, [title,category_res_obj.data])
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

async function getCategoryIdFromNameAndLangId(name,lang_id) {
    const query = `SELECT category_id FROM articles.categories WHERE category_ref = $1 AND lang_id = $2`;
    try {
        const result = await pool.query(query, [URLize(name),lang_id]);
        if (result.rows.length === 0) {
            return { code: 404, data: `'${name}' doesn't exist.` };
        }
        return { code: 200, data: result.rows[0].category_id };
    } catch (error) {
        return { code: 500, data: error };
    }
}

module.exports = { getAllArticles, verifyArticleDB, createArticle, updateArticle, changeArticleLang, deleteArticleDB }