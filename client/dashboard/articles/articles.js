import { fetchData } from "/public/global.js"

const article_list_holder = document.getElementById("articles-list-holder");
const icons = {
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>`,
    pen: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg>`
}

async function refreshData() {
    article_list_holder.innerHTML = "";
    const articles_data = await fetchData("/api/v1/articles/all");

    for (let i of articles_data.data) {
        const tr_tag = document.createElement("tr");
        tr_tag.classList.add("article-data-holder");
        article_list_holder.appendChild(tr_tag);
        tr_tag._articleData = i;
        
        tr_tag.innerHTML = `
            <td>
                <a href="https://wiki.pastanetwork.com/${i.category_urlized}/${i.title_urlized}" target="_blank">${i.title}</a>
            </td>
            <td>${i.lang}</td>
            <td>${i.category}</td>
            <td><a href="/dashboard/articles/edit?category=${i.category_urlized}&article=${i.title_urlized}">${icons.pen}</a></td>
            <td><button data-type="delete">${icons.trash}</button></td>
            <td><input data-type="enabled" type="checkbox" ${i.enabled ? "checked" : ""} class="article-enabled-checkbox"></td>
        `;
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
                }
            }
        }
    }
}

await refreshData();

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
            <br><br>
            <input type="checkbox" name="agreement" id="article-list-alert-agree">
            <label for="agreement"><code>I understand this action is irreversible and can't be undone.</code></label>
            <br>
            <br>
            <div>
                <button id="article-list-alert-undo">Undo</button>
                <button id="article-list-alert-confirm">Confirm</button>
            </div>
        </fieldset>
        `);

        document.getElementById("article-list-alert-confirm").addEventListener("click",async function(){
            if (document.getElementById("article-list-alert-agree").checked){
                await fetchRequest("PUT", "/api/v1/articles/delete", sent_values);
                await refreshData();
                setAlertOpened(false,"")
            }
        });
        document.getElementById("article-list-alert-undo").addEventListener("click",async function(){
            setAlertOpened(false,"")
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
            content: article.content,
            enabled: el.checked,
        };
        await fetchRequest("PUT", "/api/v1/articles/modify", sent_values);
        await refreshData();
    });
}

async function fetchRequest(method, url, vals) {
    const options = {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vals)
    };
    const response = await fetch(url, options);
    if (!response.ok) {
        console.log("error delete");
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