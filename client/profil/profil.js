import { fetchData, updateLang } from '/public/global.js';

async function refreshData(){
    const result = await fetchData("/api/v1/users/get-infos");
    if (result.code!==200){
        return
    }
    const display_username = document.getElementById("profil-username");
    const display_email = document.getElementById("profil-email");
    const display_creation_time = document.getElementById("profil-created-at");
    const display_role = document.getElementById("profil-role");

    const userdata = result.msg

    display_username.innerText = userdata.username;
    display_email.innerText = userdata.email;
    display_creation_time.innerHTML = converTime(userdata.created_at);
    display_role.innerText = userdata.role;

    console.log(converTime(userdata.created_at))
}

await refreshData();

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

updateLang()