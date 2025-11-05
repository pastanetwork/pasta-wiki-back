import { fetchData } from "/public/global.js"

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
    category: "",
    title: "",
    prev_title: "",
    prev_category: "",
    content: "",
    enabled: true
};

async function refreshData() {
    articles_list = await fetchData("/api/v1/articles/all");
    categories_list = await fetchData("/api/v1/categories/all");
    await refreshArticle();
    await refreshCategories();
}
await refreshData();

async function refreshArticle(){
    for (let el of articles_list.data){
        if ((urlParams.get('category') === el.category_urlized) && (urlParams.get('article') === el.title_urlized)) {
            editor.value=el.content;
            category_title.innerText=el.category;
            article_title.innerText=el.title;
            article_vals.category=el.category;
            article_vals.title=el.title;
            article_vals.prev_title=el.title;
            article_vals.prev_category=el.category;
            article_vals.content=el.content;
            article_vals.enabled=el.enabled;
        }
    }
    if (article_vals.title ===""){
        window.location.replace("/dashboard/articles");
    }
}

async function refreshCategories(){
    let select_assign_category_dom=`<option value="none" ${article_vals.category==="none" ? "selected" : ""}>none</option>\n`
    for (let el of categories_list.data){
        select_assign_category_dom+=`<option value="${el.title}" ${article_vals.category===el.title ? "selected" : ""}>${el.title}</option>\n`
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
    if (article_vals.category=="" || article_vals.title==""||article_vals.prev_title==""||article_vals.content==""){
        return
    }
    const url="/api/v1/articles/modify"
    const options={method:"PUT",headers: { "Content-Type": "application/json" },body:JSON.stringify(article_vals)}
    const response = await fetch(url,options)
}

send_new_category_and_title.addEventListener("click",async function(){
    await updateArticleCategoryAndTitle();
})

async function updateArticleCategoryAndTitle(){
    const prev_category = article_vals.category;
    const prev_title = article_vals.title;

    const new_category = select_assign_category.value;
    const new_title = new_title_input.value;

    let category_exist = false
    for (let el of categories_list.data){
        if (el.title===new_category){
            category_exist=true
        }
    }
    if (new_category==="none"){
        category_exist=true;
    }
    if (!category_exist){
        return
    }
    article_vals.prev_category=prev_category;
    article_vals.prev_title=prev_title;

    article_vals.category = new_category;
    if (new_title!==""){
        article_vals.title = new_title;
    }

    console.log(article_vals)

    //const update_response = await sendPostUpdate();
    await sendPostUpdate();
    window.location.replace(`/dashboard/articles/edit?category=${URLize(article_vals.category)}&article=${URLize(article_vals.title)}`);

}

function URLize(input){
    return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_")
}