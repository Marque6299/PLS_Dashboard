document.addEventListener("DOMContentLoaded,",
    function () {
        fetch('sample.csv')
        .then(response => response.text())
        .then(csv => {
            salesData = parseCSV(csv);
            updateChart(salesData);
    });
})

let salesData = [];
let chart;


function parseCSV(csv) {
    const lines = cvs.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line =>{
        const fields = lines.split(',');
        return headers.reduce((obj, header , index) =>
        {obj[header]= fields[index];
            return obj;        
        }, {});
    });
}

function updateChart(data) {
    const labels = data.map(d => d.date);
    const sales = data.map(d => +d.sales);

    const ctx=
    document.getElementById('salesChart').getContext('2d');


    if (chart) chart.destroy();

    chart = new Chart(ctx,{
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales',
                data: sales,
                borderColor: '#007bff',
                backgroundcolor: 'rgba(0, 123, 255, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {title: { display: true, text:'Date'}},
                y: {title: { display: true, text: 'Sales'}}
            }
        }
    });
}

function filterData(criteria){
    let filteredData;

    if (criteria === 'all') {
        filteredData = salesData;
    } else if (criteria === 'region1') {
        filteredData = salesData.filter(d => d.region === 'region1');
    } else if (criteria === 'region2') {
        filteredData = salesData.filter(d => d.region === 'region2');
    } else if (criteria === 'productA') {
        filteredData = salesData.filter(d => d.region === 'productA');
    } else if (criteria === 'productB') {
        filteredData = salesData.filter(d => d.region === 'productB');
    }

    updateChart(filteredData);

}