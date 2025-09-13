const { getAllArticles } = require("./sql_requests")

const { URLize } = require("../express_utils/utils");

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
        if (i.enabled){
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

module.exports = { getArticles }