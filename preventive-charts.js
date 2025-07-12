// preventive-charts.js
// Sistema de Gráficos de Preventivas (Barras) - Dashboard STTE
// Versão: 1.1.0
// Usando Chart.js

class PreventiveCharts {
    constructor() {
        this.charts = {
            regiao: null,
            tipoSite: null,
            fase: null,
            criticidade: null,
            sla: null
        };
        this.currentData = [];
    }

    // Inicializar sistema de gráficos
    init(data) {
        this.currentData = data || [];
        this.loadChartJS();
        this.createChartContainers();
    }

    // Carregar Chart.js via CDN
    loadChartJS() {
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
            script.onload = () => {
                setTimeout(() => this.createCharts(), 100);
            };
            document.head.appendChild(script);
        } else {
            setTimeout(() => this.createCharts(), 100);
        }
    }

    // Criar containers para os gráficos
    createChartContainers() {
        const section = document.createElement('div');
        section.id = 'preventiveChartsSection';
        section.className = 'charts-section';
        section.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6"><div class="chart-card"><h5>Preventivas por Região</h5><div class="chart-container"><canvas id="regiaoChart"></canvas></div></div></div>
                <div class="col-md-6"><div class="chart-card"><h5>Preventivas por Tipo de Site</h5><div class="chart-container"><canvas id="tipoSiteChart"></canvas></div></div></div>
            </div>
            <div class="row mb-4">
                <div class="col-md-6"><div class="chart-card"><h5>Preventivas por Fase</h5><div class="chart-container"><canvas id="faseChart"></canvas></div></div></div>
                <div class="col-md-6"><div class="chart-card"><h5>Preventivas por Criticidade</h5><div class="chart-container"><canvas id="criticidadeChart"></canvas></div></div></div>
            </div>
            <div class="row mb-4">
                <div class="col-md-6"><div class="chart-card"><h5>Preventivas por Status do SLA</h5><div class="chart-container"><canvas id="slaChart"></canvas></div></div></div>
            </div>
        `;
        document.body.appendChild(section);
    }

    // Criar todos os gráficos
    createCharts() {
        this.createBarChart('regiao', 'regiaoChart', 'Região', 'Quantidade', this.getCountData('Região'));
        this.createBarChart('tipoSite', 'tipoSiteChart', 'Tipo de Site', 'Quantidade', this.getCountData('Tipo Site'));
        this.createBarChart('fase', 'faseChart', 'Fase', 'Quantidade', this.getCountData('Fase'));
        this.createBarChart('criticidade', 'criticidadeChart', 'Criticidade', 'Quantidade', this.getCountData('Criticidade'));
        this.createBarChart('sla', 'slaChart', 'Status do SLA', 'Quantidade', this.getCountData('SLA'));
    }

    // Função genérica para criar gráfico de barras
    createBarChart(key, canvasId, labelX, labelY, { labels, values }) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        if (this.charts[key]) this.charts[key].destroy();
        this.charts[key] = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: labelY,
                    data: values,
                    backgroundColor: '#0073aa',
                    borderColor: '#005a87',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: labelX },
                        ticks: { maxRotation: 45, minRotation: 0 }
                    },
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: labelY }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart',
                    delay: function(context) { return context.dataIndex * 50; }
                }
            }
        });
    }

    // Função para contar ocorrências de um campo
    getCountData(field) {
        const map = {
            'Região': 'regiao',
            'Tipo Site': 'tipoSite',
            'Fase': 'fase',
            'Criticidade': 'criticidade',
            'SLA': 'sla'
        };
        const key = map[field] || field;
        const count = {};
        this.currentData.forEach(item => {
            const value = (item[field] || item[key] || '').toString().trim() || 'Não Informado';
            count[value] = (count[value] || 0) + 1;
        });
        const labels = Object.keys(count);
        const values = Object.values(count);
        return { labels, values };
    }
}

// Exemplo de uso:
// const preventiveCharts = new PreventiveCharts();
// preventiveCharts.init(arrayDeDadosPreventivas);

window.PreventiveCharts = PreventiveCharts; 