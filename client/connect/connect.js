let act_step = "login";
const login_input_email = document.getElementById("email");
const login_input_password = document.getElementById("password");
const login_input_password_confirm = document.getElementById("password-confirm");
const login_label_password_confirm = document.getElementById("password-confirm-label");
const login_input_send = document.getElementById("connect-send");

let login_vals = {
    email: login_input_email.value,
    password: login_input_password.value,
};

let code_2fa ="";

login_input_email.addEventListener("input", function () {
    login_vals.email = this.value;
});

login_input_password.addEventListener("input", function () {
    login_vals.password = this.value;
});

login_input_send.addEventListener("click", function () {
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
            body: JSON.stringify(login_vals),
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
            window.location.replace("/dashboard");
        }
        login_input_password.value = "";
    }
}

function confirm(){
    switch(act_step){
            case "login":sendLogin();
            break;

            case "register":;
            break;
        }
}

document.addEventListener('keydown', (event)=> {    
    if (event.key == "Enter"){
        confirm();
    };
});

function updateStep(){

    const connect_title= document.getElementById("connect-title");

    switch(act_step){
            case "login":
                connect_title.dataset.traduction="connect.login";
                login_input_password_confirm.style.display="none";
                login_label_password_confirm.style.display="none";
            break;

            case "register":
                connect_title.dataset.traduction="connect.register";
                login_input_password_confirm.style.display="inline";
                login_label_password_confirm.style.display="inline";
            break;
        }
}
updateStep()