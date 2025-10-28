import { fetchData } from "/public/global.js"

const article_list_holder = document.getElementById("articles-list-holder");
const new_article_category_selector = document.getElementById("articles-upper-comp-toolbar-new-article-category");

const icons = {
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>`,
    pen: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg>`
}

let category_list = "";
let articles_data = "";
async function refreshData() {
    refreshCategory();
    refreshArticles();
}
await refreshData();

async function refreshCategory() {
    category_list = await fetchData("/api/v1/categories/all");
    new_article_category_selector.innerHTML=`<option value="default" selected disabled>Select category</option>`;
    for (let el of category_list.data){
        new_article_category_selector.innerHTML+=`<option value="${el.title}">${el.title} (${el.lang})</option>`
    }

}

async function refreshArticles(){
    articles_data = await fetchData("/api/v1/articles/all");
    article_list_holder.innerHTML = "";
    for (let i of articles_data.data) {
        const tr_tag = document.createElement("tr");
        tr_tag.classList.add("article-data-holder");
        article_list_holder.appendChild(tr_tag);
        tr_tag._articleData = i;
        const dom = `
            <td>
                <a href="https://wiki.pastanetwork.com/${i.category_urlized}/${i.title_urlized}" target="_blank">${i.title}</a>
            </td>
            <td>${i.lang}</td>
            <td>
                <select data-type="select">
                </select>
            </td>
            <td><a href="/dashboard/articles/edit?category=${i.category_urlized}&article=${i.title_urlized}">${icons.pen}</a></td>
            <td><button data-type="delete">${icons.trash}</button></td>
            <td><input data-type="enabled" type="checkbox" ${i.enabled ? "checked" : ""} class="article-enabled-checkbox"></td>
        `;
        tr_tag.innerHTML = dom;
    }

    const table_data_list = document.querySelectorAll(".article-data-holder");
    for (let i of table_data_list) {
        for (let j of i.children) {
            for (let el of j.children) {
                switch (el.dataset?.type) {
                    case "delete":
                        deleteButton(el, i._articleData);
                        break;
                    case "enabled": 
                        enabledButton(el, i._articleData);
                        break;
                    case "select":
                        selectCategory(el, i._articleData);
                        break;
                }
            }
        }
    }
}

const new_article_category_select = document.getElementById("articles-upper-comp-toolbar-new-article-category");
const new_article_title_input = document.getElementById("articles-upper-comp-toolbar-new-article-title");
const new_article_send_btn =  document.getElementById("articles-upper-comp-toolbar-new-article-send");

new_article_send_btn.addEventListener("click",async function(){
    const response = await createNewArticle();
    if (response.ok){
        await refreshData();
        new_article_title_input.value="";
    } 
});

async function createNewArticle() {
    const category = new_article_category_select.value;
    if (category==="default"){
        return {ok:false}
    }
    let category_exist = false;
    for (let el of category_list.data){
        if (el.title === category ){
            category_exist = true;
        }
    }
    if (!category_exist){
        return {ok:false}
    }
    const title = new_article_title_input.value;
    if (title.trim() === "") {
        new_article_title_input.value="";
        return {ok:false}
    }
    const sent_values = {
        category: category,
        title: title,
        content: "",
        enabled: false,
    };
    await fetchRequest("POST", "/api/v1/articles/publish", sent_values);
    return {ok:true}
}

async function deleteButton(el, article) {
    el.addEventListener("click", async function() {
        const sent_values = {
            category: article.category,
            title: article.title,
        };
        setAlertOpened(true,`
        <fieldset id="article-list-alert-delete">
            <h2>Confirm action</h2>
            <hr>
            <br>
            <p>Are you sure you want to delete :</p>
            <br>
            <h3>${article.title}</h3>
            <br>
            <p>This action will delete ${article.title} permanently.<p>
            <br>
            <input type="checkbox" name="agreement" id="article-list-alert-agree">
            <label for="agreement"><code>I understand this action is irreversible and can't be undone.</code></label>
            <br>
            <br>
            <div id="article-list-alert-btn-holder">
                <button id="article-list-alert-undo"><h3>Undo</h3></button>
                <button id="article-list-alert-confirm"><h3>Confirm</h3></button>
            </div>
        </fieldset>
        `);

        document.getElementById("article-list-alert-confirm").addEventListener("click",async function(){
            if (document.getElementById("article-list-alert-agree").checked){
                await fetchRequest("PUT", "/api/v1/articles/delete", sent_values);
                await refreshData();
                setAlertOpened(false,"");
            }
        });
        document.getElementById("article-list-alert-undo").addEventListener("click",async function(){
            setAlertOpened(false,"");
        });
        
    });
}

async function enabledButton(el, article) {
    el.checked = article.enabled;
    
    el.addEventListener("click", async function() {
        const sent_values = {
            category: article.category,
            title: article.title,
            prev_title: article.title,
            prev_category:article.category,
            content: article.content,
            enabled: el.checked,
        };
        await fetchRequest("PUT", "/api/v1/articles/modify", sent_values);
        await refreshData();
    });
}

async function selectCategory(el, article){
    let dom=""
    for (let i of category_list.data){
        let selected=""
        if (article.category===i.title){
            selected="selected"
        }
        dom +=`<option value="${i.title}" `+selected+`>${i.title}</option>\n`
    }
    el.innerHTML=dom

    el.addEventListener('change',async function(){
        const sent_values = {
            category: el.value,
            prev_category:article.category,
            title: article.title,
            prev_title: article.title,
            content: article.content,
            enabled: article.enabled,
        };
        await fetchRequest("PUT", "/api/v1/articles/modify", sent_values);
        await refreshData();
    })
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

const alert_div = document.getElementById("article-list-confirm");

function setAlertOpened(val,dom){
    if (val){
        alert_div.dataset.opened=true
        alert_div.innerHTML=dom
    } else {
        alert_div.dataset.opened=false
        alert_div.innerHTML=""
    }
}