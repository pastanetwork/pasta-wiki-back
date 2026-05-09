import { fetchData, updateLang } from "/public/global.js";

const category_list_holder = document.getElementById("categories-list-holder");
const new_category_lang_selector = document.getElementById("categories-upper-comp-toolbar-new-category-lang");

const refresh_btn = document.getElementById("categories-list-refresh");
const search_input = document.getElementById("categories-list-search-input");

const new_category_title_input = document.getElementById("categories-upper-comp-toolbar-new-category-title");
const new_category_send_btn = document.getElementById("categories-upper-comp-toolbar-new-category-send");

const alert_div = document.getElementById("category-list-confirm");

const icons = {
	trash: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" aria-hidden="true" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>`,
	pen: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" aria-hidden="true" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg>`,
};

let langs_list = null;
let categories_data = null;



async function refreshData() {
	await refreshLangs();
	await refreshCategories();
	updateLang();
}
await refreshData();



async function refreshLangs() {
	try {
		langs_list = await fetchData("/api/v1/categories/get-langs");
	} catch (error) {
		console.error("Erreur lors du chargement des langues :", error);
		return;
	}

	new_category_lang_selector.innerHTML =
		`<option value="default" selected disabled data-traduction="dashboard.categories.select_lang">Select lang</option>`;

	for (const el of langs_list.data) {
		const option = document.createElement("option");
		option.value = el.lang.code;
		option.textContent = `${el.lang.name} (${el.lang.code})`;
		new_category_lang_selector.appendChild(option);
	}
}



async function refreshCategories() {
	try {
		categories_data = await fetchData("/api/v1/categories/all");
	} catch (error) {
		console.error("Erreur lors du chargement des catégories :", error);
		return;
	}

	category_list_holder.innerHTML = "";

	for (const category of categories_data.data) {
		const tr = document.createElement("tr");
		tr.classList.add("category-data-holder");
		tr._categoryData = category;

		tr.innerHTML = `
            <td>
                <a href="https://www.pastanetwork.com/wiki/${category.lang}/${category.title_urlized}" target="_blank" rel="noopener">${category.title}</a>
            </td>
            <td>
                <label class="sr-only" for="lang-select-${category.title_urlized}-${category.lang}">Language</label>
                <select id="lang-select-${category.title_urlized}-${category.lang}" data-type="select"></select>
            </td>
            <td>${category.articles_nb}</td>
            <td><a href="/dashboard/categories/edit?category=${category.title_urlized}&lang=${category.lang}" aria-label="Edit ${category.title}">${icons.pen}</a></td>
            <td><button type="button" data-type="delete" aria-label="Delete ${category.title}">${icons.trash}</button></td>
            <td><input data-type="enabled" type="checkbox" ${category.enabled ? "checked" : ""} class="category-enabled-checkbox" aria-label="Enable ${category.title}"></td>
        `;

		category_list_holder.appendChild(tr);

		const deleteBtn = tr.querySelector('[data-type="delete"]');
		const enabledCb = tr.querySelector('[data-type="enabled"]');
		const selectEl = tr.querySelector('[data-type="select"]');

		bindDeleteButton(deleteBtn, category);
		bindEnabledCheckbox(enabledCb, category);
		bindSelectLang(selectEl, category);
	}
}



new_category_send_btn.addEventListener("click", async function () {
	const response = await createNewCategory();
	if (response.ok) {
		await refreshData();
		new_category_title_input.value = "";
	}
});

async function createNewCategory() {
	const lang = new_category_lang_selector.value;
	if (lang === "default") {
		return { ok: false };
	}

	const langExists = langs_list.data.some((el) => el.lang.code === lang);
	if (!langExists) {
		return { ok: false };
	}

	const title = new_category_title_input.value.trim();
	if (title === "") {
		new_category_title_input.value = "";
		return { ok: false };
	}

	await fetchRequest("POST", "/api/v1/categories/publish", {
		title,
		lang,
		enabled: false,
	});
	return { ok: true };
}



