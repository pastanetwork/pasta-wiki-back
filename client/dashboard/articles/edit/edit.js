import { fetchData, updateLang } from "/public/global.js";

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

const category_title = document.getElementById("article-edit-category");
const article_title = document.getElementById("article-edit-title");

const select_assign_category = document.getElementById("article-edit-select-category");
const new_title_input = document.getElementById("article-edit-new-title-input");
const send_new_category_and_title = document.getElementById("article-edit-send-modify");

let articles_list;
let categories_list;
const urlParams = new URLSearchParams(window.location.search);

let article_vals = {
	category: { name: "", lang: "" },
	title: "",
	prev_title: "",
	prev_category: { name: "", lang: "" },
	content: "",
	enabled: true,
};



let saveTimeout = null;

function debouncedSave() {
	if (saveTimeout) clearTimeout(saveTimeout);
	saveTimeout = setTimeout(() => {
		sendPostUpdate();
	}, 500);
}



async function refreshData() {
	try {
		articles_list = await fetchData("/api/v1/articles/all");
		categories_list = await fetchData("/api/v1/categories/all");
	} catch (error) {
		console.error("Erreur lors du chargement des données :", error);
		return;
	}
	refreshArticle();
	refreshCategories();
}

await refreshData();

function refreshArticle() {
	for (const el of articles_list.data) {
		if (
			urlParams.get("category") === el.category_urlized &&
			urlParams.get("article") === el.title_urlized
		) {
			editor.value = el.content;
			category_title.textContent = el.category;
			article_title.textContent = el.title;
			article_vals.category.name = el.category;
			article_vals.category.lang = el.lang;
			article_vals.title = el.title;
			article_vals.prev_title = el.title;
			article_vals.prev_category.name = el.category;
			article_vals.prev_category.lang = el.lang;
			article_vals.content = el.content;
			article_vals.enabled = el.enabled;
		}
	}
	if (article_vals.title === "") {
		window.location.replace("/dashboard/articles");
	}
}

function refreshCategories() {
	const noneSelected = article_vals.category.name === "none" ? "selected" : "";
	let dom = `<option value="none" ${noneSelected}>none</option>\n`;

	for (const el of categories_list.data) {
		const selected =
			article_vals.category.name === el.title && article_vals.category.lang === el.lang
				? "selected"
				: "";
		dom += `<option value="${el.title}" ${selected} data-lang="${el.lang}">${el.title} (${el.lang})</option>\n`;
	}
	select_assign_category.innerHTML = dom;
}



function updatePreview() {
	preview.innerHTML = marked.parse(editor.value);
	article_vals.content = editor.value;
	debouncedSave();
}

editor.addEventListener("input", updatePreview);
updatePreview();



async function sendPostUpdate() {
	if (!article_vals.category.name || !article_vals.title || !article_vals.prev_title) {
		return;
	}
	try {
		const response = await fetch("/api/v1/articles/modify", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(article_vals),
		});
		if (!response.ok) {
			console.error("Sauvegarde échouée :", response.status);
		}
	} catch (error) {
		console.error("Erreur réseau lors de la sauvegarde :", error);
	}
}



send_new_category_and_title.addEventListener("click", async function () {
	await updateArticleCategoryAndTitle();
});

async function updateArticleCategoryAndTitle() {
	const prev_category = { name: article_vals.category.name, lang: article_vals.category.lang };
	const prev_title = article_vals.title;

	const selectedOption = select_assign_category.options[select_assign_category.selectedIndex];
	const new_category_name = select_assign_category.value;
	const new_category_lang = selectedOption?.dataset?.lang || "none";
	const new_title = new_title_input.value;

	if (new_category_name === "none" && !new_title) {
		return;
	}

	const categoryExists =
		new_category_name === "none" ||
		categories_list.data.some((el) => el.title === new_category_name);

	if (!categoryExists) {
		return;
	}

	article_vals.prev_category = { ...prev_category };
	article_vals.prev_title = prev_title;
	article_vals.category.name = new_category_name;
	article_vals.category.lang = new_category_lang;

	if (new_title.trim() !== "") {
		article_vals.title = new_title.trim();
	}

	await sendPostUpdate();
}

function URLize(input) {
	return input
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "_");
}