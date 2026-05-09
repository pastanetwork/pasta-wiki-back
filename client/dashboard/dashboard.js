import { displayGraphDonut } from "/public/apexCharts.js";
import { fetchData } from "/public/global.js";

const category_count_el = document.getElementById("category-count");
const article_count_el = document.getElementById("article-count");

async function initDashboard() {
	try {
		const [categories_data, articles_data] = await Promise.all([
			fetchData("/api/v1/categories/all"),
			fetchData("/api/v1/articles/all"),
		]);

		if (categories_data?.data) {
			category_count_el.textContent = ` (${categories_data.data.length}) :`;
			displayGraphDonut(categories_data.data, "lang", "#graph-1");
		}

		if (articles_data?.data) {
			article_count_el.textContent = ` (${articles_data.data.length}) :`;
			displayGraphDonut(articles_data.data, "lang", "#graph-2");
			displayGraphDonut(articles_data.data, "category", "#graph-3");
		}
	} catch (error) {
		console.error("Erreur lors du chargement du tableau de bord :", error);
	}
}

initDashboard();