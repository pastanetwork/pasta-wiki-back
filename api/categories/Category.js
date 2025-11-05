const { getAllCategories, verifyCategoryDB, createCategory, updateCategory, getLangsDB, deleteCategoryDB, } = require("./sql_requests");
const Article = require("../articles/Article");

class Category {
    constructor(data = {}) {
        this.title = data.title || "";
        this.lang = data.lang || "";
        
    }

    get(category_name=this.category_name){

    }
    
    getAll(lang="all"){

    }

    getArticle(article_name="all"){

    }

    async modify(){

    }

    async delete(){
        if (this.title==="none"){
            return {msg:`You can't delete this category.`,code:412};
        }
        const exist = await verifyCategoryDB(this.title,this.lang);
        if (exist.code===500){return db_error;};
        if (exist.data===false){
            return {msg:`Error : Can't delete category ${this.title}. This category doesn't exist.`,code:404};
        }

        const init = new Article({});
        const articles_list = await init.getByCategory(this.title,this.lang,true);
        if (articles_list.code===200){
            for (let i of articles_list.msg){
                const article_data = {
                    title : i.title,
                    category : i.category,
                    content : i.content,
                    lang_code : i.lang,
                    enabled : i.enabled
                }
                const article = new Article(article_data);
                const result = await article.modify(article_data.title,"none",article_data.content,article_data.enabled,article_data.title,article_data.category)
                if (result.code!==200){
                    return result
                }
            }
        }
        

        const delete_category = await deleteCategoryDB(this.title,this.lang);
        if (delete_category.code===200){
            return {msg:"Category deleted successfully",code:200}
        } else {
            return {msg:`Error : Category deletion failed. Please try again later`,code:503};
        };
    }
}

module.exports = Category;