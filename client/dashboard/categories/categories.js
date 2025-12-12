import { fetchData, updateLang } from "/public/global.js"

const category_list_holder = document.getElementById("categories-list-holder");
const new_category_lang_selector = document.getElementById("categories-upper-comp-toolbar-new-category-lang");

const refresh_btn = document.getElementById("categories-list-refresh");
const search_input = document.getElementById("categories-list-search-input");

const icons = {
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>`,
    pen: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg>`
}

let langs_list = "";
let categories_data = "";
async function refreshData(){
    await refreshLangs();
    await refreshCategories();
    updateLang();
}
await refreshData();

async function refreshLangs() {
    langs_list = await fetchData("/api/v1/categories/get-langs");
    new_category_lang_selector.innerHTML=`<option value="default" selected disabled data-traduction="dashboard.categories.select_lang">Select lang</option>`;
    for (let el of langs_list.data){
        new_category_lang_selector.innerHTML+=`<option value="${el.lang.code}">${el.lang.name} (${el.lang.code})</option>`
    }
}

async function refreshCategories(){
    categories_data = await fetchData("/api/v1/categories/all");
    category_list_holder.innerHTML = "";
    for (let i of categories_data.data) {
        const tr_tag = document.createElement("tr");
        tr_tag.classList.add("category-data-holder");
        category_list_holder.appendChild(tr_tag);
        tr_tag._categoryData = i;
        const dom = `
            <td>
                <a href="https://pastanetwork.com/wiki/${i.lang}/${i.title_urlized}" target="_blank">${i.title}</a>
            </td>
            <td><select data-type="select">
                </select>
            </td>
            <td>${i.articles_nb}</td>
            <td><a href="/dashboard/categories/edit?category=${i.title_urlized}&lang=${i.lang}">${icons.pen}</a></td>
            <td><button data-type="delete">${icons.trash}</button></td>
            <td><input data-type="enabled" type="checkbox" ${i.enabled ? "checked" : ""} class="category-enabled-checkbox"></td>
        `;
        tr_tag.innerHTML = dom;
    }

    const table_data_list = document.querySelectorAll(".category-data-holder");
    for (let i of table_data_list) {
        for (let j of i.children) {
            for (let el of j.children) {
                switch (el.dataset?.type) {
                    case "delete":
                        deleteButton(el, i._categoryData);
                        break;
                    case "enabled": 
                        enabledButton(el, i._categoryData);
                        break;
                    case "select":
                        selectLang(el, i._categoryData);
                        break;
                }
            }
        }
    }
}
const new_category_title_input = document.getElementById("categories-upper-comp-toolbar-new-category-title");
const new_category_send_btn =  document.getElementById("categories-upper-comp-toolbar-new-category-send");

new_category_send_btn.addEventListener("click",async function(){
    const response = await createNewcategory();
    if (response.ok){
        await refreshData();
        new_category_title_input.value="";
    } 
});

async function createNewcategory() {
    const lang = new_category_lang_selector.value;
    if (lang==="default"){
        return {ok:false}
    }
    let lang_exist = false;
    for (let el of langs_list.data){
        if (el.lang.code === lang ){
            lang_exist = true;
        }
    }
    if (!lang_exist){
        return {ok:false}
    }
    const title = new_category_title_input.value;
    if (title.trim() === "") {
        new_category_title_input.value="";
        return {ok:false}
    }
    const sent_values = {
        title: title,
        lang: lang,
        enabled: false,
    };
    await fetchRequest("POST", "/api/v1/categories/publish", sent_values);
    return {ok:true}
}

async function deleteButton(el, category) {
    el.addEventListener("click", async function() {
        const sent_values = {
            title: category.title,
            lang: category.lang,
        };
        setAlertOpened(true,`
        <fieldset id="category-list-alert-delete">
            <h2 data-traduction="alert.title.confirm_action">Confirm action</h2>
            <hr>
            <br>
            <p data-traduction="alert.delete.msg.are_u_sure_u_want_to_del">Are you sure you want to delete :</p>
            <br>
            <h3>${category.title}</h3>
            <br>
            <p><span data-traduction="alert.delete.msg.action_will_delete">This action will delete</span> ${category.title} <span data-traduction="alert.delete.msg.permanently">permanently.</span></p>
            <br>
            <input type="checkbox" name="agreement" id="category-list-alert-agree">
            <label for="agreement"><code data-traduction="article.alert.confirm_agree">I understand this action is irreversible and can't be undone.</code></label>
            <br>
            <br>
            <div id="category-list-alert-btn-holder">
                <button id="category-list-alert-undo"><h3 data-traduction="alert.button.undo">Undo</h3></button>
                <button id="category-list-alert-confirm"><h3 data-traduction="alert.button.confirm">Confirm</h3></button>
            </div>
        </fieldset>
        `);

        document.getElementById("category-list-alert-confirm").addEventListener("click",async function(){
            if (document.getElementById("category-list-alert-agree").checked){
                await fetchRequest("PUT", "/api/v1/categories/delete", sent_values);
                await refreshData();
                setAlertOpened(false,"");
            }
        });
        document.getElementById("category-list-alert-undo").addEventListener("click",async function(){
            setAlertOpened(false,"");
        });
        
    });
}

async function enabledButton(el, category) {
    el.checked = category.enabled;
    
    el.addEventListener("click", async function() {
        const sent_values = {
            title: category.title,
            prev_title: category.title,
            lang: category.lang,
            enabled: el.checked
        };
        await fetchRequest("PUT", "/api/v1/categories/modify", sent_values);
        await refreshData();
    });
}

async function selectLang(el, category){
    let dom=""
    for (let i of langs_list.data){
        let selected=""
        if (category.lang===i.lang.code){
            selected="selected"
        }
        dom +=`<option value="${i.lang.code}" `+selected+`>${i.lang.name} (${i.lang.code})</option>\n`
    }
    el.innerHTML=dom

    el.addEventListener('change',async function(){
        const sent_values = {
            title: category.title,
            prev_title: category.title,
            lang: el.value,
            prev_lang: category.lang,
            enabled: category.enabled,
        };
        await fetchRequest("PUT", "/api/v1/categories/modify", sent_values);
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

const alert_div = document.getElementById("category-list-confirm");

function setAlertOpened(val,dom){
    if (val){
        alert_div.dataset.opened=true
        alert_div.innerHTML=dom
    } else {
        alert_div.dataset.opened=false
        alert_div.innerHTML=""
    }
    updateLang();
}

refresh_btn.addEventListener("click",async function(){
    await refreshData();
});

search_input.addEventListener("input",function(){
    const elements_list = document.querySelectorAll(".category-data-holder");
    const searched_value = search_input.value;
    for (let el of elements_list){
        if (searched_value===""){
            el.style.display="table-row"
        } else {
            if (minimise(el._categoryData.title).includes(minimise(searched_value))){
                el.style.display="table-row"
            } else {
                el.style.display="none"
            }
        }
    }
});

function minimise(input){
    return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}