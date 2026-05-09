import { fetchData, updateLang } from "/public/global.js";

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

const disconnect_btn = document.getElementById("disconnect-user");
const alert_div = document.getElementById("profil-modif-confirm");

let user_data = {
	username: "",
	prev_username: "",
	email: "",
	prev_email: "",
	password: "",
	code_2fa: "",
};

for (const btn of document.querySelectorAll(".toggle-password-btn")) {
	btn.addEventListener("click", function () {
		const target = document.getElementById(this.dataset.target);
		if (!target) return;

		const isHidden = target.type === "password";
		target.type = isHidden ? "text" : "password";
		this.textContent = isHidden ? "Hide" : "Show";
		this.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
	});
}

async function refreshData() {
	let user_data_result;
	let connection_logs;

	try {
		[user_data_result, connection_logs] = await Promise.all([
			fetchData("/api/v1/users/get-infos"),
			fetchData("/api/v1/users/get-connect-logs"),
		]);
	} catch (error) {
		console.error("Erreur lors du chargement du profil :", error);
		return;
	}

	if (user_data_result.code !== 200 || connection_logs.code !== 200) {
		return;
	}

	const userdata = user_data_result.msg;

	display_username.textContent = userdata.username;
	display_email.textContent = userdata.email;
	display_creation_time.innerHTML = formatTime(userdata.created_at);
	display_role.textContent = userdata.role;

	user_data.prev_username = userdata.username;
	user_data.prev_email = userdata.email;

	const logs_tbody = document.getElementById("connect-log-tbody");
	logs_tbody.innerHTML = "";

	const sorted_list = connection_logs.msg.sort((a, b) => new Date(b.date) - new Date(a.date));

	for (const log of sorted_list) {
		const tr = document.createElement("tr");
		tr.innerHTML = `
            <td>${escapeHTML(log.email)}</td>
            <td>${escapeHTML(log.user_agent)}</td>
            <td>${escapeHTML(log.ip)}</td>
            <td>${formatTime(log.date)}</td>
            <td>${escapeHTML(log.status)}</td>
        `;
		logs_tbody.appendChild(tr);
	}

	updateLang();
}

async function sendProfilModification() {
	const new_username = edit_username_input.value;
	const new_email = edit_email_input.value;
	const new_password = edit_password_input.value;
	const confirm_password = edit_password_confirm_input.value;

	if (new_password !== confirm_password) {
		profil_modif_log.dataset.traduction = "profil.edit.passwords_not_match";
		updateLang();
		return;
	}

	user_data.username = URLize(new_username);
	user_data.email = new_email;
	user_data.password = new_password;

	try {
		const response = await fetch("/api/v1/users/modify", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: user_data.username,
				email: user_data.email,
				password: user_data.password,
				code_2fa: user_data.code_2fa,
			}),
		});

		if (response.ok) {
			profil_modif_log.dataset.traduction = "profil.edit.log_updated_ok";
			updateLang();
		} else {
			profil_modif_log.textContent = `Erreur ${response.status}`;
		}
	} catch (error) {
		profil_modif_log.textContent = error.message;
	} finally {
		user_data = {
			username: "",
			prev_username: "",
			email: "",
			prev_email: "",
			password: "",
			code_2fa: "",
		};
		await refreshData();
	}
}

function setAlertOpened(opened, dom) {
	alert_div.dataset.opened = opened;
	alert_div.innerHTML = opened ? dom : "";
	if (opened) {
		const undoBtn = document.getElementById("profil-modif-alert-undo-btn");
		if (undoBtn) undoBtn.focus();
	}
	updateLang();
}

send_profil_modif_btn.addEventListener("click", function () {
	setAlertOpened(true, `
        <fieldset id="profil-modif-alert">
            <legend class="sr-only">Confirm profile modification</legend>
            <h2 id="profil-alert-title" data-traduction="alert.title.confirm_action">Confirm action</h2>
            <hr>
            <label for="profil-modif-alert-2fa-code" data-traduction="profil.alert.confirm_2fa_code">Open your 2FA application and confirm the provided code.</label>
            <input type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" id="profil-modif-alert-2fa-code" autocomplete="one-time-code" placeholder="123456">
            <div id="profil-modif-alert-btn-holder">
                <button type="button" id="profil-modif-alert-undo-btn" data-traduction="alert.button.undo"><h3>Undo</h3></button>
                <button type="button" id="profil-modif-alert-confirm-btn" data-traduction="alert.button.confirm"><h3>Confirm</h3></button>
            </div>
        </fieldset>
    `);

	document.getElementById("profil-modif-alert-undo-btn").addEventListener("click", function () {
		setAlertOpened(false, "");
	});

	document.getElementById("profil-modif-alert-confirm-btn").addEventListener("click", async function () {
		const code = document.getElementById("profil-modif-alert-2fa-code").value;

		if (!/^\d{6}$/.test(code)) {
			return;
		}

		user_data.code_2fa = code;
		await sendProfilModification();
		setAlertOpened(false, "");
		edit_username_input.value = "";
		edit_email_input.value = "";
		edit_password_input.value = "";
		edit_password_confirm_input.value = "";
	});
});

disconnect_btn.addEventListener("click", async function () {
	try {
		await fetch("/api/v1/users/delete-auth-cookie");
	} catch (error) {
		console.error("Erreur lors de la déconnexion :", error);
	}
	window.location.replace("/connect");
});

function formatTime(val) {
	const months = [
		"january", "february", "march", "april", "may", "june",
		"july", "august", "september", "october", "november", "december",
	];
	const parts = val.split("-");
	const year = parts[0];
	const monthIndex = parseInt(parts[1], 10) - 1;
	const splitT = parts[2].split("T");
	const day = splitT[0];
	const hours = splitT[1].split(".")[0];

	return `${day} <span data-traduction="utils.months.${months[monthIndex]}"></span> ${year} <span data-traduction="profil.account.at">at</span> ${hours}`;
}

function URLize(input) {
	return input
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "_");
}

function escapeHTML(str) {
	const div = document.createElement("div");
	div.textContent = str;
	return div.innerHTML;
}

await refreshData();
updateLang();