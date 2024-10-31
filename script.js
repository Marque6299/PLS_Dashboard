document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggle-btn");

    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });

    if (document.getElementById("ahtChart")) {
        fetch('https://marque6299.github.io/PLS_Dashboard/data.json')
            .then(response => response.json())
            .then(data => {
                const ahtData = {};
                
                data.raw.forEach(record => {
                    const date = record.Date;
                    const handleCount = record["Handle Count"];
                    const aht = record.AHT;

                    // Calculate Talk Time
                    const totalTalkTime = aht * handleCount;

                    // Calculate Daily AHT: Sum(TotalTalkTime / Handle Count)
                    if (!ahtData[date]) {
                        ahtData[date] = { totalTalkTime: 0, totalHandleCount: 0 };
                    }
                    ahtData[date].totalTalkTime += totalTalkTime;
                    ahtData[date].totalHandleCount += handleCount;
                });

                // Prepare data for chart
                const labels = Object.keys(ahtData);
                const ahtValues = labels.map(date => {
                    const { totalTalkTime, totalHandleCount } = ahtData[date];
                    return totalTalkTime / totalHandleCount;
                });

                // Render chart
                const ctx = document.getElementById("ahtChart").getContext("2d");
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Daily AHT',
                            data: ahtValues,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: true,
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Date'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'AHT (in seconds)'
                                },
                                beginAtZero: true
                            }
                        }
                    }
                });
            })
            .catch(error => console.error("Error loading data:", error));
    }
});
