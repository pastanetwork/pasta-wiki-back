const { getAllArticles, verifyArticleDB, createArticle, updateArticle, deleteArticleDB } = require("./sql_requests")
const { URLize } = require("../../express_utils/utils");

const db_error = {msg:`Error : Something went wrong with the database`,code:500};

async function getArticles(lang="all"){
    let select_lang=false;
    if (lang!="all"){
        select_lang=true;
    }

    const articles = await getAllArticles();
    if (articles.code!==200){
        return {msg:`Error : Something went wrong with the database`,code:500};
    }

    let request_result=[];
    for (let i of articles.data){
        if (i.enabled && i.category_enabled){
            request_result.push({
                title:i.article_name,
                title_urlized:URLize(i.article_name),
                category:i.category_name,
                category_urlized:URLize(i.category_name),
                lang:i.lang_code,
                content:i.content,
            });
        }
    }

    let result;
    if (select_lang){
        result = request_result.filter(item => item.lang === lang);
        if (result.length===0){
            return {msg:`Error : No article found with ${lang} as language`,code:404};
        }
    } else {
        result = request_result;
    }
    return {msg:result,code:200};
}

async function publishArticle(title, category, content, enabled){
    const exist = await verifyArticleDB(title,category);
    if (exist.code===500){return db_error;};
    if (exist.data===true){
        return {msg:`Error : Can't create article. An article with this title in this category already exist.`,code:403};
    }

    const result_obj = createArticle(title,category,content,enabled);
    if (result_obj.code===500){return db_error;}

    return {msg:"Article created successfully",code:201};
}

async function modifyArticle(title, category, content, enabled, prev_title, prev_category = category){
    const exist = await verifyArticleDB(prev_title,prev_category);
    if (exist.code===500){return db_error;};
    if (exist.data===false){
        return {msg:`Error : Can't modify article. This article doesn't exist.`,code:404};
    }

    const result_obj = updateArticle(title,category,content,enabled, prev_title);
    if (result_obj.code===500){return db_error;}
    
    return {msg:"Article updated successfully",code:200};
}


async function getArticlesWriter(lang="all"){
    let select_lang=false;
    if (lang!="all"){
        select_lang=true;
    }

    const articles = await getAllArticles();
    if (articles.code!==200){
        return {msg:`Error : Something went wrong with the database`,code:500};
    }

    let request_result=[];
    for (let i of articles.data){
        request_result.push({
            title:i.article_name,
            title_urlized:URLize(i.article_name),
            category:i.category_name,
            category_urlized:URLize(i.category_name),
            lang:i.lang_code,
            content:i.content,
            enabled:i.enabled,
        });
    }

    let result;
    if (select_lang){
        result = request_result.filter(item => item.lang === lang);
        if (result.length===0){
            return {msg:`Error : No article found with ${lang} as language`,code:404};
        }
    } else {
        result = request_result;
    }
    return {msg:result,code:200};
}

async function deleteArticle(title,category) {
    const exist = await verifyArticleDB(title,category);
    if (exist.code===500){return db_error;};
    if (exist.data===false){
        return {msg:`Error : Can't delete article. This article doesn't exist.`,code:404};
    }
    const delete_article = await deleteArticleDB(title,category);
    if (delete_article.code===200){
        return {msg:"Article deleted successfully",code:200}
    } else {
        return {msg:`Error : Article deletion failed. Please try again later`,code:503};
    };

}

module.exports = { getArticles, publishArticle, modifyArticle, getArticlesWriter, deleteArticle, }