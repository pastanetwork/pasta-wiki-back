let lang = localStorage.getItem("lang") || "en_us";
let lang_dropdown_opened = false;

let translationsCache = null;
let availableLangsCache = null;

const icons = {
	home: `<svg xmlns="http://www.w3.org/2000/svg" id="home-logo-header" class="header-menu-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/></svg>`,
	articles: `<svg xmlns="http://www.w3.org/2000/svg" id="articles-logo-header" class="header-menu-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/><path d="M4.5 12.5A.5.5 0 0 1 5 12h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m0-2A.5.5 0 0 1 5 10h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m1.639-3.708 1.33.886 1.854-1.855a.25.25 0 0 1 .289-.047l1.888.974V8.5a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V8s1.54-1.274 1.639-1.208M6.25 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5"/></svg>`,
	categories: `<svg xmlns="http://www.w3.org/2000/svg" id="categories-logo-header" class="header-menu-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5zm13-3H1v2h14zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/></svg>`,
	administration: `<svg xmlns="http://www.w3.org/2000/svg" id="administration-logo-header" class="header-menu-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6.5a.5.5 0 0 1-1 0V1H3v14h3v-2.5a.5.5 0 0 1 .5-.5H8v4H3a1 1 0 0 1-1-1z"/><path d="M4.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM9 13a1 1 0 0 1 1-1v-1a2 2 0 1 1 4 0v1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm3-3a1 1 0 0 0-1 1v1h2v-1a1 1 0 0 0-1-1"/></svg>`,
	user: `<svg xmlns="http://www.w3.org/2000/svg" id="user-logo-header" class="header-menu-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/></svg>`,
	chevron: {
		down: `<svg xmlns="http://www.w3.org/2000/svg" class="header-menu-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/></svg>`,
		up: `<svg xmlns="http://www.w3.org/2000/svg" class="header-menu-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/></svg>`,
	},
};

const header = document.querySelector("header");
header.innerHTML = `
<div class="flex-al-it-center">
    <a href="/" class="flex-al-it-center">
        <img id="pasta-logo-header" src="/public/pasta_logo.svg" alt="Logo Pastanetwork">
        <h1>Pastanetwork Wiki Manager</h1>
    </a>
</div>
<menu id="header-menu-bar">
    <div id="header-lang-selector" role="button" tabindex="0" aria-expanded="false" aria-haspopup="listbox" aria-label="Select language">
        <div id="header-lang-flag-holder">
            <img class="header-lang-flag" src="https://flagicons.lipis.dev/flags/4x3/${lang.split("_")[1]}.svg" alt="${lang} flag">
        </div>
        <div id="header-lang-select-btn" aria-hidden="true">${icons.chevron.down}</div>
    </div>
    <nav id="header-icons-nav" aria-label="Main navigation"></nav>
</menu>
<div id="lang-dropdwon-menu-comp" data-opened="false" role="listbox" aria-label="Available languages"></div>`;

const lang_dropdown = document.getElementById("lang-dropdwon-menu-comp");
const lang_selector = document.getElementById("header-lang-selector");
const lang_dropdown_btn = document.getElementById("header-lang-select-btn");

export async function fetchData(url) {
	const response = await fetch(url, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});
	if (!response.ok) {
		throw new Error(`${url} : ${response.status}`);
	}
	return await response.json();
}

async function verifAdmin() {
	const nav_icons = document.getElementById("header-icons-nav");
	let dom = `
        <a href="/" aria-label="Accueil">${icons.home}</a>
        <a href="/dashboard/articles" aria-label="Articles">${icons.articles}</a>
        <a href="/dashboard/categories" aria-label="Catégories">${icons.categories}</a>`;
	try {
		const response = await fetch("/api/v1/users/is-admin");
		if (response.ok) {
			dom += `<a href="/administration" aria-label="Administration">${icons.administration}</a>`;
		}
	} catch (error) {
		return
	}
	dom += `<a href="/profil" aria-label="Profil">${icons.user}</a>`;
	nav_icons.innerHTML = dom;
}

