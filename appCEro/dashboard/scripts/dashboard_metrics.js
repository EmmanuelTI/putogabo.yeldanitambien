async function loadDashboardMetrics() {
    try {
        const res = await fetch("http://localhost:5000/api/sql/dashboard/metrics");
        const data = await res.json();
        console.log(data);

        // --- Actualizar cards de prog-status ---
        const totalRevenueEl = document.querySelector('.prog-status .details .item:nth-child(1) h2');
        const avgOrderEl = document.querySelector('[data-metric="avg-order"] h2');
        const metaAnualEl = document.querySelector('.prog-status .details .item:last-child h2');
        const multi = (data.salesMetrics.avgOrderValue * data.salesMetrics.totalOrders);
        console.log(multi);

        console.log("Elementos encontrados:", {
            totalRevenueEl,
            avgOrderEl,
            metaAnualEl
        });

// Asignación de valores (con verificación de null)
if (totalRevenueEl) {
  totalRevenueEl.textContent = `$${data.salesMetrics.totalRevenue.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
} else {
  console.error("No se encontró totalRevenueEl");
}

if (avgOrderEl) {
  avgOrderEl.textContent = `$${data.salesMetrics.avgOrderValue.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
} else {
  console.error("No se encontró avgOrderEl. Selector usado: '.prog-status .details .item:nth-of-type(2) h2'");
}

if (metaAnualEl) {
  metaAnualEl.textContent = `$${data.salesMetrics.totalRevenue.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
} else {
  console.error("No se encontró metaAnualEl");
}

        // --- Gráfica top products ---
        const topProductsCtx = document.createElement('canvas');
        topProductsCtx.id = 'topProductsChart';
        document.querySelector('.prog-status').appendChild(topProductsCtx);

        const productLabels = data.topProducts.map(p => p.productName);
        const productValues = data.topProducts.map(p => p.totalRevenue);

        new Chart(topProductsCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: productLabels,
                datasets: [{
                    label: 'Ingresos por Producto',
                    data: productValues,
                    backgroundColor: productLabels.map(() => 'rgba(99, 132, 255, 0.6)'),
                    borderColor: productLabels.map(() => 'rgba(99, 132, 255, 1)'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Top Productos por Ingreso'
                    }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // --- Gráfica geográfica (pastel) ---
        const geoCanvas = document.createElement('canvas');
        geoCanvas.id = 'geoChart';
        document.querySelector('.prog-status').appendChild(geoCanvas);

        const geoLabels = data.geographicData.map(g => `${g.StateProvince}, ${g.CountryRegion}`);
        const geoValues = data.geographicData.map(g => g.totalRevenue);

        new Chart(geoCanvas.getContext('2d'), {
            type: 'pie',
            data: {
                labels: geoLabels,
                datasets: [{
                    label: 'Ingresos por Región',
                    data: geoValues,
                    backgroundColor: geoLabels.map(() => `hsl(${Math.random() * 360}, 70%, 60%)`)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Distribución de Ventas por Región' }
                }
            }
        });

        // --- Actualizar tabla de eventos comerciales con recentOrders ---
        const eventsContainer = document.querySelector('.upcoming .events');
        if (eventsContainer) {
            eventsContainer.innerHTML = ''; // limpiar estático
            data.recentOrders.forEach(order => {
                const div = document.createElement('div');
                div.classList.add('item');
                div.innerHTML = `
                    <div>
                        <i class='bx bx-time'></i>
                        <div class="event-info">
                            <a href="#">${order.customerName}</a>
                            <p>${new Date(order.OrderDate).toLocaleDateString('es-MX')} - $${order.TotalDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    <i class='bx bx-dots-horizontal-rounded'></i>
                `;
                eventsContainer.appendChild(div);
            });
        }

    } catch (err) {
        console.error("Error cargando métricas del dashboard:", err);
    }
}

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardMetrics();
});
