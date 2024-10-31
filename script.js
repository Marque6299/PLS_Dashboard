document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggle-btn");
    const locationFilter = document.getElementById("location-filter");
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const filterBtn = document.getElementById("filter-btn");

    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });

    let chartInstance;
    let ahtData = {};  // Store raw data

    function formatDate(date) {
        const options = { day: '2-digit', month: 'short' };
        return new Date(date).toLocaleDateString('en-GB', options).replace(',', '');
    }

    function getCurrentMonthRange() {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { firstDay, lastDay };
    }

    function initializeDateInputs() {
        const { firstDay, lastDay } = getCurrentMonthRange();
        startDateInput.value = firstDay.toISOString().split('T')[0];
        endDateInput.value = lastDay.toISOString().split('T')[0];
    }

    function populateLocationFilter(data) {
        const locations = [...new Set(data.raw.map(record => record.Location))];
        locations.forEach(location => {
            const option = document.createElement("option");
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    }

    function filterAndDisplayData() {
        const selectedLocation = locationFilter.value;
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        const filteredData = {};

        Object.keys(ahtData).forEach(date => {
            const recordDate = new Date(date);
            if (
                recordDate >= startDate &&
                recordDate <= endDate &&
                (selectedLocation === 'all' || ahtData[date].locations.includes(selectedLocation))
            ) {
                filteredData[date] = ahtData[date];
            }
        });

        updateChart(filteredData);
    }

    function updateChart(data) {
        const labels = Object.keys(data).map(formatDate);
        const ahtValues = labels.map(date => {
            const { totalTalkTime, totalHandleCount } = data[date];
            return totalTalkTime / totalHandleCount;
        });

        if (chartInstance) {
            chartInstance.destroy();
        }

        const ctx = document.getElementById("ahtChart").getContext("2d");
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
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
    }

    // Fetch JSON data, populate filters, and initialize chart
    fetch('https://marque6299.github.io/PLS_Dashboard/data.json')
        .then(response => response.json())
        .then(data => {
            // Store raw data
            ahtData = {};

            // Calculate AHT per date and populate location filter
            data.raw.forEach(record => {
                const date = record.Date;
                const location = record.Location;
                const handleCount = record["Handle Count"];
                const aht = record.AHT;
                const totalTalkTime = aht * handleCount;

                if (!ahtData[date]) {
                    ahtData[date] = { totalTalkTime: 0, totalHandleCount: 0, locations: new Set() };
                }
                ahtData[date].totalTalkTime += totalTalkTime;
                ahtData[date].totalHandleCount += handleCount;
                ahtData[date].locations.add(location);
            });

            // Convert locations to arrays
            Object.keys(ahtData).forEach(date => ahtData[date].locations = Array.from(ahtData[date].locations));

            // Populate location filter and initialize date inputs
            populateLocationFilter(data);
            initializeDateInputs();

            // Initial chart render
            filterAndDisplayData();
        })
        .catch(error => console.error("Error loading data:", error));

    // Apply filter on button click
    filterBtn.addEventListener("click", filterAndDisplayData);
});
