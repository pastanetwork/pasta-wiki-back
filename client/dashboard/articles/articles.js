import { fetchData, updateLang } from "/public/global.js";

const article_list_holder = document.getElementById("articles-list-holder");
const new_article_category_selector = document.getElementById("articles-upper-comp-toolbar-new-article-category");

const refresh_btn = document.getElementById("articles-list-refresh");
const search_input = document.getElementById("articles-list-search-input");

const new_article_title_input = document.getElementById("articles-upper-comp-toolbar-new-article-title");
const new_article_send_btn = document.getElementById("articles-upper-comp-toolbar-new-article-send");

const alert_div = document.getElementById("article-list-confirm");

const icons = {
	trash: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" aria-hidden="true" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>`,
	pen: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" aria-hidden="true" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg>`,
};

let category_list = null;
let articles_data = null;



async function refreshData() {
	await refreshCategory();
	await refreshArticles();
	updateLang();
}
await refreshData();



async function refreshCategory() {
	try {
		category_list = await fetchData("/api/v1/categories/all");
	} catch (error) {
		console.error("Erreur lors du chargement des catégories :", error);
		return;
	}

	new_article_category_selector.innerHTML =
		`<option value="default" selected disabled data-traduction="dashboard.articles.select_category">Select category</option>`;

	for (const el of category_list.data) {
		const option = document.createElement("option");
		option.value = el.title;
		option.dataset.lang = el.lang;
		option.textContent = `${el.title} (${el.lang})`;
		new_article_category_selector.appendChild(option);
	}
}



async function refreshArticles() {
	try {
		articles_data = await fetchData("/api/v1/articles/all");
	} catch (error) {
		console.error("Erreur lors du chargement des articles :", error);
		return;
	}

	article_list_holder.innerHTML = "";

	for (const article of articles_data.data) {
		const tr = document.createElement("tr");
		tr.classList.add("article-data-holder");
		tr._articleData = article;

		tr.innerHTML = `
            <td>
                <a href="https://www.pastanetwork.com/wiki/${article.lang}/${article.category_urlized}/${article.title_urlized}" target="_blank" rel="noopener">${article.title}</a>
            </td>
            <td>${article.lang}</td>
            <td>
                <label class="sr-only" for="cat-select-${article.title_urlized}">Category</label>
                <select id="cat-select-${article.title_urlized}" data-type="select"></select>
            </td>
            <td><a href="/dashboard/articles/edit?category=${article.category_urlized}&article=${article.title_urlized}" aria-label="Edit ${article.title}">${icons.pen}</a></td>
            <td><button type="button" data-type="delete" aria-label="Delete ${article.title}">${icons.trash}</button></td>
            <td><input data-type="enabled" type="checkbox" ${article.enabled ? "checked" : ""} class="article-enabled-checkbox" aria-label="Enable ${article.title}"></td>
        `;

		article_list_holder.appendChild(tr);

		// Attacher les écouteurs directement (pas de triple boucle)
		const deleteBtn = tr.querySelector('[data-type="delete"]');
		const enabledCb = tr.querySelector('[data-type="enabled"]');
		const selectEl = tr.querySelector('[data-type="select"]');

		bindDeleteButton(deleteBtn, article);
		bindEnabledCheckbox(enabledCb, article);
		bindSelectCategory(selectEl, article);
	}
}



new_article_send_btn.addEventListener("click", async function () {
	const response = await createNewArticle();
	if (response.ok) {
		await refreshData();
		new_article_title_input.value = "";
	}
});

async function createNewArticle() {
	const selectedOption = new_article_category_selector.options[new_article_category_selector.selectedIndex];
	const category = new_article_category_selector.value;
	const lang = selectedOption?.dataset?.lang;

	if (category === "default" || !lang) {
		return { ok: false };
	}

	const categoryExists = category_list.data.some((el) => el.title === category);
	if (!categoryExists) {
		return { ok: false };
	}

	const title = new_article_title_input.value.trim();
	if (title === "") {
		new_article_title_input.value = "";
		return { ok: false };
	}

	await fetchRequest("POST", "/api/v1/articles/publish", {
		category: { name: category, lang },
		title,
		content: "",
		enabled: false,
	});
	return { ok: true };
}



