import { fetchData, updateLang } from '/public/global.js';

async function refreshData(){
    const user_data_result = await fetchData("/api/v1/users/get-infos");
    const connection_logs = await fetchData("/api/v1/users/get-connect-logs");
    if (user_data_result.code!==200 || connection_logs.code!==200){
        return
    }
    
    const display_username = document.getElementById("profil-username");
    const display_email = document.getElementById("profil-email");
    const display_creation_time = document.getElementById("profil-created-at");
    const display_role = document.getElementById("profil-role");

    const userdata = user_data_result.msg

    display_username.innerText = userdata.username;
    display_email.innerText = userdata.email;
    display_creation_time.innerHTML = converTime(userdata.created_at);
    display_role.innerText = userdata.role;

    const logs_tbody = document.getElementById("connect-log-tbody");
    logs_tbody.innerHTML="";
    
    for (let i of connection_logs.msg) {
        const tr_tag = document.createElement("tr");
        //tr_tag.classList.add("");
        logs_tbody.appendChild(tr_tag);
        tr_tag._articleData = i;
        const dom = `
            <td>${i.email}</td>
            <td>${i.user_agent}</td>
            <td>${i.ip}</td>
            <td>${converTime(i.date)}</td>
            <td>${i.status}</td>
        `;
        tr_tag.innerHTML = dom;
    }
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