export async function displayGraphDonut(list,filter_param,tag_id){
    let series_obj = {};
    for (let el of list){
        if (!series_obj[el[filter_param]]){
            series_obj[el[filter_param]]=0
        }
        series_obj[el[filter_param]]+=1
    }
    let series = [];
	let labels = [];
    for (let el in series_obj){
		labels.push(el)
        series.push(series_obj[el])
    }
    const options = {
        series: series,
		labels: labels,
        chart: {
            type: 'donut',
        },
        legend: {
            labels: {
                colors: '#ffffff'
            },
            position: 'bottom'
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    const chart = new ApexCharts(document.querySelector(tag_id), options);
    chart.render();
}
