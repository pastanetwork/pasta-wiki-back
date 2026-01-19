import { fetchData, updateLang } from "/public/global.js"

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

const category_title = document.getElementById("article-edit-category");
const article_title = document.getElementById("article-edit-title");

const select_assign_category = document.getElementById("article-edit-select-category");
const new_title_input = document.getElementById("article-edit-new-title-input")
const send_new_category_and_title = document.getElementById("article-edit-send-modify");

let articles_list;
let categories_list;
const urlParams = new URLSearchParams(window.location.search);

let article_vals = {
    category: {name:"",lang:""},
    title: "",
    prev_title: "",
    prev_category: {name:"",lang:""},
    content: "",
    enabled: true
};

async function refreshData() {
    articles_list = await fetchData("/api/v1/articles/all");
    categories_list = await fetchData("/api/v1/categories/all");
    refreshArticle();
    refreshCategories();
}
await refreshData();
function refreshArticle(){
    for (let el of articles_list.data){
        if ((urlParams.get('category') === el.category_urlized) && (urlParams.get('article') === el.title_urlized)) {
            editor.value=el.content;
            category_title.innerText=el.category;
            article_title.innerText=el.title;
            article_vals.category.name=el.category;
            article_vals.category.lang=el.lang;
            article_vals.title=el.title;
            article_vals.prev_title=el.title;
            article_vals.prev_category.name=el.category;
            article_vals.prev_category.lang=el.lang;
            article_vals.content=el.content;
            article_vals.enabled=el.enabled;
        }
    }
    if (article_vals.title ===""){
        window.location.replace("/dashboard/articles");
    }
}

function refreshCategories(){
    let select_assign_category_dom=`<option value="none" ${article_vals.category.name==="none" ? "selected" : ""}>none</option>\n`
    for (let el of categories_list.data){
        select_assign_category_dom+=`<option value="${el.title}" ${( article_vals.category.name===el.title ) && (article_vals.category.lang===el.lang) ? "selected" : ""}>${el.title} (${el.lang})</option>\n`
    }
    select_assign_category.innerHTML=select_assign_category_dom;
}

function updatePreview() {
    preview.innerHTML = marked.parse(editor.value);
    article_vals.content=editor.value;
    sendPostUpdate();

}
editor.addEventListener('input', updatePreview);

updatePreview();

async function sendPostUpdate(){
    console.log(article_vals)
    if (article_vals.category.name=="" || article_vals.title==""||article_vals.prev_title==""){
        return
    }
    const url="/api/v1/articles/modify"
    const options={method:"PUT",headers: { "Content-Type": "application/json" },body:JSON.stringify(article_vals)}
    const response = await fetch(url,options)
    console.log(response)
}

send_new_category_and_title.addEventListener("click",async function(){
    await updateArticleCategoryAndTitle();
})

async function updateArticleCategoryAndTitle(){
    cons
    const prev_category = { name: article_vals.category.name, lang: article_vals.category.lang };
    const prev_title = article_vals.title;

    const new_category = { name: select_assign_category.value };
    const new_title = new_title_input.value;

    let category_exist = false
    for (let el of categories_list.data){
        if (el.title===new_category.name){
            category_exist=true
        }
    }
    if (new_category==="none"){
        category_exist=true;
    }
    if (!category_exist){
        return
    }
    article_vals.prev_category.name=prev_category.name;
    article_vals.prev_category.lang=prev_category.lang;
    article_vals.prev_title=prev_title;

    article_vals.category.name = new_category.name;
    if (new_title!==""){
        article_vals.title = new_title;
    }
    await sendPostUpdate();
    //window.location.replace(`/dashboard/articles/edit?category=${URLize(article_vals.category.name)}&article=${URLize(article_vals.title)}`);

}

function URLize(input){
    return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_")
}