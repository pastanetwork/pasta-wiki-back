import { fetchData, updateLang } from "/public/global.js";

let users_data = []

async function refreshData(){
    const users_data_fetch = await fetchData("/api/v1/users/get-infos/advanced");
    if (users_data_fetch.code!==200){
        return
    }
    users_data=users_data_fetch.msg;
    const user_list_section=document.getElementById("users-list");

    let dom =""
    for (let el of users_data){
        dom+=`<h2>${el.username}</h2><hr><p>${el.email} | ${el.role} | ${converTime(el.created_at)} | <input type="checkbox" ${el.definitive ? "checked" : ""}> | <input type="checkbox" ${el.approved ? "checked" : ""}> |`;
    }
    user_list_section.innerHTML=dom;
    updateLang();
}

function converTime(val){
    const months = ["january","february","march","april","may","june","july","august","september","october","november","december"]
    const val_split = val.split("-");
    const year = val_split[0];
    const month_int = val_split[1]
    const split_T = val_split[2].split("T");
    const day = split_T[0];
    const hours = split_T[1].split(".")[0]
    return `${day} <span data-traduction="utils.months.${months[month_int-1]}"></span> ${year} <span data-traduction="profil.account.at">at</span> ${hours}`
}

await refreshData();