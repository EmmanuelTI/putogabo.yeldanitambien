document.addEventListener('DOMContentLoaded', function () {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active class from all buttons and contents
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Predictive search functionality
    const predictiveInput = document.getElementById('predictiveInput');
    const askPredictiveBtn = document.getElementById('askPredictiveBtn');

    askPredictiveBtn.addEventListener('click', fetchPredictiveData);
    predictiveInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            fetchPredictiveData();
        }
    });

    // Initialize charts
    const salesPredictionCtx = document.getElementById('salesPredictionChart').getContext('2d');
    const salesPredictionChart = new Chart(salesPredictionCtx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Predicción de Ventas' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    const trendingProductsCtx = document.getElementById('trendingProductsChart').getContext('2d');
    const trendingProductsChart = new Chart(trendingProductsCtx, {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Productos en Tendencia' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Load initial data
    loadInitialPredictiveData();

    async function loadInitialPredictiveData() {
        try {
            // Load sales prediction (ahora con POST)
            const salesRes = await fetch('http://localhost:3001/api/predict/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) // Envía un objeto vacío si el endpoint no requiere parámetros
            });

            if (!salesRes.ok) {
                const errorData = await salesRes.text();
                throw new Error(`Error ${salesRes.status}: ${errorData}`);
            }

            const salesData = await salesRes.json();
            updateSalesPrediction(salesData);

            // Load churn data (también con POST)
            const churnRes = await fetch('http://localhost:3001/api/predict/churn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!churnRes.ok) {
                const errorData = await churnRes.text();
                throw new Error(`Error ${churnRes.status}: ${errorData}`);
            }

            const churnData = await churnRes.json();
            updateChurnAnalysis(churnData);

            // Load trending products (también con POST)
            const productsRes = await fetch('http://localhost:3001/api/predict/trending-products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!productsRes.ok) {
                const errorData = await productsRes.text();
                throw new Error(`Error ${productsRes.status}: ${errorData}`);
            }

            const productsData = await productsRes.json();
            updateTrendingProducts(productsData);

        } catch (error) {
            console.error('Error loading initial predictive data:', error);
            // Muestra el error en la interfaz
            document.getElementById('salesInsights').innerHTML = `
            <div class="error">
                <p>Error al cargar datos iniciales</p>
                <p>${error.message}</p>
            </div>
        `;
        }
    }

    async function fetchPredictiveData() {
        const prompt = predictiveInput.value.trim();
        if (!prompt) return;

        try {
            // Mostrar estado de carga
            askPredictiveBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';

            // Paso 1: Interpretar el prompt
            const interpretRes = await fetch('http://localhost:3001/api/interpret-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!interpretRes.ok) {
                throw new Error(`HTTP error! status: ${interpretRes.status}`);
            }

            const { key } = await interpretRes.json();

            // Paso 2: Redirigir a la pestaña correspondiente y cargar datos
            switch (key) {
                case 'prediccion_ventas':
                    document.querySelector('.tab-btn[data-tab="sales"]').click();
                    const salesRes = await fetch('http://localhost:3001/api/predict/sales');
                    const salesData = await salesRes.json();
                    updateSalesPrediction(salesData);
                    break;

                case 'clientes_riesgo_abandono':
                    document.querySelector('.tab-btn[data-tab="customers"]').click();
                    const churnRes = await fetch('http://localhost:3001/api/predict/churn');
                    const churnData = await churnRes.json();
                    updateChurnAnalysis(churnData);
                    break;

                case 'productos_tendencia':
                    document.querySelector('.tab-btn[data-tab="products"]').click();
                    const productsRes = await fetch('http://localhost:3001/api/predict/trending-products');
                    const productsData = await productsRes.json();
                    updateTrendingProducts(productsData);
                    break;

                default:
                    alert('No reconozco esa solicitud. Prueba con:\n- "predecir ventas"\n- "clientes en riesgo"\n- "productos populares"');
            }

        } catch (error) {
            console.error('Error fetching predictive data:', error);
            alert('Error al procesar tu solicitud. Verifica que el servidor esté funcionando.');
        } finally {
            // Restaurar botón
            askPredictiveBtn.innerHTML = '<i class="bx bx-send"></i>';
        }
    }

    function updateSalesPrediction(data) {
        // Si los datos vienen en el formato de /api/chat (como en Postman)
        if (data.tipo === 'prediccion_ventas') {
            // Convertimos los datos históricos a formato de gráfico
            const historicalData = data.datos.map(item => ({
                month: `${item.Year}-${item.Month.toString().padStart(2, '0')}`,
                value: item.TotalSales
            }));

            // Actualizar gráfico con datos históricos
            salesPredictionChart.data.labels = historicalData.map(item => item.month);
            salesPredictionChart.data.datasets = [{
                label: 'Ventas Históricas',
                data: historicalData.map(item => item.value),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }];
            salesPredictionChart.update();

            // Mostrar mensaje para pedir predicción
            document.getElementById('salesInsights').innerHTML = `
            <h5>Datos Históricos Cargados</h5>
            <p>Escribe "predecir ventas" para obtener una proyección</p>
        `;
            return;
        }

        // Si los datos vienen del endpoint predictivo
        salesPredictionChart.data.labels = data.map(item => item.month);
        salesPredictionChart.data.datasets = [{
            label: 'Ventas',
            data: data.map(item => item.value),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: true
        }];
        salesPredictionChart.update();

        // Update insights
        const insightsContainer = document.getElementById('salesInsights');
        insightsContainer.innerHTML = `
        <h5>Insights Clave:</h5>
        <ul>
            <li>Nivel de confianza: ${data.confidence}</li>
            <li>Crecimiento esperado: ${data.growthRate}%</li>
            <li>Factores clave: ${data.keyFactors.join(', ')}</li>
        </ul>
    `;
    }

    function updateChurnAnalysis(data) {
        const tableBody = document.querySelector('#churnTable tbody');
        tableBody.innerHTML = '';

        // Add high risk customers
        data.alto_riesgo.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.FirstName} ${customer.LastName}</td>
                <td>${new Date(customer.LastOrderDate).toLocaleDateString()}</td>
                <td class="risk-high">Alto</td>
                <td><button class="action-btn" data-id="${customer.CustomerID}">Contactar</button></td>
            `;
            tableBody.appendChild(row);
        });

        // Add medium risk customers
        data.medio_riesgo.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.FirstName} ${customer.LastName}</td>
                <td>${new Date(customer.LastOrderDate).toLocaleDateString()}</td>
                <td class="risk-medium">Medio</td>
                <td><button class="action-btn" data-id="${customer.CustomerID}">Oferta</button></td>
            `;
            tableBody.appendChild(row);
        });

        // Add low risk customers
        data.bajo_riesgo.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.FirstName} ${customer.LastName}</td>
                <td>${new Date(customer.LastOrderDate).toLocaleDateString()}</td>
                <td class="risk-low">Bajo</td>
                <td><button class="action-btn" data-id="${customer.CustomerID}">Monitorear</button></td>
            `;
            tableBody.appendChild(row);
        });

        // Update strategies
        const strategiesContainer = document.getElementById('retentionStrategies');
        strategiesContainer.innerHTML = `
            <h5>Estrategias de Retención:</h5>
            <div class="strategy-section">
                <h6>Alto Riesgo:</h6>
                <ul>
                    ${data.estrategias.alto_riesgo.map(strat => `<li>${strat}</li>`).join('')}
                </ul>
            </div>
            <div class="strategy-section">
                <h6>Medio Riesgo:</h6>
                <ul>
                    ${data.estrategias.medio_riesgo.map(strat => `<li>${strat}</li>`).join('')}
                </ul>
            </div>
            <div class="strategy-section">
                <h6>Bajo Riesgo:</h6>
                <ul>
                    ${data.estrategias.bajo_riesgo.map(strat => `<li>${strat}</li>`).join('')}
                </ul>
            </div>
        `;

        // Add event listeners to action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const customerId = this.getAttribute('data-id');
                alert(`Acción para cliente ID: ${customerId}`);
            });
        });
    }

    function updateTrendingProducts(data) {
        // Update chart
        trendingProductsChart.data.labels = data.top_products.map(p => p.name);
        trendingProductsChart.data.datasets = [{
            label: 'Ventas Proyectadas',
            data: data.top_products.map(p => p.projected_sales),
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }];
        trendingProductsChart.update();

        // Update product list
        const productsList = document.getElementById('trendingProductsList');
        productsList.innerHTML = '';

        data.top_products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <h5>${product.name}</h5>
                <p>ID: ${product.product_id}</p>
                <p>Ventas proyectadas: $${product.projected_sales.toLocaleString()}</p>
                <p>Crecimiento: ${product.growth_rate}%</p>
                <p>Confianza: ${product.confidence}</p>
            `;
            productsList.appendChild(card);
        });
    }
});