function bindDeleteButton(el, article) {
	el.addEventListener("click", function () {
		const sentValues = {
			category: { name: article.category, lang: article.lang },
			title: article.title,
		};

		setAlertOpened(true, `
        <fieldset id="article-list-alert-delete">
            <legend class="sr-only">Confirm deletion</legend>
            <h2 id="alert-dialog-title" data-traduction="alert.title.confirm_action">Confirm action</h2>
            <hr>
            <p data-traduction="alert.delete.msg.are_u_sure_u_want_to_del">Are you sure you want to delete:</p>
            <h3>${article.title}</h3>
            <p><span data-traduction="alert.delete.msg.action_will_delete">This action will delete</span> ${article.title} <span data-traduction="alert.delete.msg.permanently">permanently.</span></p>
            <div class="alert-agreement">
                <input type="checkbox" id="article-list-alert-agree">
                <label for="article-list-alert-agree"><code data-traduction="article.alert.confirm_agree">I understand this action is irreversible and can't be undone.</code></label>
            </div>
            <div id="article-list-alert-btn-holder">
                <button type="button" id="article-list-alert-undo"><h3 data-traduction="alert.button.undo">Undo</h3></button>
                <button type="button" id="article-list-alert-confirm"><h3 data-traduction="alert.button.confirm">Confirm</h3></button>
            </div>
        </fieldset>
        `);

		document.getElementById("article-list-alert-confirm").addEventListener("click", async function () {
			if (document.getElementById("article-list-alert-agree").checked) {
				await fetchRequest("PUT", "/api/v1/articles/delete", sentValues);
				await refreshData();
				setAlertOpened(false, "");
			}
		});

		document.getElementById("article-list-alert-undo").addEventListener("click", function () {
			setAlertOpened(false, "");
		});
	});
}



function bindEnabledCheckbox(el, article) {
	el.checked = article.enabled;

	el.addEventListener("change", async function () {
		await fetchRequest("PUT", "/api/v1/articles/modify", {
			category: { name: article.category, lang: article.lang },
			title: article.title,
			prev_title: article.title,
			prev_category: { name: article.category, lang: article.lang },
			content: article.content,
			enabled: el.checked,
		});
		await refreshData();
	});
}



function bindSelectCategory(el, article) {
	const categoryNone = article.category === "none";
	let dom = `<option value="none" ${categoryNone ? "selected" : ""} data-lang="none">none (none)</option>\n`;

	for (const cat of category_list.data) {
		const selected = article.category === cat.title && article.lang === cat.lang ? "selected" : "";
		dom += `<option value="${cat.title}" ${selected} data-lang="${cat.lang}">${cat.title} (${cat.lang})</option>\n`;
	}
	el.innerHTML = dom;

	el.addEventListener("change", async function () {
		const selectedOption = this.options[this.selectedIndex];
		await fetchRequest("PUT", "/api/v1/articles/modify", {
			category: { name: this.value, lang: selectedOption.dataset.lang },
			prev_category: { name: article.category, lang: article.lang },
			title: article.title,
			prev_title: article.title,
			content: article.content,
			enabled: article.enabled,
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
		const undoBtn = document.getElementById("article-list-alert-undo");
		if (undoBtn) undoBtn.focus();
	}
	updateLang();
}



refresh_btn.addEventListener("click", async function () {
	await refreshData();
});



search_input.addEventListener("input", function () {
	const elements = document.querySelectorAll(".article-data-holder");
	const needle = normalise(search_input.value);

	for (const el of elements) {
		el.style.display =
			needle === "" || normalise(el._articleData.title).includes(needle)
				? "table-row"
				: "none";
	}
});

function normalise(input) {
	return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}