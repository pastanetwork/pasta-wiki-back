const { getAllCategories, verifyCategoryDB, createCategory, updateCategory  } = require("./sql_requests")
const { URLize } = require("../express_utils/utils");

const db_error = {msg:`Error : Something went wrong with the database`,code:500};

async function getCategories(lang="all"){
    let select_lang=false;
    if (lang!="all"){
        select_lang=true;
    }

    const categories = await getAllCategories();
    if (categories.code!==200){
        return db_error;
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

async function publishCategory(title, lang, enabled){
    const exist = await verifyCategoryDB(title, lang);
    console.log(exist)
    if (exist.code===500){return db_error;};
    if (exist.data===true){
        return {msg:`Error : Can't create category. A category with this title already exist.`,code:403};
    }

    const result_obj = createCategory(title, lang, enabled);
    if (result_obj.code===500){return db_error;}

    return {msg:"Category created successfully",code:201}
}

async function modifyCategory(title, lang, enabled, prev_title){
    const exist = await verifyCategoryDB(prev_title, lang);
    if (exist.code===500){return db_error;};
    if (exist.data===false){
        return {msg:`Error : Can't modify category. This category doesn't exist.`,code:404};
    }

    const result_obj = updateCategory(title, lang, enabled, prev_title);
    if (result_obj.code===500){return db_error;}
    
    return {msg:"Category modified successfully",code:201}
}

module.exports = { getCategories, publishCategory, modifyCategory };