function bindDeleteButton(el, category) {
	el.addEventListener("click", function () {
		const sentValues = {
			title: category.title,
			lang: category.lang,
		};

		setAlertOpened(true, `
        <fieldset id="category-list-alert-delete">
            <legend class="sr-only">Confirm deletion</legend>
            <h2 id="alert-dialog-title" data-traduction="alert.title.confirm_action">Confirm action</h2>
            <hr>
            <p data-traduction="alert.delete.msg.are_u_sure_u_want_to_del">Are you sure you want to delete:</p>
            <h3>${category.title}</h3>
            <p><span data-traduction="alert.delete.msg.action_will_delete">This action will delete</span> ${category.title} <span data-traduction="alert.delete.msg.permanently">permanently.</span></p>
            <div class="alert-agreement">
                <input type="checkbox" id="category-list-alert-agree">
                <label for="category-list-alert-agree"><code data-traduction="article.alert.confirm_agree">I understand this action is irreversible and can't be undone.</code></label>
            </div>
            <div id="category-list-alert-btn-holder">
                <button type="button" id="category-list-alert-undo"><h3 data-traduction="alert.button.undo">Undo</h3></button>
                <button type="button" id="category-list-alert-confirm"><h3 data-traduction="alert.button.confirm">Confirm</h3></button>
            </div>
        </fieldset>
        `);

		document.getElementById("category-list-alert-confirm").addEventListener("click", async function () {
			if (document.getElementById("category-list-alert-agree").checked) {
				await fetchRequest("PUT", "/api/v1/categories/delete", sentValues);
				await refreshData();
				setAlertOpened(false, "");
			}
		});

		document.getElementById("category-list-alert-undo").addEventListener("click", function () {
			setAlertOpened(false, "");
		});
	});
}



function bindEnabledCheckbox(el, category) {
	el.checked = category.enabled;

	el.addEventListener("change", async function () {
		await fetchRequest("PUT", "/api/v1/categories/modify", {
			title: category.title,
			prev_title: category.title,
			lang: category.lang,
			prev_lang: category.lang,
			enabled: el.checked,
		});
		await refreshData();
	});
}



function bindSelectLang(el, category) {
	let dom = "";
	for (const lang of langs_list.data) {
		const selected = category.lang === lang.lang.code ? "selected" : "";
		dom += `<option value="${lang.lang.code}" ${selected}>${lang.lang.name} (${lang.lang.code})</option>\n`;
	}
	el.innerHTML = dom;

	el.addEventListener("change", async function () {
		await fetchRequest("PUT", "/api/v1/categories/modify", {
			title: category.title,
			prev_title: category.title,
			lang: el.value,
			prev_lang: category.lang,
			enabled: category.enabled,
		});
		await refreshData();
	});
}



async function fetchRequest(method, url, vals) {
	try {
		const response = await fetch(url, {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(vals),
		});
		if (!response.ok) {
			console.error(`Requête ${method} ${url} échouée :`, response.status);
		}
	} catch (error) {
		console.error(`Erreur réseau ${method} ${url} :`, error);
	}
}



function setAlertOpened(opened, dom) {
	alert_div.dataset.opened = opened;
	alert_div.innerHTML = opened ? dom : "";
	if (opened) {
		const undoBtn = document.getElementById("category-list-alert-undo");
		if (undoBtn) undoBtn.focus();
	}
	updateLang();
}



refresh_btn.addEventListener("click", async function () {
	await refreshData();
});



search_input.addEventListener("input", function () {
	const elements = document.querySelectorAll(".category-data-holder");
	const needle = normalise(search_input.value);

	for (const el of elements) {
		el.style.display =
			needle === "" || normalise(el._categoryData.title).includes(needle)
				? "table-row"
				: "none";
	}
});

function normalise(input) {
	return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}