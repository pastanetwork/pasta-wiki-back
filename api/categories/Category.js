const { getAllCategories, verifyCategoryDB, createCategory, updateCategory, getLangsDB, deleteCategoryDB, } = require("./sql_requests");
const Article = require("../articles/Article");

const db_error = {msg:`Error : Something went wrong with the database`,code:500};

class Category {
    constructor(data = {}) {
        this.title = data.title || "";
        this.lang = data.lang || "";
        this.enabled = data.enabled || false;
    }

    async get(lang="all",advanced_data=false){
        let select_lang=false;
        if (lang!="all"){
            select_lang=true;
        }
        const categories = await getAllCategories();
        if (categories.code!==200){
            return db_error;
        }

        let request_result=[];
        if (advanced_data){
            for (let i of categories.data){
            if (i.category_name !== "none"){
                request_result.push({
                    title:i.category_name,
                    title_urlized:URLize(i.category_name),
                    lang:i.lang_code,
                    articles_nb:i.article_count,
                    enabled:i.enabled,
                });
            }
        }
        } else {
            for (let i of categories.data){
                if (i.enabled && i.category_name !== "none"){
                    request_result.push({
                        title:i.category_name,
                        title_urlized:URLize(i.category_name),
                        lang:i.lang_code,
                        articles_nb:i.article_count,
                    });
                }
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

    async getLangs(){
        const langs_list = await getLangsDB();
        if (langs_list.code===500){return db_error;};
        let langs=[];
        for (let i of langs_list.data){
            if (i.lang_name !== "none"){
                langs.push ({
                    lang:{
                        name:i.lang_name,
                        code:i.lang_code,
                    }
                });
            }
        }
        return {code:langs_list.code,msg:langs}
    }
    
    async create(){
        const exist = await this.verify();
        if (exist.code===500){return db_error;};
        if (exist.data===true){
            return {msg:`Error : Can't create category. A category with this title and this lang already exist.`,code:403};
        }
    
        const result_obj = createCategory(this.title, this.lang, this.enabled);
        if (result_obj.code===500){return db_error;}
    
        return {msg:"Category created successfully",code:201}
    }

    async delete(){
        if (this.title==="none"){
            return {msg:`You can't delete this category.`,code:412};
        }
        const exist = await this.verify();
        if (exist.code===500){return db_error;};
        if (exist.data===false){
            return {msg:`Error : Can't delete category ${this.title}. This category doesn't exist.`,code:404};
        }

        const init = new Article({});
        const articles_list = await init.getByCategory(this.title,this.lang,true);
        if (articles_list.code===200){
            const promises = articles_list.msg.map(i => {
                const article_data = {
                    title: i.title,
                    category: {name:"none",lang:"none"},
                    content: i.content,
                    lang_code: i.lang,
                    enabled: i.enabled
                };
                
                const article = new Article(article_data);
                return article.modify(article_data.title,{name:i.category,lang:i.lang});
            });

            const results = await Promise.all(promises);
            const error = results.find(result => result.code !== 200);
            if (error) {
                console.error(error);
                return db_error;
            }
        }
        

        const delete_category = await deleteCategoryDB(this.title,this.lang);
        if (delete_category.code===200){
            return {msg:"Category deleted successfully",code:200}
        } else {
            return {msg:`Error : Category deletion failed. Please try again later`,code:503};
        };
    }

    async modify(prev_title,prev_lang){
        if (this.title==="none"){
            return {msg:`This category is not editable.`,code:412};
        }
        const old_data_exist = await this.verify(prev_title,prev_lang);
        if (old_data_exist.code===500){return db_error;};
        if (!old_data_exist.data){
            return {msg:`Error : Can't modify category. This category doesn't exist.`,code:404};
        }
        if ((prev_title !== this.title)||(prev_lang !== this.lang)){
            const new_data_exist = await this.verify(this.title,this.lang);
            if (new_data_exist.data){
                return {msg:`Error : Can't modify category. A category with this title in this lang already exist.`,code:403};
            }
        }

        const result_obj = updateCategory(this.title, this.lang, this.enabled, prev_title, prev_lang);
        if (result_obj.code===500){return db_error;}
        
        const init = new Article();
        const articles_list = await init.getByCategory(prev_title,prev_lang,true);
        if (articles_list.code===200){
            const promises = articles_list.msg.map(i => {
                const article_data = {
                    title: i.title,
                    category: {name:this.title,lang:this.lang},
                    content: i.content,
                    enabled: i.enabled
                };
                
                const article = new Article(article_data);
                return article.changeLang(i.lang);
            });

            const results = await Promise.all(promises);
            const error = results.find(result => result.code !== 200);
            if (error) {
                console.error(error);
                return db_error;
            }
        }

        return {msg:"Category updated successfully",code:200};
    }

    async verify(title=this.title,lang=this.lang){
        return await verifyCategoryDB(title,lang);
    }
}

module.exports = Category;