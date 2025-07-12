// Sistema de Gráficos - Dashboard de Acionamentos STTE
// Versão: 3.0.0
// Usando Chart.js

class DashboardCharts {
    constructor() {
        this.charts = {
            sites: null,
            tecnicos: null,
            sla: null,
            tiposFalha: null,
            regioes: null,
            criticidade: null,
            evolucaoTemporal: null,
            concessionarias: null
        };
        this.currentData = [];
        this.isChartsMode = false;
    }

    // Inicializar sistema de gráficos
    init() {
        this.loadChartJS();
        this.createChartContainers();
        this.setupEventListeners();
    }

    // Carregar Chart.js via CDN
    loadChartJS() {
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
            script.onload = () => {
        
                setTimeout(() => this.createCharts(), 100);
            };
            script.onerror = () => {
                console.error('❌ Erro ao carregar Chart.js');
            };
            document.head.appendChild(script);
        } else {
            setTimeout(() => this.createCharts(), 100);
        }
    }

    // Criar containers para os gráficos
    createChartContainers() {
        const dashboardContent = document.getElementById('dashboard');
        if (!dashboardContent) return;

        // Criar seção de gráficos
        const chartsSection = document.createElement('div');
        chartsSection.id = 'chartsSection';
        chartsSection.className = 'charts-section d-none';
        chartsSection.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="chart-card">
                        <h5><i class="fas fa-exclamation-triangle"></i> Sites que Mais Tiveram Falha</h5>
                        <div class="chart-container">
                            <canvas id="sitesChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="chart-card">
                        <h5><i class="fas fa-user-cog"></i> Técnicos que Mais Tiveram Acionamento</h5>
                        <div class="chart-container">
                            <canvas id="tecnicosChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="chart-card">
                        <h5><i class="fas fa-bolt"></i> Tipos de Falha Mais Comuns</h5>
                        <div class="chart-container">
                            <canvas id="tiposFalhaChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="chart-card">
                        <h5><i class="fas fa-map-marker-alt"></i> Acionamentos por Região</h5>
                        <div class="chart-container">
                            <canvas id="regioesChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="chart-card">
                        <h5><i class="fas fa-exclamation-circle"></i> Distribuição por Criticidade</h5>
                        <div class="chart-container">
                            <canvas id="criticidadeChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="chart-card">
                        <h5><i class="fas fa-building"></i> Acionamentos por Concessionária</h5>
                        <div class="chart-container">
                            <canvas id="concessionariasChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="chart-card">
                        <h5><i class="fas fa-clock"></i> SLAs Perdidas vs Cumpridas</h5>
                        <div class="chart-container">
                            <canvas id="slaChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="chart-card">
                        <h5><i class="fas fa-chart-line"></i> Evolução Temporal dos Acionamentos</h5>
                        <div class="chart-container">
                            <canvas id="evolucaoTemporalChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Inserir após os filtros (que agora estão abaixo dos KPIs)
        const filtersRow = dashboardContent.querySelector('.row.mb-4:nth-child(2)');
        if (filtersRow) {
            filtersRow.parentNode.insertBefore(chartsSection, filtersRow.nextSibling);
        } else {
            // Fallback: inserir no final do dashboard
            dashboardContent.appendChild(chartsSection);
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Listener para mudança de dados
        window.addEventListener('dashboardDataUpdated', () => {
            if (this.isChartsMode) {
                setTimeout(() => {
                    this.updateCharts();
                }, 100);
            }
        });
        
        // Listener para quando os dados são carregados
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (window.dashboardData && window.dashboardData.length > 0) {
                    this.currentData = window.dashboardData;
                }
            }, 1000);
        });
    }

    // Alternar entre modo tabela e gráficos
    toggleMode() {
        this.isChartsMode = !this.isChartsMode;
        
        const dashboardContent = document.getElementById('dashboard');
        // Usar ID específico para a seção da tabela
        const tableSection = document.getElementById('tableSection');
        const chartsSection = document.getElementById('chartsSection');
        const dashboardButton = document.querySelector('.nav-link[href="#dashboard"], .nav-link[href="#acionamentos"]');
        
        if (this.isChartsMode) {
            // Mostrar gráficos - esconder apenas a tabela
            if (tableSection) {
                tableSection.style.display = 'none';
            }
            if (chartsSection) {
                chartsSection.classList.remove('d-none');
            }
            if (dashboardButton) {
                dashboardButton.innerHTML = '<i class="fas fa-table"></i> Acionamentos';
                dashboardButton.setAttribute('href', '#acionamentos');
            }
            this.updateCharts();
        } else {
            // Mostrar tabela - esconder apenas os gráficos
            if (tableSection) {
                tableSection.style.display = 'block';
            }
            if (chartsSection) {
                chartsSection.classList.add('d-none');
            }
            if (dashboardButton) {
                dashboardButton.innerHTML = '<i class="fas fa-chart-line"></i> Dashboard';
                dashboardButton.setAttribute('href', '#dashboard');
            }
        }
    }

    // Criar todos os gráficos
    createCharts() {
        setTimeout(() => {
            this.createSitesChart();
            this.createTecnicosChart();
            this.createSLAChart();
            this.createTiposFalhaChart();
            this.createRegioesChart();
            this.createCriticidadeChart();
            this.createConcessionariasChart();
            this.createEvolucaoTemporalChart();
        }, 200);
    }

    // Gráfico de Sites que Mais Tiveram Falha (Line Chart)
    createSitesChart() {
        const canvas = document.getElementById('sitesChart');
        if (!canvas) {
            console.warn('❌ Canvas sitesChart não encontrado');
            return;
        }

        try {
            this.charts.sites = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Quantidade de Falhas',
                        data: [],
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.2)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ff6b6b',
                        pointBorderColor: '#e53935',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    return `${label}: ${value} acionamentos`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Sites'
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 0
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantidade de Acionamentos'
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart',
                        delay: function(context) {
                            return context.dataIndex * 100;
                        }
                    }
                }
            });
            
            canvas.parentElement.classList.add('loaded');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de Sites:', error);
        }
    }

    // Gráfico de Técnicos que Mais Tiveram Acionamento (Barras Verticais)
    createTecnicosChart() {
        const canvas = document.getElementById('tecnicosChart');
        if (!canvas) {
            console.warn('❌ Canvas tecnicosChart não encontrado');
            return;
        }

        try {
            this.charts.tecnicos = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Quantidade de Acionamentos',
                        data: [],
                        backgroundColor: '#0073aa',
                        borderColor: '#005a87',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    return `${label}: ${value} vezes`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                maxRotation: 45,
                                minRotation: 0
                            },
                            title: {
                                display: true,
                                text: 'Técnicos'
                            }
                        },
                        y: {
                            type: 'linear',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantidade de Acionamentos'
                            },
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    return Math.floor(value);
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart',
                        delay: function(context) {
                            return context.dataIndex * 100;
                        }
                    }
                }
            });
            
            canvas.parentElement.classList.add('loaded');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de Técnicos:', error);
        }
    }

    // Gráfico de SLAs Perdidas vs Cumpridas (Barras Agrupadas)
    createSLAChart() {
        const canvas = document.getElementById('slaChart');
        if (!canvas) {
            console.warn('❌ Canvas slaChart não encontrado');
            return;
        }

        try {
            this.charts.sla = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'SLAs Cumpridas',
                            data: [],
                            backgroundColor: '#28a745',
                            borderColor: '#1e7e34',
                            borderWidth: 1
                        },
                        {
                            label: 'SLAs Perdidas',
                            data: [],
                            backgroundColor: '#dc3545',
                            borderColor: '#c82333',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    return `${label}: ${value} acionamentos`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Estados'
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 0
                            }
                        },
                        y: {
                            type: 'linear',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantidade de Acionamentos'
                            },
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    return Math.floor(value);
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart',
                        delay: function(context) {
                            return context.dataIndex * 50;
                        }
                    }
                }
            });
            
            canvas.parentElement.classList.add('loaded');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de SLAs:', error);
        }
    }

    // Gráfico de Tipos de Falha Mais Comuns (Doughnut Chart)
    createTiposFalhaChart() {
        const canvas = document.getElementById('tiposFalhaChart');
        if (!canvas) {
            console.warn('❌ Canvas tiposFalhaChart não encontrado');
            return;
        }

        try {
            this.charts.tiposFalha = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
                            '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    size: 11
                                },
                                padding: 15
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
            
            canvas.parentElement.classList.add('loaded');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de Tipos de Falha:', error);
        }
    }

    // Gráfico de Acionamentos por Região (Polar Area Chart)
    createRegioesChart() {
        const canvas = document.getElementById('regioesChart');
        if (!canvas) {
            console.warn('❌ Canvas regioesChart não encontrado');
            return;
        }

        try {
            this.charts.regioes = new Chart(canvas, {
                type: 'polarArea',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            'rgba(255, 107, 107, 0.7)',
                            'rgba(78, 205, 196, 0.7)',
                            'rgba(69, 183, 209, 0.7)',
                            'rgba(150, 206, 180, 0.7)',
                            'rgba(254, 202, 87, 0.7)'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    size: 11
                                },
                                padding: 15
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    return `${label}: ${value} acionamentos`;
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
            
            canvas.parentElement.classList.add('loaded');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de Regiões:', error);
        }
    }

    // Gráfico de Distribuição por Criticidade (Pie Chart)
    createCriticidadeChart() {
        const canvas = document.getElementById('criticidadeChart');
        if (!canvas) {
            console.warn('❌ Canvas criticidadeChart não encontrado');
            return;
        }

        try {
            this.charts.criticidade = new Chart(canvas, {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#28a745', // Baixa - Verde
                            '#ffc107', // Média - Amarelo
                            '#dc3545'  // Alta - Vermelho
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    size: 11
                                },
                                padding: 15
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
            
            canvas.parentElement.classList.add('loaded');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de Criticidade:', error);
        }
    }

    // Gráfico de Acionamentos por Concessionária (Horizontal Bar Chart)
    createConcessionariasChart() {
        const canvas = document.getElementById('concessionariasChart');
        if (!canvas) {
            console.warn('❌ Canvas concessionariasChart não encontrado');
            return;
        }

        try {
            this.charts.concessionarias = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Quantidade de Acionamentos',
                        data: [],
                        backgroundColor: '#6f42c1',
                        borderColor: '#5a2d91',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.x;
                                    return `${label}: ${value} acionamentos`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantidade de Acionamentos'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Concessionárias'
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart',
                        delay: function(context) {
                            return context.dataIndex * 100;
                        }
                    }
                }
            });
            
            canvas.parentElement.classList.add('loaded');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de Concessionárias:', error);
        }
    }

    // Gráfico de Evolução Temporal dos Acionamentos (Line Chart)
    createEvolucaoTemporalChart() {
        const canvas = document.getElementById('evolucaoTemporalChart');
        if (!canvas) {
            console.warn('❌ Canvas evolucaoTemporalChart não encontrado');
            return;
        }

        try {
            this.charts.evolucaoTemporal = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Acionamentos por Dia',
                        data: [],
                        borderColor: '#17a2b8',
                        backgroundColor: 'rgba(23, 162, 184, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#17a2b8',
                        pointBorderColor: '#138496',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    return `${label}: ${value} acionamentos`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Data'
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 0
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantidade de Acionamentos'
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart',
                        delay: function(context) {
                            return context.dataIndex * 50;
                        }
                    }
                }
            });
            
            canvas.parentElement.classList.add('loaded');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de Evolução Temporal:', error);
        }
    }

    // Atualizar todos os gráficos com dados atuais
    updateCharts() {
        
        if (!this.charts.sites) {
            this.createCharts();
            return;
        }

        // Tentar obter dados de múltiplas fontes
        this.currentData = window.dashboardData || [];
        
        if (this.currentData.length === 0) {
            this.showEmptyCharts();
            return;
        }

        this.updateSitesChart();
        this.updateTecnicosChart();
        this.updateSLAChart();
        this.updateTiposFalhaChart();
        this.updateRegioesChart();
        this.updateCriticidadeChart();
        this.updateConcessionariasChart();
        this.updateEvolucaoTemporalChart();
        
        // Garantir que todos os containers tenham a classe loaded
        this.markAllChartsAsLoaded();
    }

    // Atualizar gráfico de sites que mais tiveram falha
    updateSitesChart() {
        if (!this.charts.sites) return;

        const siteCount = {};
        this.currentData.forEach(item => {
            const site = item.estacao || item.localidade || 'Site Desconhecido';
            siteCount[site] = (siteCount[site] || 0) + 1;
        });

        // Ordenar por quantidade e pegar top 10
        const sortedSites = Object.entries(siteCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const sites = sortedSites.map(([name]) => name);
        const values = sortedSites.map(([, value]) => value);

        try {
            this.charts.sites.data.labels = sites;
            this.charts.sites.data.datasets[0].data = values;
            this.charts.sites.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de sites:', error);
        }
    }

    // Atualizar gráfico de técnicos que mais tiveram acionamento
    updateTecnicosChart() {
        if (!this.charts.tecnicos) return;

        const tecnicoCount = {};
        this.currentData.forEach(item => {
            const tecnico = item.tecnico || 'Sem Técnico';
            tecnicoCount[tecnico] = (tecnicoCount[tecnico] || 0) + 1;
        });

        // Ordenar por quantidade e pegar top 10
        const sortedTecnicos = Object.entries(tecnicoCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const tecnicos = sortedTecnicos.map(([name]) => name);
        const values = sortedTecnicos.map(([, value]) => value);

        try {
            this.charts.tecnicos.data.labels = tecnicos;
            this.charts.tecnicos.data.datasets[0].data = values;
            this.charts.tecnicos.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de técnicos:', error);
        }
    }

    // Atualizar gráfico de SLAs Perdidas vs Cumpridas
    updateSLAChart() {
        if (!this.charts.sla) return;

        const slaData = {};
        this.currentData.forEach(item => {
            const regiao = item.regiao || 'Sem Estado';
            if (!slaData[regiao]) {
                slaData[regiao] = { cumpridas: 0, perdidas: 0 };
            }
            
            const slaInfo = this.calculateSLA(item);
            if (slaInfo.slaClass === 'critical') {
                slaData[regiao].perdidas++;
            } else {
                slaData[regiao].cumpridas++;
            }
        });

        // Ordenar por total de acionamentos
        const sortedEstados = Object.entries(slaData)
            .sort(([,a], [,b]) => (b.cumpridas + b.perdidas) - (a.cumpridas + a.perdidas));

        const estados = sortedEstados.map(([name]) => name);
        const cumpridas = sortedEstados.map(([, data]) => data.cumpridas);
        const perdidas = sortedEstados.map(([, data]) => data.perdidas);

        try {
            this.charts.sla.data.labels = estados;
            this.charts.sla.data.datasets[0].data = cumpridas;
            this.charts.sla.data.datasets[1].data = perdidas;
            this.charts.sla.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de SLAs:', error);
        }
    }

    // Atualizar gráfico de tipos de falha
    updateTiposFalhaChart() {
        if (!this.charts.tiposFalha) return;

        const tiposFalhaCount = {};
        this.currentData.forEach(item => {
            const tipoFalha = item.alarmes || item.tecnologia || 'Falha Desconhecida';
            tiposFalhaCount[tipoFalha] = (tiposFalhaCount[tipoFalha] || 0) + 1;
        });

        // Ordenar por quantidade e pegar top 8
        const sortedTiposFalha = Object.entries(tiposFalhaCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        const tiposFalha = sortedTiposFalha.map(([name]) => name);
        const values = sortedTiposFalha.map(([, value]) => value);

        try {
            this.charts.tiposFalha.data.labels = tiposFalha;
            this.charts.tiposFalha.data.datasets[0].data = values;
            this.charts.tiposFalha.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de tipos de falha:', error);
        }
    }

    // Atualizar gráfico de regiões
    updateRegioesChart() {
        if (!this.charts.regioes) return;

        const regioesCount = {};
        this.currentData.forEach(item => {
            const regiao = item.regiao || 'Região Desconhecida';
            regioesCount[regiao] = (regioesCount[regiao] || 0) + 1;
        });

        // Ordenar por quantidade
        const sortedRegioes = Object.entries(regioesCount)
            .sort(([,a], [,b]) => b - a);

        const regioes = sortedRegioes.map(([name]) => name);
        const values = sortedRegioes.map(([, value]) => value);

        try {
            this.charts.regioes.data.labels = regioes;
            this.charts.regioes.data.datasets[0].data = values;
            this.charts.regioes.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de regiões:', error);
        }
    }

    // Atualizar gráfico de criticidade
    updateCriticidadeChart() {
        if (!this.charts.criticidade) return;

        const criticidadeCount = {};
        this.currentData.forEach(item => {
            const criticidade = item.criticidade || 'Não Definida';
            criticidadeCount[criticidade] = (criticidadeCount[criticidade] || 0) + 1;
        });

        // Ordenar por criticidade (BAIXA, MEDIA, ALTA)
        const criticidadeOrder = { 'BAIXA': 1, 'MEDIA': 2, 'ALTA': 3 };
        const sortedCriticidade = Object.entries(criticidadeCount)
            .sort(([a], [b]) => (criticidadeOrder[a] || 4) - (criticidadeOrder[b] || 4));

        const criticidades = sortedCriticidade.map(([name]) => name);
        const values = sortedCriticidade.map(([, value]) => value);

        try {
            this.charts.criticidade.data.labels = criticidades;
            this.charts.criticidade.data.datasets[0].data = values;
            this.charts.criticidade.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de criticidade:', error);
        }
    }

    // Atualizar gráfico de concessionárias
    updateConcessionariasChart() {
        if (!this.charts.concessionarias) return;

        const concessionariasCount = {};
        this.currentData.forEach(item => {
            const concessionaria = item.concessionaria || 'Sem Concessionária';
            concessionariasCount[concessionaria] = (concessionariasCount[concessionaria] || 0) + 1;
        });

        // Ordenar por quantidade e pegar top 10
        const sortedConcessionarias = Object.entries(concessionariasCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const concessionarias = sortedConcessionarias.map(([name]) => name);
        const values = sortedConcessionarias.map(([, value]) => value);

        try {
            this.charts.concessionarias.data.labels = concessionarias;
            this.charts.concessionarias.data.datasets[0].data = values;
            this.charts.concessionarias.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de concessionárias:', error);
        }
    }

    // Atualizar gráfico de evolução temporal
    updateEvolucaoTemporalChart() {
        if (!this.charts.evolucaoTemporal) return;

        const dataCount = {};
        this.currentData.forEach(item => {
            const data = this.formatDateForChart(item.dataCadast || item.dataAcion);
            if (data && data !== 'Sem Data') {
                dataCount[data] = (dataCount[data] || 0) + 1;
            }
        });

        // Ordenar por data
        const sortedData = Object.entries(dataCount)
            .sort(([a], [b]) => {
                const dateA = this.parseDateTime(a);
                const dateB = this.parseDateTime(b);
                return dateA - dateB;
            });

        const datas = sortedData.map(([name]) => name);
        const values = sortedData.map(([, value]) => value);

        try {
            this.charts.evolucaoTemporal.data.labels = datas;
            this.charts.evolucaoTemporal.data.datasets[0].data = values;
            this.charts.evolucaoTemporal.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de evolução temporal:', error);
        }
    }

    // Mostrar gráficos vazios
    showEmptyCharts() {
        
        // Atualizar gráficos com dados vazios
        if (this.charts.sites) {
            this.charts.sites.data.labels = ['Sem dados'];
            this.charts.sites.data.datasets[0].data = [0];
            this.charts.sites.update('none'); // Sem animação para dados vazios
        }
        
        if (this.charts.tecnicos) {
            this.charts.tecnicos.data.labels = ['Sem dados'];
            this.charts.tecnicos.data.datasets[0].data = [0];
            this.charts.tecnicos.update('none'); // Sem animação para dados vazios
        }
        
        if (this.charts.sla) {
            this.charts.sla.data.labels = ['Sem dados'];
            this.charts.sla.data.datasets[0].data = [0];
            this.charts.sla.data.datasets[1].data = [0];
            this.charts.sla.update('none'); // Sem animação para dados vazios
        }

        if (this.charts.tiposFalha) {
            this.charts.tiposFalha.data.labels = ['Sem dados'];
            this.charts.tiposFalha.data.datasets[0].data = [0];
            this.charts.tiposFalha.update('none');
        }

        if (this.charts.regioes) {
            this.charts.regioes.data.labels = ['Sem dados'];
            this.charts.regioes.data.datasets[0].data = [0];
            this.charts.regioes.update('none');
        }

        if (this.charts.criticidade) {
            this.charts.criticidade.data.labels = ['Sem dados'];
            this.charts.criticidade.data.datasets[0].data = [0];
            this.charts.criticidade.update('none');
        }

        if (this.charts.concessionarias) {
            this.charts.concessionarias.data.labels = ['Sem dados'];
            this.charts.concessionarias.data.datasets[0].data = [0];
            this.charts.concessionarias.update('none');
        }

        if (this.charts.evolucaoTemporal) {
            this.charts.evolucaoTemporal.data.labels = ['Sem dados'];
            this.charts.evolucaoTemporal.data.datasets[0].data = [0];
            this.charts.evolucaoTemporal.update('none');
        }
    }

    // Calcular SLA (reutilizar função do script principal)
    calculateSLA(item) {
        if (!item.dataAcion) {
            return { sla: 'N/A', tempo: 'N/A', slaClass: 'neutral' };
        }

        const dataAcion = this.parseDateTime(item.dataAcion);
        if (!dataAcion) {
            return { sla: 'N/A', tempo: 'N/A', slaClass: 'neutral' };
        }

        const agora = new Date();
        const tempoDecorrido = agora - dataAcion;
        const horasDecorridas = tempoDecorrido / (1000 * 60 * 60);

        const slaConfig = this.getSLAConfig(item.tipoSite, item.alarmes);

        let slaClass = 'good';
        if (horasDecorridas > slaConfig.critico) {
            slaClass = 'critical';
        } else if (horasDecorridas > slaConfig.warning) {
            slaClass = 'warning';
        } else if (horasDecorridas > slaConfig.caution) {
            slaClass = 'caution';
        }

        return {
            sla: `${slaConfig.horas}h`,
            tempo: this.formatTempo(tempoDecorrido),
            slaClass: slaClass
        };
    }

    // Obter configuração de SLA
    getSLAConfig(tipoSite, tipoAlarme) {
        const alarme = (tipoAlarme || '').toUpperCase();

        if (alarme.includes('RETIFICADOR')) {
            return { horas: 24, caution: 12, warning: 18, critico: 24 };
        }
        if (alarme.includes('ENERGIA') || alarme.includes('ALTA TEMPERATURA') || alarme.includes('DISJUNTOR')) {
            return { horas: 4, caution: 2, warning: 3, critico: 4 };
        }
        return { horas: 4, caution: 2, warning: 3, critico: 4 };
    }

    // Funções auxiliares
    parseDateTime(dateTimeStr) {
        if (!dateTimeStr) return null;
        
        const match = dateTimeStr.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?/);
        if (match) {
            const [, day, month, year, hour = 0, minute = 0, second = 0] = match;
            return new Date(year, month - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
        }
        return null;
    }

    formatTempo(milliseconds) {
        const horas = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutos = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        
        if (horas > 0) {
            return `${horas}h ${minutos}m`;
        } else {
            return `${minutos}m`;
        }
    }

    formatDateForChart(dateStr) {
        if (!dateStr) return 'Sem Data';
        
        const match = dateStr.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
        if (match) {
            const [, day, month, year] = match;
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    }

    // Redimensionar gráficos
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }

    // Marcar todos os gráficos como carregados
    markAllChartsAsLoaded() {
        const chartContainers = [
            'sitesChart', 'tecnicosChart', 'slaChart', 'tiposFalhaChart', 
            'regioesChart', 'criticidadeChart', 'concessionariasChart', 'evolucaoTemporalChart'
        ];
        chartContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.classList.add('loaded');
            }
        });
    }
}

// Instância global do sistema de gráficos
const dashboardCharts = new DashboardCharts();
window.dashboardCharts = dashboardCharts;

// Função para alternar modo
function toggleDashboardMode() {
    dashboardCharts.toggleMode();
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    dashboardCharts.init();
    
    // Redimensionar gráficos quando janela mudar de tamanho
    window.addEventListener('resize', () => {
        dashboardCharts.resizeCharts();
    });
    
    // Aguardar um pouco e verificar se os gráficos foram criados
    setTimeout(() => {
        if (!dashboardCharts.charts.sites || !dashboardCharts.charts.tecnicos || !dashboardCharts.charts.sla) {
            dashboardCharts.createCharts();
        }
    }, 2000);
    
    // Verificar novamente após mais tempo se necessário
    setTimeout(() => {
        if (!dashboardCharts.charts.sites || !dashboardCharts.charts.tecnicos || !dashboardCharts.charts.sla) {
            dashboardCharts.createChartContainers();
            dashboardCharts.createCharts();
        }
    }, 5000);
}); 

