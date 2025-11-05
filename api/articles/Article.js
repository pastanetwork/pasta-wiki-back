const { getAllArticles, verifyArticleDB, createArticle, updateArticle, deleteArticleDB } = require("./sql_requests")
const { URLize } = require("../../express_utils/utils");

const db_error = {msg:`Error : Something went wrong with the database`,code:500};

class Article {
    constructor(data = {}) {
        this.title = data.title || "";
        this.category = data.category || "none";
        this.content = data.content || "";
        this.lang = { code : data.lang_code || "", name : data.lang_name || "" }
        
    }

    async getAll(lang="all",advanced_data=false){
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
            if (advanced_data){
                request_result.push({
                    title:i.article_name,
                    title_urlized:URLize(i.article_name),
                    category:i.category_name,
                    category_urlized:URLize(i.category_name),
                    lang:i.lang_code,
                    content:i.content,
                    enabled:i.enabled,
                });
            } else {
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

    async getByCategory(category,lang,advanced_data=false){
        const c_list = await this.getAll(lang,advanced_data);
        if (c_list.code!==200){
            return c_list;
        }

        let filtered = [];
        for (let i of c_list.msg){
            if (i.category==category){
                filtered.push(i);
            }
        }
        if (filtered.length === 0){
            return {msg:`Error : No article found with ${category} as category`,code:404};
        }

        return {msg :filtered,code:200};
    }

    async delete(){
        const result = await deleteArticleDB(this.title,this.category);
        if (result.code===404){
            return {msg:`Error : Article not found`,code:404};
        }
        if (result.code===500){
            return db_error;
        }
    }

    async modify(title, category, content, enabled, prev_title, prev_category = category){
        const exist = await verifyArticleDB(prev_title,prev_category);
        if (exist.code===500){return db_error;};
        if (exist.data===false){
            return {msg:`Error : Can't modify article. This article doesn't exist.`,code:404};
        }
    
        const result_obj = updateArticle(title,category,content,enabled, prev_title);
        if (result_obj.code===500){return db_error;}
        
        return {msg:"Article updated successfully",code:200};
    }

}

module.exports = Article;