async function loadTranslations(forceRefresh = false) {
	if (!forceRefresh) {
		try {
			const cachedTranslations = localStorage.getItem("translations");
			const cachedLangs = localStorage.getItem("available-translations");
			if (cachedTranslations && cachedLangs) {
				translationsCache = JSON.parse(cachedTranslations);
				availableLangsCache = JSON.parse(cachedLangs);
				return;
			}
		} catch (error) {
			console.warn(error);
		}
	}

	try {
		const [translations, langs] = await Promise.all([
			fetchData("/api/v1/client-translations"),
			fetchData("/api/v1/client-langs"),
		]);

		translationsCache = translations;
		availableLangsCache = langs;

		localStorage.setItem("translations", JSON.stringify(translations));
		localStorage.setItem("available-translations", JSON.stringify(langs));
	} catch (error) {
		console.error("Impossible de charger les traductions :", error);
	}
}

export async function updateLang() {
	if (!translationsCache || !availableLangsCache) {
		await loadTranslations();
	}

	if (!translationsCache || !availableLangsCache) {
		console.error("Les traductions ne sont pas disponibles.");
		return;
	}

	const elements = document.querySelectorAll("[data-traduction]");
	for (const el of elements) {
		const key = el.dataset.traduction;
		const translation = translationsCache[key]?.[lang];
		if (translation !== undefined) {
			el.textContent = translation;
		}
	}
	buildLangDropdown();
}

function buildLangDropdown() {
	lang_dropdown.innerHTML = "";

	for (const langCode of availableLangsCache) {
		const countryCode = langCode.split("_")[1];
		const el = document.createElement("div");
		el.classList.add("header-lang-dropdown-element");
		el.dataset.value = langCode;
		el.setAttribute("role", "option");
		el.setAttribute("aria-selected", langCode === lang ? "true" : "false");
		el.innerHTML = `<img class="header-lang-flag" src="https://flagicons.lipis.dev/flags/4x3/${countryCode}.svg" alt="${langCode} flag">`;

		el.addEventListener("click", function () {
			selectLang(langCode);
		});

		lang_dropdown.appendChild(el);
	}
}

function selectLang(newLang) {
	lang = newLang;
	localStorage.setItem("lang", lang);
	const flagHolder = document.getElementById("header-lang-flag-holder");
	const countryCode = lang.split("_")[1];
	flagHolder.innerHTML = `<img class="header-lang-flag" src="https://flagicons.lipis.dev/flags/4x3/${countryCode}.svg" alt="${lang} flag">`;
	closeLangDropdown();
	updateLang();
}

function closeLangDropdown() {
	lang_dropdown_opened = false;
	lang_dropdown.dataset.opened = "false";
	lang_selector.setAttribute("aria-expanded", "false");
	lang_dropdown_btn.innerHTML = icons.chevron.down;
}

function openLangDropdown() {
	lang_dropdown_opened = true;
	lang_dropdown.dataset.opened = "true";
	lang_selector.setAttribute("aria-expanded", "true");
	lang_dropdown_btn.innerHTML = icons.chevron.up;
}

lang_selector.addEventListener("click", function () {
	if (lang_dropdown_opened) {
		closeLangDropdown();
	} else {
		openLangDropdown();
	}
});

lang_selector.addEventListener("keydown", function (event) {
	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		if (lang_dropdown_opened) {
			closeLangDropdown();
		} else {
			openLangDropdown();
		}
	}
});

document.addEventListener("click", function (event) {
	if (lang_dropdown_opened && !lang_selector.contains(event.target) && !lang_dropdown.contains(event.target)) {
		closeLangDropdown();
	}
});


verifAdmin();
await loadTranslations(false);
updateLang();
loadTranslations(true).then(() => {
	updateLang();
});