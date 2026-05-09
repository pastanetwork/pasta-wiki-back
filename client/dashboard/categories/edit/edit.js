import { fetchData, updateLang } from "/public/global.js";

const category_title_el = document.getElementById("category-edit-title");
const category_lang_el = document.getElementById("category-edit-lang");

const category_lang_select = document.getElementById("category-edit-select-lang");
const category_new_title_input = document.getElementById("category-edit-new-title-input");
const send_category_modification = document.getElementById("category-edit-send-modify");

let articles_list;
let categories_list;
let langs_list;
const urlParams = new URLSearchParams(window.location.search);
let act_category = null;



async function refreshData() {
	try {
		[articles_list, categories_list, langs_list] = await Promise.all([
			fetchData("/api/v1/articles/all"),
			fetchData("/api/v1/categories/all"),
			fetchData("/api/v1/categories/get-langs"),
		]);
	} catch (error) {
		console.error("Erreur lors du chargement des données :", error);
		return;
	}
	refreshCategory();
	refreshLangs();
}

await refreshData();
await updateLang();

function refreshCategory() {
	for (const el of categories_list.data) {
		if (urlParams.get("category") === el.title_urlized && urlParams.get("lang") === el.lang) {
			act_category = el;
		}
	}
	if (!act_category) {
		window.location.replace("/dashboard/categories");
		return;
	}
	category_title_el.textContent = act_category.title;
	category_lang_el.textContent = act_category.lang;
}

function refreshLangs() {
	const noneSelected = act_category.lang === "none" ? "selected" : "";
	let dom = `<option value="default" ${noneSelected} disabled data-traduction="dashboard.categories.select_lang">Select lang</option>`;

	for (const el of langs_list.data) {
		const selected = act_category.lang === el.lang.code ? "selected" : "";
		dom += `<option value="${el.lang.code}" ${selected}>${el.lang.name} (${el.lang.code})</option>`;
	}
	category_lang_select.innerHTML = dom;
}



send_category_modification.addEventListener("click", async function () {
	await sendCategoryUpdate();
});

async function sendCategoryUpdate() {
	const new_lang = category_lang_select.value;
	const new_title = category_new_title_input.value.trim();

	if (new_lang === "default" || new_title === "") {
		return;
	}

	await fetchRequest("PUT", "/api/v1/categories/modify", {
		title: new_title,
		prev_title: act_category.title,
		lang: new_lang,
		prev_lang: act_category.lang,
		enabled: act_category.enabled,
	});

	window.location.replace(
		`/dashboard/categories/edit?category=${URLize(new_title)}&lang=${URLize(new_lang)}`
	);
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

function URLize(input) {
	return input
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "_");
}