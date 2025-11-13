import { fetchData, updateLang } from '/public/global.js';

const display_username = document.getElementById("profil-username");
const display_email = document.getElementById("profil-email");
const display_creation_time = document.getElementById("profil-created-at");
const display_role = document.getElementById("profil-role");

const edit_username_input = document.getElementById("profil-edit-username");
const edit_email_input = document.getElementById("profil-edit-email");
const edit_password_input = document.getElementById("profil-edit-password");
const edit_password_confirm_input = document.getElementById("profil-edit-password-confirm");
const send_profil_modif_btn = document.getElementById("send-profil-modif");
const profil_modif_log = document.getElementById("profil-modif-log");

let user_data = {
    username:"",
    prev_username:"",
    email:"",
    prev_email:"",
    password:""
};

async function refreshData(){
    const user_data_result = await fetchData("/api/v1/users/get-infos");
    const connection_logs = await fetchData("/api/v1/users/get-connect-logs");
    if (user_data_result.code!==200 || connection_logs.code!==200){
        return
    }

    const userdata = user_data_result.msg

    display_username.innerText = userdata.username;
    display_email.innerText = userdata.email;
    display_creation_time.innerHTML = converTime(userdata.created_at);
    display_role.innerText = userdata.role;
    edit_username_input.value=userdata.username;
    edit_email_input.value=userdata.email;

    user_data.prev_username = userdata.username;
    user_data.prev_email = userdata.email;

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

async function sendProfilModification(){
    const new_username=edit_username_input.value;
    const new_email=edit_email_input.value;
    const new_password=edit_password_input.value;
    const confirm_new_password=edit_password_confirm_input.value;

    let abort = false;

    if (new_username.length<=4){
        profil_modif_log.dataset.traduction="profil.edit.username_length";
        abort=true;
    }
    if (new_email.length <= 0){
        profil_modif_log.dataset.traduction="profil.edit.email_empty";
        abort=true;
    }
    if (new_password !== confirm_new_password){
        profil_modif_log.dataset.traduction="profil.edit.passwords_not_match";
        abort=true;
    }
    updateLang();
    if (abort){
        return
    }

    user_data.username=URLize(new_username);
    user_data.email=new_email;
    user_data.password=new_password;

    try{
        const update_response = await fetch("/api/v1/users/modify",{
            method: "PUT", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username:user_data.username,
                email:user_data.email,
                password:user_data.password
            })
        })
        if (update_response.ok){
            refreshData();
            profil_modif_log.dataset.traduction="profil.edit.log_updated_ok"
            updateLang();
        }
    } catch (error){
        profil_modif_log.innerText=error;
    }
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

function URLize(input){
  return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_")
}

await refreshData();
updateLang()

send_profil_modif_btn.addEventListener("click",async function(){
    await sendProfilModification();
})