// Sistema de Gráficos - Dashboard de Acionamentos STTE
// Versão: 2.0.0
// Usando Chart.js

class DashboardCharts {
    constructor() {
        this.charts = {
            sites: null,
            tecnicos: null,
            sla: null
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
                console.log('✅ Chart.js carregado com sucesso');
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
                <div class="col-md-12">
                    <div class="chart-card">
                        <h5><i class="fas fa-clock"></i> SLAs Perdidas vs Cumpridas</h5>
                        <div class="chart-container">
                            <canvas id="slaChart"></canvas>
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
            console.log('📊 Evento dashboardDataUpdated recebido');
            if (this.isChartsMode) {
                console.log('📊 Atualizando gráficos devido a mudança de dados...');
                setTimeout(() => {
                    this.updateCharts();
                }, 100);
            }
        });
        
        // Listener para quando os dados são carregados
        window.addEventListener('DOMContentLoaded', () => {
            console.log('📊 DOM carregado, verificando dados...');
            setTimeout(() => {
                if (window.dashboardData && window.dashboardData.length > 0) {
                    console.log('📊 Dados encontrados no carregamento:', window.dashboardData.length);
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
        
        console.log('🔄 Alternando modo:', this.isChartsMode ? 'Gráficos' : 'Tabela');
        console.log('📋 Seção da tabela encontrada:', tableSection);
        console.log('📊 Seção dos gráficos encontrada:', chartsSection);
        
        if (this.isChartsMode) {
            // Mostrar gráficos - esconder apenas a tabela
            if (tableSection) {
                tableSection.style.display = 'none';
                console.log('✅ Tabela escondida');
            }
            if (chartsSection) {
                chartsSection.classList.remove('d-none');
                console.log('✅ Gráficos mostrados');
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
                console.log('✅ Tabela mostrada');
            }
            if (chartsSection) {
                chartsSection.classList.add('d-none');
                console.log('✅ Gráficos escondidos');
            }
            if (dashboardButton) {
                dashboardButton.innerHTML = '<i class="fas fa-chart-line"></i> Dashboard';
                dashboardButton.setAttribute('href', '#dashboard');
            }
        }
    }

    // Criar todos os gráficos
    createCharts() {
        console.log('📊 Criando gráficos...');
        
        // Aguardar um pouco para garantir que os containers existem
        setTimeout(() => {
            this.createSitesChart();
            this.createTecnicosChart();
            this.createSLAChart();
            
            console.log('✅ Gráficos criados com sucesso');
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
            console.log('✅ Gráfico de Sites (Line Chart) criado');
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
            console.log('✅ Gráfico de Técnicos criado');
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
            console.log('✅ Gráfico de SLAs criado');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de SLAs:', error);
        }
    }

    // Atualizar todos os gráficos com dados atuais
    updateCharts() {
        console.log('📊 Atualizando gráficos...');
        
        if (!this.charts.sites) {
            console.warn('❌ Gráficos não inicializados, tentando criar novamente...');
            this.createCharts();
            return;
        }

        // Tentar obter dados de múltiplas fontes
        this.currentData = window.dashboardData || [];
        console.log(`📈 Dados para gráficos: ${this.currentData.length} registros`);
        
        if (this.currentData.length === 0) {
            console.log('📊 Nenhum dado disponível, mostrando gráficos vazios');
            this.showEmptyCharts();
            return;
        }

        this.updateSitesChart();
        this.updateTecnicosChart();
        this.updateSLAChart();
        
        // Garantir que todos os containers tenham a classe loaded
        this.markAllChartsAsLoaded();
        
        console.log('✅ Gráficos atualizados com sucesso');
    }

    // Atualizar gráfico de sites que mais tiveram falha
    updateSitesChart() {
        if (!this.charts.sites) return;

        console.log('📊 Atualizando gráfico de sites...');

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

        console.log('📊 Top 10 sites com mais falhas:', sites);
        console.log('📊 Quantidade de falhas:', values);

        try {
            this.charts.sites.data.labels = sites;
            this.charts.sites.data.datasets[0].data = values;
            this.charts.sites.update('active'); // Com animação
            console.log('✅ Gráfico de sites atualizado');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de sites:', error);
        }
    }

    // Atualizar gráfico de técnicos que mais tiveram acionamento
    updateTecnicosChart() {
        if (!this.charts.tecnicos) return;

        console.log('📊 Atualizando gráfico de técnicos...');

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

        console.log('📊 Top 10 técnicos com mais acionamentos:', tecnicos);
        console.log('📊 Quantidade por técnico:', values);

        try {
            this.charts.tecnicos.data.labels = tecnicos;
            this.charts.tecnicos.data.datasets[0].data = values;
            this.charts.tecnicos.update('active'); // Com animação
            console.log('✅ Gráfico de técnicos atualizado');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de técnicos:', error);
        }
    }

    // Atualizar gráfico de SLAs Perdidas vs Cumpridas
    updateSLAChart() {
        if (!this.charts.sla) return;

        console.log('📊 Atualizando gráfico de SLAs...');

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

        console.log('📊 Estados com SLAs:', estados);
        console.log('📊 SLAs cumpridas:', cumpridas);
        console.log('📊 SLAs perdidas:', perdidas);

        try {
            this.charts.sla.data.labels = estados;
            this.charts.sla.data.datasets[0].data = cumpridas;
            this.charts.sla.data.datasets[1].data = perdidas;
            this.charts.sla.update('active'); // Com animação
            console.log('✅ Gráfico de SLAs atualizado');
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de SLAs:', error);
        }
    }

    // Mostrar gráficos vazios
    showEmptyCharts() {
        console.log('📊 Mostrando gráficos vazios...');
        
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
        
        console.log('✅ Gráficos vazios exibidos');
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
            'sitesChart', 'tecnicosChart', 'slaChart'
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
    console.log('🚀 Inicializando sistema de gráficos...');
    dashboardCharts.init();
    
    // Redimensionar gráficos quando janela mudar de tamanho
    window.addEventListener('resize', () => {
        dashboardCharts.resizeCharts();
    });
    
    // Aguardar um pouco e verificar se os gráficos foram criados
    setTimeout(() => {
        if (!dashboardCharts.charts.sites || !dashboardCharts.charts.tecnicos || !dashboardCharts.charts.sla) {
            console.warn('⚠️ Gráficos não foram criados, tentando novamente...');
            dashboardCharts.createCharts();
        }
    }, 2000);
    
    // Verificar novamente após mais tempo se necessário
    setTimeout(() => {
        if (!dashboardCharts.charts.sites || !dashboardCharts.charts.tecnicos || !dashboardCharts.charts.sla) {
            console.warn('⚠️ Segunda tentativa de criar gráficos...');
            dashboardCharts.createChartContainers();
            dashboardCharts.createCharts();
        }
    }, 5000);
});

console.log('📊 Sistema de Gráficos Chart.js inicializado - Dashboard STTE'); 

