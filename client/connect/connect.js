import { updateLang } from "/public/global.js";
let act_step = "login";
const input_username_label = document.getElementById("username-label");
const input_username = document.getElementById("username");

const input_email = document.getElementById("email");
const input_password = document.getElementById("password");

const input_password_confirm = document.getElementById("password-confirm");
const label_password_confirm = document.getElementById("password-confirm-label");

const input_send = document.getElementById("connect-send");

const switch_step_label = document.getElementById("switch-login-register-label");
const switch_step_btn = document.getElementById("switch-login-register");

const connect_form = document.getElementById("connect-form");
const two_factor_auth_form= document.getElementById("two-factor-auth-form");

const two_factor_auth_fieldset = document.getElementById("two-factor-auth-fieldset");
const two_factor_code_input = document.getElementById("two-factor-input-code");
const two_factor_code_send = document.getElementById("two-factor-send-code");
const two_factor_auth_log = document.getElementById("two-factor-auth-log");

let credentials = {
    email: input_email.value,
    password: input_password.value,
};

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('require2fa') === 'true') {
    act_step = "2fa";
    updateStep();
}

input_email.addEventListener("input", function () {
    credentials.email = this.value;
});

input_password.addEventListener("input", function () {
    credentials.password = this.value;
});

input_send.addEventListener("click", function () {
    confirm();
});

async function sendLogin(){
    let result = "";
    let valid = false;
    try {
        const response = await fetch("/api/v1/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        result = data.data;
        if (response.ok){
            valid = true;
        }
    } catch (error) {
        result = error.message;
    } finally {
        document.getElementById("connect-log").innerText = result;
        if (valid){
            act_step="2fa"
            updateStep()
        }
        input_password.value = "";
    }
}

async function sendRegister(){
    let result = "";
    let valid = false;
    try {
        const response = await fetch("/api/v1/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        result = data.data;
        if (response.ok){
            valid = true;
        }
    } catch (error) {
        result = error.message;
    } finally {
        document.getElementById("connect-log").innerText = result;
        if (valid){
            act_step="2fa"
            updateStep()
        }
        input_password.value = "";
    }
}

function confirm(){
    switch(act_step){
            case "login":sendLogin();
            break;

            case "register":sendRegister();
            break;
        }
}

document.addEventListener('keydown', (event)=> {    
    if (event.key == "Enter"){
        confirm();
    };
});

switch_step_btn.addEventListener("click",function(){
    if (act_step=="login"){
        act_step = "register"
    } else if (act_step=="register"){
        act_step = "login"
    }
    updateStep();
});

function updateStep(){

    const connect_title= document.getElementById("connect-title");
    switch(act_step){
        case "login":
            connect_title.dataset.traduction="connect.login";
            switch_step_label.dataset.traduction="connect.switch-to-register";
            switch_step_btn.dataset.traduction="connect.switch-to-register.link";
            input_password_confirm.style.display="none";
            label_password_confirm.style.display="none";
            input_username_label.style.display="none";
            input_username.style.display="none";

            two_factor_auth_form.style.display="none";
        break;

        case "register":
            connect_title.dataset.traduction="connect.register";
            switch_step_label.dataset.traduction="connect.switch-to-connect";
            switch_step_btn.dataset.traduction="connect.switch-to-connect.link";
            input_password_confirm.style.display="inline";
            label_password_confirm.style.display="inline";
            input_username_label.style.display="inline";
            input_username.style.display="inline";

            two_factor_auth_form.style.display="none";
        break;

        case "2fa":
            connect_form.style.display="none";
            two_factor_auth_form.style.display="inline";
            
            const qr_code_holder=document.getElementById("two-factor-qrcode-holder");

            const qrImg = document.createElement('img');
            qrImg.src = "/api/v1/users/qrcode-2fa";
            qrImg.alt = "QR Code for 2FA setup";
            
            qrImg.onerror = function() {
                window.location.replace("/connect");
            };
            qr_code_holder.innerHTML='';
            qr_code_holder.appendChild(qrImg);
        break;
    }
    updateLang();
}
updateStep();

two_factor_code_send.addEventListener("click",function(){
    send2FACode();
});

async function send2FACode(){
    let result = "";
    let valid = false;
    let code = two_factor_code_input.value;
    if (!/^\d{6}$/.test(code) || !/^\d+$/.test(code)){
        two_factor_code_input.value="";
        result='Not a valid verif code'
        two_factor_auth_log.innerText=result;
        return
    }
    try {
        const response = await fetch("/api/v1/users/verify-code-2fa", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({code:code}),
        });

        const data = await response.json();
        result = data.data;
        if (response.ok){
            valid = true;
        }
    } catch (error) {
        result = error.message;
    } finally {
        two_factor_code_input.value="";
        two_factor_auth_log.innerText=result;
        if (valid){
            window.location.replace("/dashboard");
        }
    }
}