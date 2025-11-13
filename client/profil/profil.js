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
    password:"",
    code_2fa:"",
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

    user_data.prev_username = userdata.username;
    user_data.prev_email = userdata.email;

    const logs_tbody = document.getElementById("connect-log-tbody");
    logs_tbody.innerHTML="";
    
    const sorted_list = connection_logs.msg.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    for (let i of sorted_list) {
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
                password:user_data.password,
                code_2fa:user_data.code_2fa,
            })
        })
        if (update_response.ok){
            refreshData();
            profil_modif_log.dataset.traduction="profil.edit.log_updated_ok"
            updateLang();
        }
    } catch (error){
        profil_modif_log.innerText=error;
    } finally {
        user_data.username="";
        user_data.email="";
        user_data.password="";
    }
}

const alert_div = document.getElementById("profil-modif-confirm");

function setAlertOpened(val,dom){
    if (val){
        alert_div.dataset.opened=true
        alert_div.innerHTML=dom
    } else {
        alert_div.dataset.opened=false
        alert_div.innerHTML=""
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
    setAlertOpened(true,`
        <fieldset id="profil-modif-alert">
            <h2>Confirm action</h2>
            <hr>
            <br>
            <label for="verify2fa-code">Open your 2FA application and confirm the provided code</label>
            <br>
            <br>
            <input type="number" min="0" max="999999" name="verify2fa-code" id="profil-modif-alert-2fa-code">
            <br>
            <br>
            <div id="profil-modif-alert-btn-holder">
                <button id="profil-modif-alert-undo-btn"><h3>Undo</h3></button>
                <button id="profil-modif-alert-confirm-btn"><h3>Confirm</h3></button>
            </div>
        </fieldset>
    `);
    
    const undo_action = document.getElementById("profil-modif-alert-undo-btn");
    const confirm_action= document.getElementById("profil-modif-alert-confirm-btn");
    const code_2fa_input= document.getElementById("profil-modif-alert-2fa-code");

    undo_action.addEventListener("click",function(){
        setAlertOpened(false,"")
    })

    confirm_action.addEventListener("click",async function(){
        if (code_2fa_input.value===""){
            return
        }
        user_data.code_2fa=code_2fa_input.value;
        await sendProfilModification();
        setAlertOpened(false,"");
        user_data.code_2fa="";
    })
})