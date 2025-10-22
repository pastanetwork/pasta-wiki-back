(()=>{
    let lang = "fr_fr"

    const header = document.querySelector("header")
    header.innerHTML="<a href='/' class='flex-al-it-center'><img id='pasta-logo-header' src='/public/pasta_logo.svg' alt='Logo Pastanetwork'><h1>Pastanetwork wiki editor</h1></a>"

    async function updateLang(){
        const translatable_elements = document.querySelectorAll("[data-traduction]");
        const translations = await fetchData("/api/v1/client-langs");
        for (let el of translatable_elements){
            for (trad in translations){
                if (el.dataset.traduction == trad ){
                    el.innerText = translations[trad]?.[lang];
                }
            }
        }
    }

    async function fetchData(url) {
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
})();

