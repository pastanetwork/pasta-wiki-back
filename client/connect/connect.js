//REGISTER INPUTS / BUTTONS
const register_input_username = document.getElementById("register-username");
const register_input_email = document.getElementById("register-email");
const register_input_password = document.getElementById("register-password");
const register_input_send = document.getElementById("register-send");

let register_vals = {
    username:"",
    email:"",
    password:"",
}

register_input_username.addEventListener("input",function(){register_vals.username=this.value});
register_input_email.addEventListener("input",function(){register_vals.email=this.value});
register_input_password.addEventListener("input",function(){register_vals.password=this.value});
register_input_send.addEventListener("click",function(){sendRegister();});

async function sendRegister() {
    let result = "";
    try {
        const response = await fetch("http://localhost:3001/api/v1/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(register_vals),
        });
        const data = await response.json();
        result = data.data;
    } catch (error) {
        result = error.message;
    } finally {
        document.getElementById("register-log").innerText = result;
    }
}

// LOGIN INPUTS / BUTTONS
const login_input_email = document.getElementById("login-email");
const login_input_password = document.getElementById("login-password");
const login_input_send = document.getElementById("login-send");

let login_vals = {
    email: "",
    password: "",
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

async function sendLogin() {
    let result = "";
    try {
        const response = await fetch("http://localhost:3001/api/v1/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(login_vals),
        });

        const data = await response.json();
        result = data.data;
    } catch (error) {
        result = error.message;
    } finally {
        document.getElementById("login-log").innerText = result;
    }
}
