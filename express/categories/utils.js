const { getAllCategories } = require("./sql_requests")

const { URLize } = require("../express_utils/utils");

async function getCategories(lang="all"){
    let select_lang=false;
    if (lang!="all"){
        select_lang=true;
    }

    const categories = await getAllCategories();
    if (categories.code!==200){
        return {msg:`Error : Something went wrong with the database`,code:500};
    }

    let request_result=[];
    for (let i of categories.data){
        if (i.enabled){
            request_result.push({
                title:i.category_name,
                title_urlized:URLize(i.category_name),
                lang:i.lang_code,
            });
        }
    }

    let result;
    if (select_lang){
        result = request_result.filter(item => item.lang === lang);
        if (result.length===0){
            return { msg:`Error : No category found with ${lang} as language`, code:404 };
        }
    } else {
        result = request_result;
    }
    return { msg:result,code:200 };
}

module.exports = { getCategories };