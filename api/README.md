# PASTANETWORK WIKI MANAGER - PUBLIC API

---

## Articles

### [/api/v1/articles/all]() - GET :

- 200 : 
```json
{"data":[
    {
    "title":"Configurer son serveur",
    "title_urlized":"configurer_son_serveur",
    "category":"Tutoriels","category_urlized":"tutoriels",
    "lang":"fr_fr","content":"",
    "enabled":true // shown only if user has permission, else article will not be send.
    },{...}
]};
```

### [/api/v1/articles/:lang]() - GET :

Take a lang code in parameter (en_us, fr_fr, de_de, es_es,.. ).

- 200 :

```json
{"data":[
    {
    "title":"Configurer son serveur",
    "title_urlized":"configurer_son_serveur",
    "category":"Tutoriels","category_urlized":"tutoriels",
    "lang":"fr_fr","content":"",
    "enabled":true // shown only if user has permission, else article will not be send.
    },{...}
]};
```
- 404 : 

```json
{"data":"Error : No article found with [lang_code] as language"}
```

---

## Categories

### [/api/v1/categories/all]() - GET :

- 200 : 
```json
{"data":[
    {
    "title":"Tutoriels",
    "title_urlized":"tutoriels",
    "lang":"fr_fr","articles_nb":"1",
    "enabled":true // shown only if user has permission, else article will not be send.
    },{...}
]}
```

### [/api/v1/categories/lang/:lang]() - GET :

Take a lang code in parameter (en_us, fr_fr, de_de, es_es,.. ).

- 200 :

```json
{"data":[
    {
    "title":"Tutoriels",
    "title_urlized":"tutoriels",
    "lang":"fr_fr",
    "articles_nb":"1",
    "enabled":true // shown only if user has permission, else article will not be send.
    },{...}
]}
```
- 404 : 

```json
{"data":"Error : No category found with [lang_code] as language"}
```

### [/api/v1/categories/get-langs]() - GET :

- 200 :

```json
{"data":[
    {
    "lang":{
        "name":"English (US)",
        "code":"en_us"
    }
    },{...}
]}
```