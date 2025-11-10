let lang = localStorage.getItem("lang") || "en_us";

const icons = {
    user:`<svg xmlns="http://www.w3.org/2000/svg" id="user-logo-header" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/></svg>`,
}

const header = document.querySelector("header")
header.innerHTML=`<div class='flex-al-it-center'><a href='/' class='flex-al-it-center'><img id='pasta-logo-header' src='/public/pasta_logo.svg' alt='Logo Pastanetwork'><h1>Pastanetwork Wiki Manager</h1></a></div><div class='flex-al-it-center' id='header-comp-right'><div class="flex-al-it-center"><div id="header-lang-flag-holder"><img id="header-lang-flag" src="https://flagicons.lipis.dev/flags/4x3/${lang.split("_")[1]}.svg" alt="${lang} flag"/></div><select id="header-select-lang"></select></div>${icons.user}</div>`

const select_lang_menu = document.getElementById("header-select-lang");

export async function updateLang(){
    const translatable_elements = document.querySelectorAll("[data-traduction]");
    const translations = await fetchData("/api/v1/client-translations");
    const available_translations = await fetchData("/api/v1/client-langs");
    for (let el of translatable_elements){
        for (let trad in translations){
            if (el.dataset.traduction == trad ){
                el.innerText = translations[trad]?.[lang];
            }
        }
    }
    let dom=""
    for (let el of available_translations){
        const selected = el === lang ? "selected" : "";
        dom+=`<option value="${el}" ${selected}>${el}</option>`
    }
    select_lang_menu.innerHTML=dom;
}

export async function fetchData(url) {
    let result;
    try {
        const response = await fetch(url, {
        method: "GET", 
        headers: { "Content-Type": "application/json" }
    });
        const data = await response.json();
        result = data
    } finally {
        return result
    }
};

updateLang();

select_lang_menu.addEventListener("change",function(){
    lang=select_lang_menu.value;
    localStorage.setItem("lang",lang);
    const flag_img = document.getElementById("header-lang-flag-holder");
    flag_img.innerHTML=`<img id="header-lang-flag" src="https://flagicons.lipis.dev/flags/4x3/${lang.split("_")[1]}.svg" alt="${lang} flag"/>`;
    updateLang();
});