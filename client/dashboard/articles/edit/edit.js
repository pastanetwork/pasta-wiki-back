import { fetchData } from "/public/global.js"

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

const category_title = document.getElementById("article-edit-category");
const article_title = document.getElementById("article-edit-title");

const articles_list = await fetchData("/api/v1/articles/all")
const urlParams = new URLSearchParams(window.location.search);

let article_vals = {
    category: "",
    title: "",
    prev_title: "",
    content: "",
    enabled: true
};

for (let el of articles_list.data){
    console.log(urlParams.get('category'),"|",el.category_urlized,"|",urlParams.get("article"),"|",el.title_urlized )
    if ((urlParams.get('category') === el.category_urlized) && (urlParams.get('article') === el.title_urlized)) {
        editor.value=el.content;
        category_title.innerText=el.category;
        article_title.innerText=el.title;
        article_vals.category=el.category;
        article_vals.title=el.title;
        article_vals.prev_title=el.title;
        article_vals.content=el.content
    }
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