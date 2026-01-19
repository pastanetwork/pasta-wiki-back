const { createArticle, updateArticle, changeArticleLang, deleteArticleDB } = require("./sql_requests");
const { URLize } = require("../../express_utils/utils");

const db_error = {msg:`Error : Something went wrong with the database`,code:500};

class Article {
    constructor(data = {}) {
        this.title = data.title || "How to cook farfalle pasta al dente ?";
        this.category = data.category || {name:"Cooking pasta like a chief",lang:"en_us"};
        this.content = data.content || "";
        this.enabled = data.enabled || false;
    }

    async getAll(lang="all",advanced_data=false){

        const { getAllArticles } = require("./sql_requests");

        const select_lang = lang!="all"
        const articles = await getAllArticles();

        if (articles.code!==200){
            return {msg:`Error : Something went wrong with the database`,code:500};
        }

        let request_result=[];

        for (let i of articles.data){

            if (advanced_data){
                // Authorized data access
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
                // Public data access
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

        const result = select_lang ? request_result.filter(item => item.lang === lang) : request_result;

        if (select_lang && result.length===0){
            return {msg:`Error : No article found${ select_lang ? " with " + lang + " as language" : ""}`+".",code:404};
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

    async create(){
        const exist = await this.verify();
        if (exist.code===500){return db_error};
        if (exist.data){
            return {msg:`Error : Can't create article. An article with this title in this category already exist.`,code:403};
        }
    
        const result_obj = createArticle(this.title, this.category.name, this.category.lang, this.content, this.enabled);
        if (result_obj.code===500){return db_error;}
    
        return {msg:"Article created successfully",code:201};
    }

    async delete(){
        const result = await deleteArticleDB(this.title,this.category);
        if (result.code===404){
            return {msg:`Error : Article not found`,code:404};
        }
        if (result.code===500){
            return db_error;
        }
        return {msg:"Article deleted successfully",code:200};
    }

    async modify(prev_title = this.title, prev_category = this.category){
        const old_data_exist = await this.verify(prev_title,prev_category);
        if (old_data_exist.code===500){return db_error;};
        if (!old_data_exist.data){
            return {msg:`Error : Can't modify article. This article doesn't exist.`,code:404};
        }


        if ((prev_title !== this.title)||(prev_category.name !== this.category.name) && (prev_category.lang !== this.category.lang)){
            const new_data_exist = await this.verify(this.title,this.category);
            if (new_data_exist.data){
                return {msg:`Error : Can't modify article. An article with this title in this category already exist.`,code:403};
            }
        }
        
        const result_obj = await updateArticle(this.title,this.category,this.content,this.enabled, prev_title, prev_category);
        if (result_obj.code===500){return db_error};
        
        return {msg:"Article updated successfully",code:200};
    }

    async changeLang(old_lang){
        const result = await changeArticleLang(old_lang,this.category,this.title);
        return result    
    }

    async verify(title=this.title,category=this.category){
        const { verifyArticleDB } = require("./sql_requests");
        return await verifyArticleDB(title, category.name, category.lang);
    }
}

module.exports = Article;