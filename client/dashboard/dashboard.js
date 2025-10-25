import { displayGraphDonut } from "/public/apexCharts.js";
import { fetchData } from "/public/global.js"

const categories_data = await fetchData("/api/v1/categories/all");
const articles_data = await fetchData("/api/v1/articles/all");

displayGraphDonut(categories_data.data,"lang","#graph-1");
displayGraphDonut(articles_data.data,"lang","#graph-2");
displayGraphDonut(articles_data.data,"category","#graph-3");

const category_count_el = document.getElementById("category-count");
const article_count_el = document.getElementById("article-count");

category_count_el.innerText=` (${categories_data.data.length}) :`
article_count_el.innerText=` (${articles_data.data.length}) :`