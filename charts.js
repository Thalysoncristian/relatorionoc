// Sistema de Gráficos - Dashboard de Acionamentos STTE
// Versão: 3.0.0
// Usando Chart.js

class DashboardCharts {
    constructor() {
        this.charts = {
            sites: null,
            tecnicos: null,
            tiposFalha: null,
            regioes: null,
            criticidade: null,
            evolucaoTemporal: null,
            concessionarias: null,
            // Gráficos específicos para preventivas
            preventivasFases: null,
            preventivasTecnicos: null,
            preventivasRegioes: null,
            preventivasTipoSite: null
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
        // Os containers já existem no HTML, não precisamos criá-los dinamicamente
        // Apenas verificar se existem
        const chartsSection = document.getElementById('chartsSection');
        const preventivasSection = document.getElementById('preventivasChartsSection');
        
        if (!chartsSection) {
            console.warn('❌ Seção de gráficos corretivos não encontrada no HTML');
        }
        
        if (!preventivasSection) {
            console.warn('❌ Seção de gráficos preventivas não encontrada no HTML');
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Listener para mudança de dados
        window.addEventListener('dashboardDataUpdated', () => {
            if (window.dashboardData && window.dashboardData.length > 0) {
                this.currentData = window.dashboardData;
                if (this.isChartsMode) {
                    setTimeout(() => {
                        this.updateCharts();
                    }, 100);
                }
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
        
        // Listener para quando dados são carregados do cache
        const checkForData = () => {
            if (window.dashboardData && window.dashboardData.length > 0) {
                this.currentData = window.dashboardData;
                // Se estiver em modo gráfico, atualizar imediatamente
                if (this.isChartsMode) {
                    this.updateCharts();
                }
                return true; // Dados encontrados
            }
            return false; // Dados não encontrados
        };
        
        // Verificar dados a cada 500ms por 10 segundos
        let checkCount = 0;
        const checkInterval = setInterval(() => {
            const dataFound = checkForData();
            checkCount++;
            if (dataFound || checkCount >= 20) { // Parar se dados encontrados ou 10 segundos
                clearInterval(checkInterval);
            }
        }, 500);
    }

    // Alternar entre modo tabela e gráficos
    toggleMode() {
        this.isChartsMode = !this.isChartsMode;

        const tableSection = document.getElementById('tableSection');
        const chartsSection = document.getElementById('chartsSection');
        const preventivasSection = document.getElementById('preventivasChartsSection');
        const dashboardButton = document.querySelector('.nav-link[href="#dashboard"], .nav-link[href="#acionamentos"]');
        
        if (this.isChartsMode) {
            // MODO GRÁFICOS: Esconder tabela, mostrar gráficos apropriados
            if (tableSection) {
                tableSection.style.display = 'none';
            }
            
            // Verificar se há dados de preventivas para decidir quais gráficos mostrar
            const hasPreventivas = this.currentData && this.currentData.some(item => item.tipoAMI === 'PREVENTIVA');
            
            if (hasPreventivas) {
                // Mostrar gráficos de preventivas, ocultar gráficos de corretivos
                if (chartsSection) {
                    chartsSection.style.display = 'none';
                }
                if (preventivasSection) {
                    preventivasSection.style.display = 'block';
                }
            } else {
                // Mostrar gráficos de corretivos, ocultar gráficos de preventivas
                if (chartsSection) {
                    chartsSection.style.display = 'block';
                }
                if (preventivasSection) {
                    preventivasSection.style.display = 'none';
                }
            }
            
            if (dashboardButton) {
                dashboardButton.innerHTML = '<i class="fas fa-table"></i> Acionamentos';
                dashboardButton.setAttribute('href', '#acionamentos');
            }
            this.updateCharts();
        } else {
            // MODO TABELA: Mostrar tabela, esconder todos os gráficos
            if (tableSection) {
                tableSection.style.display = 'block';
            }
            if (chartsSection) {
                chartsSection.style.display = 'none';
            }
            if (preventivasSection) {
                preventivasSection.style.display = 'none';
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
            this.createTiposFalhaChart();
            this.createRegioesChart();
            this.createCriticidadeChart();
            this.createConcessionariasChart();
            this.createEvolucaoTemporalChart();
            
            // Criar gráficos de preventivas
            this.createPreventivasFasesChart();
            this.createPreventivasTecnicosChart();
            this.createPreventivasRegioesChart();
            this.createPreventivasTipoSiteChart();
        }, 200);
    }

    // Gráfico de Sites que Mais Tiveram Falha (Line Chart)
    createSitesChart() {
        const canvas = document.getElementById('sitesChart');
        if (!canvas) {
            console.warn('❌ Canvas sitesChart não encontrado');
            return;
        }

        // Verificar se já existe um gráfico neste canvas
        if (this.charts.sites) {
            console.warn('❌ Gráfico sites já existe, pulando criação');
            return;
        }

        try {
            const siteCount = {};
            this.currentData.forEach(item => {
                const site = item.estacao || item.localidade || 'Site Desconhecido';
                siteCount[site] = (siteCount[site] || 0) + 1;
            });
            const sortedSites = Object.entries(siteCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);
            const sites = sortedSites.map(([name]) => name);
            const values = sortedSites.map(([, value]) => value);
            this.charts.sites = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: sites,
                    datasets: [{
                        label: 'Quantidade de Falhas',
                        data: values,
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

        // Verificar se já existe um gráfico neste canvas
        if (this.charts.tecnicos) {
            console.warn('❌ Gráfico tecnicos já existe, pulando criação');
            return;
        }

        try {
            const tecnicoCount = {};
            this.currentData.forEach(item => {
                const tecnico = item.tecnico || 'Sem Técnico';
                tecnicoCount[tecnico] = (tecnicoCount[tecnico] || 0) + 1;
            });
            const sortedTecnicos = Object.entries(tecnicoCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);
            const tecnicos = sortedTecnicos.map(([name]) => name);
            const values = sortedTecnicos.map(([, value]) => value);
            this.charts.tecnicos = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: tecnicos,
                    datasets: [{
                        label: 'Quantidade de Acionamentos',
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

    // Gráfico de Tipos de Falha Mais Comuns (Doughnut Chart)
    createTiposFalhaChart() {
        const canvas = document.getElementById('tiposFalhaChart');
        if (!canvas) {
            console.warn('❌ Canvas tiposFalhaChart não encontrado');
            return;
        }

        // Verificar se já existe um gráfico neste canvas
        if (this.charts.tiposFalha) {
            console.warn('❌ Gráfico tiposFalha já existe, pulando criação');
            return;
        }

        try {
            const tiposFalhaCount = {};
            this.currentData.forEach(item => {
                const tipoFalha = item.alarmes || item.tecnologia || 'Falha Desconhecida';
                tiposFalhaCount[tipoFalha] = (tiposFalhaCount[tipoFalha] || 0) + 1;
            });
            const sortedTiposFalha = Object.entries(tiposFalhaCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8);
            const tiposFalha = sortedTiposFalha.map(([name]) => name);
            const values = sortedTiposFalha.map(([, value]) => value);
            this.charts.tiposFalha = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: tiposFalha,
                    datasets: [{
                        data: values,
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

        // Verificar se já existe um gráfico neste canvas
        if (this.charts.regioes) {
            console.warn('❌ Gráfico regioes já existe, pulando criação');
            return;
        }

        try {
            const regioesCount = {};
            this.currentData.forEach(item => {
                const regiao = item.regiao || 'Região Desconhecida';
                regioesCount[regiao] = (regioesCount[regiao] || 0) + 1;
            });
            const sortedRegioes = Object.entries(regioesCount)
                .sort(([,a], [,b]) => b - a);
            const regioes = sortedRegioes.map(([name]) => name);
            const values = sortedRegioes.map(([, value]) => value);
            this.charts.regioes = new Chart(canvas, {
                type: 'polarArea',
                data: {
                    labels: regioes,
                    datasets: [{
                        data: values,
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

        // Verificar se já existe um gráfico neste canvas
        if (this.charts.criticidade) {
            console.warn('❌ Gráfico criticidade já existe, pulando criação');
            return;
        }

        try {
            const criticidadeCount = {};
            this.currentData.forEach(item => {
                const criticidade = item.criticidade || 'Não Definida';
                criticidadeCount[criticidade] = (criticidadeCount[criticidade] || 0) + 1;
            });
            const criticidadeOrder = { 'BAIXA': 1, 'MEDIA': 2, 'ALTA': 3 };
            const sortedCriticidade = Object.entries(criticidadeCount)
                .sort(([a], [b]) => (criticidadeOrder[a] || 4) - (criticidadeOrder[b] || 4));
            const criticidades = sortedCriticidade.map(([name]) => name);
            const values = sortedCriticidade.map(([, value]) => value);
            this.charts.criticidade = new Chart(canvas, {
                type: 'pie',
                data: {
                    labels: criticidades,
                    datasets: [{
                        data: values,
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
            const concessionariasCount = {};
            this.currentData.forEach(item => {
                const concessionaria = item.concessionaria || 'Sem Concessionária';
                concessionariasCount[concessionaria] = (concessionariasCount[concessionaria] || 0) + 1;
            });
            const sortedConcessionarias = Object.entries(concessionariasCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);
            const concessionarias = sortedConcessionarias.map(([name]) => name);
            const values = sortedConcessionarias.map(([, value]) => value);
            this.charts.concessionarias = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: concessionarias,
                    datasets: [{
                        label: 'Quantidade de Acionamentos',
                        data: values,
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
            const dataCount = {};
            this.currentData.forEach(item => {
                const data = this.formatDateForChart(item.dataCadast || item.dataAcion);
                if (data && data !== 'Sem Data') {
                    dataCount[data] = (dataCount[data] || 0) + 1;
                }
            });
            const sortedData = Object.entries(dataCount)
                .sort(([a], [b]) => {
                    const dateA = this.parseDateTime(a);
                    const dateB = this.parseDateTime(b);
                    return dateA - dateB;
                });
            const datas = sortedData.map(([name]) => name);
            const values = sortedData.map(([, value]) => value);
            this.charts.evolucaoTemporal = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: datas,
                    datasets: [{
                        label: 'Acionamentos por Dia',
                        data: values,
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

    // ===== GRÁFICOS ESPECÍFICOS PARA PREVENTIVAS =====

    // Gráfico de Fases das Preventivas (Pizza)
    createPreventivasFasesChart() {
        const canvas = document.getElementById('preventivasFasesChart');
        if (!canvas) {
            console.warn('❌ Canvas preventivasFasesChart não encontrado');
            return;
        }

        // Verificar se já existe um gráfico neste canvas
        if (this.charts.preventivasFases) {
            console.warn('❌ Gráfico preventivasFases já existe, pulando criação');
            return;
        }

        try {
            const fasesCount = {};
            this.currentData.forEach(item => {
                if (item.tipoAMI === 'PREVENTIVA') {
                    const fase = item.fase || 'Sem Fase';
                    fasesCount[fase] = (fasesCount[fase] || 0) + 1;
                }
            });

            const fases = Object.keys(fasesCount);
            const values = Object.values(fasesCount);

            this.charts.preventivasFases = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: fases,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
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
            console.error('❌ Erro ao criar gráfico de Fases das Preventivas:', error);
        }
    }

    // Gráfico de Técnicos Responsáveis por Preventivas (Barras Horizontais)
    createPreventivasTecnicosChart() {
        const canvas = document.getElementById('preventivasTecnicosChart');
        if (!canvas) {
            console.warn('❌ Canvas preventivasTecnicosChart não encontrado');
            return;
        }

        try {
            const tecnicoCount = {};
            this.currentData.forEach(item => {
                if (item.tipoAMI === 'PREVENTIVA') {
                    const tecnico = item.tecnico || 'Sem Técnico';
                    tecnicoCount[tecnico] = (tecnicoCount[tecnico] || 0) + 1;
                }
            });

            const sortedTecnicos = Object.entries(tecnicoCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8);
            const tecnicos = sortedTecnicos.map(([name]) => name);
            const values = sortedTecnicos.map(([, value]) => value);

            this.charts.preventivasTecnicos = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: tecnicos,
                    datasets: [{
                        label: 'Preventivas por Técnico',
                        data: values,
                        backgroundColor: '#4BC0C0',
                        borderColor: '#36A2EB',
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
                                    return `${label}: ${value} preventivas`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantidade de Preventivas'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Técnicos'
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
            console.error('❌ Erro ao criar gráfico de Técnicos das Preventivas:', error);
        }
    }

    // Gráfico de Preventivas por Região (Pizza)
    createPreventivasRegioesChart() {
        const canvas = document.getElementById('preventivasRegioesChart');
        if (!canvas) {
            console.warn('❌ Canvas preventivasRegioesChart não encontrado');
            return;
        }

        try {
            const regioesCount = {};
            this.currentData.forEach(item => {
                if (item.tipoAMI === 'PREVENTIVA') {
                    const regiao = item.regiao || 'Região Desconhecida';
                    regioesCount[regiao] = (regioesCount[regiao] || 0) + 1;
                }
            });

            const regioes = Object.keys(regioesCount);
            const values = Object.values(regioesCount);

            this.charts.preventivasRegioes = new Chart(canvas, {
                type: 'pie',
                data: {
                    labels: regioes,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 20,
                                usePointStyle: true
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
            console.error('❌ Erro ao criar gráfico de Regiões das Preventivas:', error);
        }
    }

    // Gráfico de Preventivas por Tipo de Site (Barras Verticais)
    createPreventivasTipoSiteChart() {
        const canvas = document.getElementById('preventivasTipoSiteChart');
        if (!canvas) {
            console.warn('❌ Canvas preventivasTipoSiteChart não encontrado');
            return;
        }

        try {
            const tipoSiteCount = {};
            this.currentData.forEach(item => {
                if (item.tipoAMI === 'PREVENTIVA') {
                    const tipoSite = item.tipoSite || 'Tipo Desconhecido';
                    tipoSiteCount[tipoSite] = (tipoSiteCount[tipoSite] || 0) + 1;
                }
            });

            const sortedTiposSite = Object.entries(tipoSiteCount)
                .sort(([,a], [,b]) => b - a);
            const tiposSite = sortedTiposSite.map(([name]) => name);
            const values = sortedTiposSite.map(([, value]) => value);

            this.charts.preventivasTipoSite = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: tiposSite,
                    datasets: [{
                        label: 'Preventivas por Tipo de Site',
                        data: values,
                        backgroundColor: '#9966FF',
                        borderColor: '#7B68EE',
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
                                    return `${label}: ${value} preventivas`;
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
                                text: 'Tipos de Site'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantidade de Preventivas'
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
            console.error('❌ Erro ao criar gráfico de Tipos de Site das Preventivas:', error);
        }
    }

    // Atualizar todos os gráficos com dados atuais
    updateCharts() {
        // Verificar se há dados de preventivas para mostrar a seção específica
        this.checkPreventivasSection();

        // Destruir gráficos antigos de forma mais robusta
        this.destroyAllCharts();
        
        // Aguardar um pouco antes de recriar os gráficos
        setTimeout(() => {
            this.createCharts();
        }, 200);
    }

    // Função para destruir todos os gráficos
    destroyAllCharts() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key] && typeof this.charts[key].destroy === 'function') {
                try {
                    this.charts[key].destroy();
                } catch (error) {
                    console.warn(`Erro ao destruir gráfico ${key}:`, error);
                }
            }
            this.charts[key] = null;
        });
        
        // Limpar todos os canvas
        const canvasIds = [
            'sitesChart', 'tecnicosChart', 'tiposFalhaChart', 'regioesChart', 
            'criticidadeChart', 'concessionariasChart', 'evolucaoTemporalChart',
            'preventivasFasesChart', 'preventivasTecnicosChart', 
            'preventivasRegioesChart', 'preventivasTipoSiteChart'
        ];
        
        canvasIds.forEach(canvasId => {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        });
    }

    // Verificar se deve mostrar a seção de preventivas
    checkPreventivasSection() {
        const preventivasSection = document.getElementById('preventivasChartsSection');
        const chartsSection = document.getElementById('chartsSection');
        if (!preventivasSection || !chartsSection) return;

        // Verificar se há dados de preventivas nos dados atuais (filtrados ou não)
        const hasPreventivas = this.currentData && this.currentData.some(item => item.tipoAMI === 'PREVENTIVA');
        
        if (hasPreventivas) {
            // Se há preventivas, ocultar gráficos de corretivos e mostrar preventivas
            chartsSection.style.display = 'none';
            preventivasSection.style.display = 'block';
        } else {
            // Se não há preventivas, mostrar gráficos de corretivos e ocultar preventivas
            chartsSection.style.display = 'block';
            preventivasSection.style.display = 'none';
        }
    }

    // Forçar exibição da seção de preventivas
    showPreventivasSection() {
        const preventivasSection = document.getElementById('preventivasChartsSection');
        const chartsSection = document.getElementById('chartsSection');
        if (preventivasSection && chartsSection) {
            // Ocultar gráficos de corretivos
            chartsSection.style.display = 'none';
            // Só mostrar gráficos de preventivas se estiver em modo gráficos
            if (this.isChartsMode) {
                preventivasSection.style.display = 'block';
            }
        }
    }

    // Ocultar seção de preventivas
    hidePreventivasSection() {
        const preventivasSection = document.getElementById('preventivasChartsSection');
        const chartsSection = document.getElementById('chartsSection');
        if (preventivasSection && chartsSection) {
            // Só mostrar gráficos de corretivos se estiver em modo gráficos
            if (this.isChartsMode) {
                chartsSection.style.display = 'block';
            }
            // Ocultar gráficos de preventivas
            preventivasSection.style.display = 'none';
        }
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

    // ===== FUNÇÕES DE ATUALIZAÇÃO DOS GRÁFICOS DE PREVENTIVAS =====

    // Atualizar gráfico de fases das preventivas
    updatePreventivasFasesChart() {
        if (!this.charts.preventivasFases) return;

        const fasesCount = {};
        this.currentData.forEach(item => {
            if (item.tipoAMI === 'PREVENTIVA') {
                const fase = item.fase || 'Sem Fase';
                fasesCount[fase] = (fasesCount[fase] || 0) + 1;
            }
        });

        const fases = Object.keys(fasesCount);
        const values = Object.values(fasesCount);

        try {
            this.charts.preventivasFases.data.labels = fases;
            this.charts.preventivasFases.data.datasets[0].data = values;
            this.charts.preventivasFases.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de fases das preventivas:', error);
        }
    }

    // Atualizar gráfico de técnicos das preventivas
    updatePreventivasTecnicosChart() {
        if (!this.charts.preventivasTecnicos) return;

        const tecnicoCount = {};
        this.currentData.forEach(item => {
            if (item.tipoAMI === 'PREVENTIVA') {
                const tecnico = item.tecnico || 'Sem Técnico';
                tecnicoCount[tecnico] = (tecnicoCount[tecnico] || 0) + 1;
            }
        });

        const sortedTecnicos = Object.entries(tecnicoCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);
        const tecnicos = sortedTecnicos.map(([name]) => name);
        const values = sortedTecnicos.map(([, value]) => value);

        try {
            this.charts.preventivasTecnicos.data.labels = tecnicos;
            this.charts.preventivasTecnicos.data.datasets[0].data = values;
            this.charts.preventivasTecnicos.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de técnicos das preventivas:', error);
        }
    }

    // Atualizar gráfico de regiões das preventivas
    updatePreventivasRegioesChart() {
        if (!this.charts.preventivasRegioes) return;

        const regioesCount = {};
        this.currentData.forEach(item => {
            if (item.tipoAMI === 'PREVENTIVA') {
                const regiao = item.regiao || 'Região Desconhecida';
                regioesCount[regiao] = (regioesCount[regiao] || 0) + 1;
            }
        });

        const regioes = Object.keys(regioesCount);
        const values = Object.values(regioesCount);

        try {
            this.charts.preventivasRegioes.data.labels = regioes;
            this.charts.preventivasRegioes.data.datasets[0].data = values;
            this.charts.preventivasRegioes.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de regiões das preventivas:', error);
        }
    }

    // Atualizar gráfico de tipos de site das preventivas
    updatePreventivasTipoSiteChart() {
        if (!this.charts.preventivasTipoSite) return;

        const tipoSiteCount = {};
        this.currentData.forEach(item => {
            if (item.tipoAMI === 'PREVENTIVA') {
                const tipoSite = item.tipoSite || 'Tipo Desconhecido';
                tipoSiteCount[tipoSite] = (tipoSiteCount[tipoSite] || 0) + 1;
            }
        });

        const sortedTiposSite = Object.entries(tipoSiteCount)
            .sort(([,a], [,b]) => b - a);
        const tiposSite = sortedTiposSite.map(([name]) => name);
        const values = sortedTiposSite.map(([, value]) => value);

        try {
            this.charts.preventivasTipoSite.data.labels = tiposSite;
            this.charts.preventivasTipoSite.data.datasets[0].data = values;
            this.charts.preventivasTipoSite.update('active');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de tipos de site das preventivas:', error);
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

        // Gráficos de preventivas vazios
        if (this.charts.preventivasFases) {
            this.charts.preventivasFases.data.labels = ['Sem dados'];
            this.charts.preventivasFases.data.datasets[0].data = [0];
            this.charts.preventivasFases.update('none');
        }

        if (this.charts.preventivasTecnicos) {
            this.charts.preventivasTecnicos.data.labels = ['Sem dados'];
            this.charts.preventivasTecnicos.data.datasets[0].data = [0];
            this.charts.preventivasTecnicos.update('none');
        }

        if (this.charts.preventivasRegioes) {
            this.charts.preventivasRegioes.data.labels = ['Sem dados'];
            this.charts.preventivasRegioes.data.datasets[0].data = [0];
            this.charts.preventivasRegioes.update('none');
        }

        if (this.charts.preventivasTipoSite) {
            this.charts.preventivasTipoSite.data.labels = ['Sem dados'];
            this.charts.preventivasTipoSite.data.datasets[0].data = [0];
            this.charts.preventivasTipoSite.update('none');
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
            'sitesChart', 'tecnicosChart', 'tiposFalhaChart', 
            'regioesChart', 'criticidadeChart', 'concessionariasChart', 'evolucaoTemporalChart',
            'preventivasFasesChart', 'preventivasTecnicosChart', 
            'preventivasRegioesChart', 'preventivasTipoSiteChart'
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
        if (!dashboardCharts.charts.sites || !dashboardCharts.charts.tecnicos || !dashboardCharts.charts.tiposFalha) {
            dashboardCharts.createCharts();
        }
    }, 2000);
    
    // Verificar novamente após mais tempo se necessário
    setTimeout(() => {
        if (!dashboardCharts.charts.sites || !dashboardCharts.charts.tecnicos || !dashboardCharts.charts.tiposFalha) {
            dashboardCharts.createChartContainers();
            dashboardCharts.createCharts();
        }
    }, 5000);
});

