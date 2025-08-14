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