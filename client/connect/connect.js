import { updateLang } from "/public/global.js";

let act_step = "login";


const connect_form = document.getElementById("connect-form");
const connect_title = document.getElementById("connect-title");
const connect_legend = document.getElementById("connect-legend");

const username_group = document.getElementById("username-group");
const input_username = document.getElementById("username");

const input_email = document.getElementById("email");
const input_password = document.getElementById("password");

const password_confirm_group = document.getElementById("password-confirm-group");
const input_password_confirm = document.getElementById("password-confirm");

const connect_log = document.getElementById("connect-log");

const switch_step_label = document.getElementById("switch-login-register-label");
const switch_step_btn = document.getElementById("switch-login-register");


const two_factor_auth_form = document.getElementById("two-factor-auth-form");
const two_factor_code_input = document.getElementById("two-factor-input-code");
const two_factor_code_send = document.getElementById("two-factor-send-code");
const two_factor_auth_log = document.getElementById("two-factor-auth-log");


let credentials = {};


const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("require2fa") === "true") {
	act_step = "2fa";
}


function syncCredentials() {
	credentials.email = input_email.value;
	credentials.password = input_password.value;
	if (act_step === "register") {
		credentials.username = input_username.value;
	}
}


connect_form.addEventListener("submit", function (event) {
	event.preventDefault();
	syncCredentials();

	if (act_step === "login") {
		sendLogin();
	} else if (act_step === "register") {
		sendRegister();
	}
});


async function sendLogin() {
	let result = "";
	let valid = false;
	try {
		const response = await fetch("/api/v1/users/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: credentials.email,
				password: credentials.password,
			}),
		});

		const data = await response.json();
		result = data.data;
		if (response.ok) {
			valid = true;
		}
	} catch (error) {
		result = error.message;
	} finally {
		connect_log.textContent = result;
		input_password.value = "";
		if (valid) {
			act_step = "2fa";
			updateStep();
		}
	}
}


async function sendRegister() {
	let result = "";
	let valid = false;
	try {
		const response = await fetch("/api/v1/users/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(credentials),
		});

		const data = await response.json();
		result = data.data;
		if (response.ok) {
			valid = true;
		}
	} catch (error) {
		result = error.message;
	} finally {
		connect_log.textContent = result;
		input_password.value = "";
		if (valid) {
			act_step = "2fa";
			updateStep();
		}
	}
}


switch_step_btn.addEventListener("click", function () {
	act_step = act_step === "login" ? "register" : "login";
	connect_log.textContent = "";
	updateStep();
});


function updateStep() {
	switch (act_step) {
		case "login":
			connect_title.dataset.traduction = "connect.login";
			connect_legend.dataset.traduction = "connect.login";
			switch_step_label.dataset.traduction = "connect.switch-to-register";
			switch_step_btn.dataset.traduction = "connect.switch-to-register.link";

			password_confirm_group.classList.add("hidden");
			username_group.classList.add("hidden");
			input_password_confirm.removeAttribute("required");
			input_username.removeAttribute("required");
			input_password.setAttribute("autocomplete", "current-password");

			connect_form.style.display = "";
			two_factor_auth_form.style.display = "none";

			input_email.focus();
			break;

		case "register":
			connect_title.dataset.traduction = "connect.register";
			connect_legend.dataset.traduction = "connect.register";
			switch_step_label.dataset.traduction = "connect.switch-to-connect";
			switch_step_btn.dataset.traduction = "connect.switch-to-connect.link";

			password_confirm_group.classList.remove("hidden");
			username_group.classList.remove("hidden");
			input_password_confirm.setAttribute("required", "");
			input_username.setAttribute("required", "");
			input_password.setAttribute("autocomplete", "new-password");

			connect_form.style.display = "";
			two_factor_auth_form.style.display = "none";

			input_username.focus();
			break;

		case "2fa":
			connect_form.style.display = "none";
			two_factor_auth_form.style.display = "";

			loadQRCode();
			two_factor_code_input.focus();
			break;
	}
	updateLang();
}


function loadQRCode() {
	const holder = document.getElementById("two-factor-qrcode-holder");
	holder.innerHTML = "";

	const qrImg = document.createElement("img");
	qrImg.src = "/api/v1/users/qrcode-2fa";
	qrImg.alt = "QR Code for 2FA setup";

	qrImg.onload = function () {
		holder.appendChild(qrImg);
	};

	qrImg.onerror = function () {
		// Le code QR n'est pas disponible (déjà configuré ou erreur serveur)
	};
}


two_factor_code_send.addEventListener("click", send2FACode);

two_factor_code_input.addEventListener("keydown", function (event) {
	if (event.key === "Enter") {
		event.preventDefault();
		send2FACode();
	}
});

async function send2FACode() {
	const code = two_factor_code_input.value;

	if (!/^\d{6}$/.test(code)) {
		two_factor_code_input.value = "";
		two_factor_auth_log.textContent = "Code de vérification invalide";
		two_factor_code_input.focus();
		return;
	}

	let result = "";
	let valid = false;
	try {
		const response = await fetch("/api/v1/users/verify-code-2fa", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code }),
		});

		const data = await response.json();
		result = data.data;
		if (response.ok) {
			valid = true;
		}
	} catch (error) {
		result = error.message;
	} finally {
		two_factor_code_input.value = "";
		two_factor_auth_log.textContent = result;
		if (valid) {
			window.location.replace("/dashboard");
		} else {
			two_factor_code_input.focus();
		}
	}
}

updateStep();