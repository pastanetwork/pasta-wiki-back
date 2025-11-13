let lang = localStorage.getItem("lang") || "en_us";

const icons = {
    user:`<svg xmlns="http://www.w3.org/2000/svg" id="user-logo-header" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/></svg>`,
    administration:`<svg xmlns="http://www.w3.org/2000/svg" id="administration-logo-header" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6.5a.5.5 0 0 1-1 0V1H3v14h3v-2.5a.5.5 0 0 1 .5-.5H8v4H3a1 1 0 0 1-1-1z"/><path d="M4.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM9 13a1 1 0 0 1 1-1v-1a2 2 0 1 1 4 0v1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm3-3a1 1 0 0 0-1 1v1h2v-1a1 1 0 0 0-1-1"/></svg>`,
}

const header = document.querySelector("header")
header.innerHTML=`<div class='flex-al-it-center'><a href='/' class='flex-al-it-center'><img id='pasta-logo-header' src='/public/pasta_logo.svg' alt='Logo Pastanetwork'><h1>Pastanetwork Wiki Manager</h1></a></div><div class='flex-al-it-center' id='header-comp-right'><div class="flex-al-it-center"><div id="header-lang-flag-holder"><img id="header-lang-flag" src="https://flagicons.lipis.dev/flags/4x3/${lang.split("_")[1]}.svg" alt="${lang} flag"/></div><select id="header-select-lang"></select></div><nav id="header-icons-nav"></nav></div>`

const select_lang_menu = document.getElementById("header-select-lang");

async function verifAdmin(){
    const nav_icons = document.getElementById("header-icons-nav");
    let dom ="";
    try{
        const response = await fetch("/api/v1/users/is-admin");
        if (response.ok){
            dom+=`<a href="/administration">${icons.administration}</a>`
        }
    } finally {
        dom+=`<a href="/profil">${icons.user}</a>`
        nav_icons.innerHTML=dom;
    }
}

verifAdmin();

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