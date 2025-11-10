import { fetchData, updateLang } from "/public/global.js"

const category_title_el=document.getElementById("category-edit-title");
const category_lang_el=document.getElementById("category-edit-lang");

const category_lang_select=document.getElementById("category-edit-select-lang");
const category_new_title_input = document.getElementById("category-edit-new-title-input");
const send_category_modification = document.getElementById("category-edit-send-modify");

let articles_list;
let categories_list;
let langs_list;
const urlParams = new URLSearchParams(window.location.search);
let act_category = "";

async function refreshData() {
    articles_list = await fetchData("/api/v1/articles/all");
    categories_list = await fetchData("/api/v1/categories/all");
    langs_list = await fetchData("/api/v1/categories/get-langs");
    refreshCategory();
    refreshLangs();
}
await refreshData();
await updateLang();
function refreshCategory(){
    for (let el of categories_list.data){
        if (urlParams.get("category")===el.title_urlized &&urlParams.get("lang") === el.lang ){
            act_category=el;
        }
    }
    if (act_category===""){
        window.location.replace("/dashboard/categories");
        return
    }
    category_title_el.innerText=act_category.title;
    category_lang_el.innerText=act_category.lang;
}

function refreshLangs() {
    const category_none = (act_category.lang === "none") ? "selected" : "";
    category_lang_select.innerHTML=`<option value="default" ${category_none} disabled data-traduction="dashboard.categories.select_lang">Select lang</option>`;
    for (let el of langs_list.data){
        const lang_selected = (act_category.lang === el.lang.code) ? "selected" : ""
        category_lang_select.innerHTML+=`<option value="${el.lang.code}" ${lang_selected}>${el.lang.name} (${el.lang.code})</option>`
    }
}




send_category_modification.addEventListener("click",async function(){
    await sendCategoryUpdate();
})

async function sendCategoryUpdate(){
    const new_lang = category_lang_select.value;
    const new_title = category_new_title_input.value;
    if (new_lang ==="default" || new_title===""){
        return
    }
    const sent_values = {
        title: new_title,
        prev_title: act_category.title,
        lang: new_lang,
        prev_lang: act_category.lang,
        enabled: act_category.enabled,
    };
    await fetchRequest("PUT","/api/v1/categories/modify",sent_values);
    window.location.replace(`/dashboard/categories/edit?category=${URLize(new_title)}&lang=${URLize(new_lang)}`);
}

async function fetchRequest(method, url, vals) {
    const options = {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vals)
    };
    try{
        const response = await fetch(url, options);
        if (!response.ok) {
            console.log(response)
        }
    } catch (error){
        console.log(error)
    }
}


function URLize(input){
    return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_")
}