const login_input_email = document.getElementById("login-email");
const login_input_password = document.getElementById("login-password");
const login_input_send = document.getElementById("login-send");

let login_vals = {
    email: login_input_email.value,
    password: login_input_password.value,
};

login_input_email.addEventListener("input", function () {
    login_vals.email = this.value;
});

login_input_password.addEventListener("input", function () {
    login_vals.password = this.value;
});

login_input_send.addEventListener("click", function () {
    sendLogin();
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
        document.getElementById("login-log").innerText = result;
        if (valid){
            window.location.replace("/dashboard");
        }
        login_input_password.value = "";
    }
}

document.addEventListener('keydown', (event)=> {    
    if (event.key == "Enter"){
        sendLogin();
    };
});
