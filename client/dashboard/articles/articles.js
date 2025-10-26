import { fetchData } from "/public/global.js"

const article_list_holder = document.getElementById("articles-list-holder");

async function refreshData(){
    const articles_data = await fetchData("/api/v1/articles/all");
    for (let i of articles_data.data){
    article_list_holder.innerHTML+=`
        <tr>
            <td>
                <a href="https://wiki.pastanetwork.com/${i.category_urlized}/${i.title_urlized}" target="_blank">${i.title}</a>
            </td>
            <td>${i.lang}</td>
            <td>${i.category}</td>
            <td><a href="/dashboard/articles/edit?category=${i.category_urlized}&article=${i.title_urlized}">Edit article</a></td>
            <td><button>Delete</button></td>
            <td><input type="checkbox"></td>
        </tr>
        `
    }
}

refreshData();