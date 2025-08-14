// Función para formatear números como moneda o número normal
function formatValue(value, isCurrency = false) {
    if (isCurrency) {
        return `$${Number(value).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })} MXN`;
    }
    return Number(value).toLocaleString("es-MX");
}

// Función para crear un item HTML con estado inicial
function createItemElement(title, icon) {
    const item = document.createElement("div");
    item.classList.add("item");
    item.innerHTML = `
        <div class="info">
            <div>
                <h5>${title}</h5>
                <p>- Cargando...</p>
            </div>
            <i class='bx ${icon}'></i>
        </div>
    `;
    return item;
}

// Función que llama al endpoint y devuelve el valor correcto según la clave
async function fetchMetricByKey(queryKey) {
    const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: queryKey })
    });
    const data = await res.json();
    console.log("Item", data);

    if (!data.datos || data.datos.length === 0) return 0;

    // Si el tipo es promedio_dias_envio, dibujamos gráfica
    if (data.tipo === "promedio_dias_envio") {
        drawDiasEnvioChart(data.datos);
        // En este caso, podrías devolver el promedio
        const promedio = data.datos.reduce((acc, obj) => acc + obj.DiasParaEnvio, 0) / data.datos.length;
        return promedio;
    }

    const row = data.datos[0];

    switch (queryKey) {
        case "promedio_valor_pedido":
            return row.PromedioValorPedido;
        case "ventas_por_anio":
            return row.TotalVenta;
        case "nuevos_clientes_ultimo_ano":
            return row.NuevosClientesUltimoAno;
        default:
            return 0;
    }
}

function drawDiasEnvioChart(datos) {
    const ctx = document.getElementById("diasEnvioChart").getContext("2d");

    // Extraemos datos
    const labels = datos.map(d => d.SalesOrderID);
    const values = datos.map(d => d.DiasParaEnvio);

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Días para Envío",
                data: values,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // barras horizontales
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: "Días para Envío por Orden"
                }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

// Configuración de items
const metrics = [
    {
        title: "Ingresos Promedio por Pedido",
        queryKey: "promedio_valor_pedido",
        icon: "bx-line-chart",
        isCurrency: true
    },
    {
        title: "Total de Ventas por Año",
        queryKey: "ventas_por_anio",
        icon: "bx-package",
        isCurrency: true
    },
    {
        title: "Nuevos Clientes Último Año",
        queryKey: "nuevos_clientes_ultimo_ano",
        icon: "bx-user-plus",
        isCurrency: false
    },
    {
        title: "Promedio de Días para Envío",
        queryKey: "promedio_dias_envio",
        icon: "bx-time-five",
        isCurrency: false
    }
];


// Render inicial con estado "Cargando..."
(function initializeItems() {
    const container = document.getElementById("items-container");
    metrics.forEach(m => {
        const itemEl = createItemElement(m.title, m.icon);
        container.appendChild(itemEl);
        m.element = itemEl; // Guardamos referencia para actualizar luego
    });
})();

// Llenar los items uno por uno
(async function loadMetricsSequentially() {
    for (let m of metrics) {
        const value = await fetchMetricByKey(m.queryKey);
        const currentText = formatValue(value, m.isCurrency);

        // Actualizar el <p> del item
        const p = m.element.querySelector("p");
        if (p) p.textContent = `- ${currentText}`;

    }
})();