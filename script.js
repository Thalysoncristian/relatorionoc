// Variáveis globais
let dashboardData = [];
let dropZoneActive = false;
let notificationQueue = [];
let notificationContainer = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
    initializeNavigation();
    initializeGlobalDropZone();
    initializeNotificationContainer();
    
    // Verificar se há dados no cache imediatamente
    checkAndLoadCache();
    
    // Verificar periodicamente se há dados no cache (para casos de navegação)
    setInterval(() => {
        if (dashboardData.length === 0) {
            checkAndLoadCache();
        }
    }, 2000); // Verificar a cada 2 segundos
    
    // Detectar quando a página volta a ter foco (quando volta do changelog)
    window.addEventListener('focus', function() {
        if (dashboardData.length === 0) {
            checkAndLoadCache();
        }
    });
    
    // Detectar quando a página é carregada (incluindo quando volta do changelog)
    window.addEventListener('pageshow', function(event) {
        if (dashboardData.length === 0) {
            checkAndLoadCache();
        }
    });
    
    // Criar backup inicial
    setTimeout(() => {
        if (typeof createBackup === 'function') {
            createBackup('Inicialização do sistema');
        }
    }, 3000);
});

// Função para verificar e carregar cache
function checkAndLoadCache() {
    const cachedData = localStorage.getItem('gmsCache');
    
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            const cacheAge = new Date() - new Date(parsed.timestamp);
            const maxAge = 30 * 60 * 1000; // 30 minutos
            
            if (cacheAge < maxAge && parsed.data && parsed.data.length > 0) {
                if (loadFromCache()) {
                    showSuccessMessage('✅ Dados carregados automaticamente do cache!');
                    return true;
                }
            } else {
                // Cache expirado ou vazio
                showEmptyState();
            }
        } catch (error) {
            console.error('Erro na verificação do cache:', error);
            showEmptyState();
        }
    } else {
        // Nenhum cache encontrado
        showEmptyState();
    }
    return false;
}

// Função para alternar entre modo tabela e gráficos
// Implementada no charts.js

// Função para mostrar changelog
function showChangelog() {
    // Ocultar todas as seções
    document.getElementById('dashboard').classList.add('d-none');
    document.getElementById('emptyState').classList.add('d-none');
    document.getElementById('changelog').classList.remove('d-none');
    
    // Atualizar navegação
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Ativar link do changelog
    const changelogLink = document.querySelector('a[href="#changelog"]');
    if (changelogLink) {
        changelogLink.classList.add('active');
    }
}

// Função para mostrar dashboard
function showDashboard() {
    // Verificar se há dados antes de mostrar o dashboard
    if (dashboardData.length === 0) {
        // Tentar carregar do cache se não há dados na memória
        if (loadFromCache()) {
            // Dados carregados do cache com sucesso
        } else {
            showEmptyState();
            return;
        }
    }
    
    // Ocultar todas as seções
    document.getElementById('changelog').classList.add('d-none');
    document.getElementById('emptyState').classList.add('d-none');
    document.getElementById('dashboard').classList.remove('d-none');
    
    // Atualizar navegação
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Ativar link do dashboard
    const dashboardLink = document.querySelector('a[href="#dashboard"]');
    if (dashboardLink) {
        dashboardLink.classList.add('active');
    }
}

// Tornar funções globais
window.showChangelog = showChangelog;
window.showDashboard = showDashboard;

// Inicializar navegação
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Só previne o padrão para links internos (hash)
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();

                // Remover classe active de todos os links
                navLinks.forEach(l => l.classList.remove('active'));

                // Adicionar classe active ao link clicado
                this.classList.add('active');

                // Lógica para mostrar diferentes seções
                const target = this.getAttribute('href').substring(1);
                showSection(target);
            }
            // Para links externos, deixa o comportamento padrão (abrir nova aba)
        });
    });
    

}

// Mostrar seção específica
function showSection(sectionName) {
    if (sectionName === 'dashboard') {
        showDashboard();
    } else if (sectionName === 'changelog') {
        showChangelog();
    }
}

// Inicializar upload de arquivo
function initializeFileUpload() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileUpload);
}

// Inicializar zona de drop global (sempre ativa)
function initializeGlobalDropZone() {
    // Adicionar event listeners globais para drag and drop
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('drop', handleGlobalDrop);
    
    // Adicionar event listener para clicar e desativar modo visual
    document.addEventListener('click', handleGlobalClick);
    
    console.log('🌐 Zona de drop global inicializada - arraste arquivos Excel a qualquer momento');
}

// Inicializar container de notificações
function initializeNotificationContainer() {
    // Criar container para notificações
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
    `;
    
    document.body.appendChild(notificationContainer);
    console.log('📢 Container de notificações inicializado');
}

// Manipular upload de arquivo
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Desativar modo visual de arraste se estiver ativo
    if (dropZoneActive) {
        deactivateDropZone();
    }

    // Mostrar loading
    showLoading();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Processar dados
            processExcelData(workbook);
            
            // Verificar se é um arquivo do GMS (baseado no nome ou conteúdo)
            const isGMSFile = file.name.toLowerCase().includes('acionamentos_gms') || 
                             file.name.toLowerCase().includes('gms') ||
                             file.name.toLowerCase().includes('excel.php');
            
            // Verificar se são dados de preventivas
            const isPreventivasFile = file.name.toLowerCase().includes('preventiva') || 
                                     file.name.toLowerCase().includes('preventivo') ||
                                     dashboardData.some(item => item.tipoAMI === 'PREVENTIVA');
            
            
            
            if (isGMSFile) {
                // Salvar no cache se for arquivo do GMS
                const timestamp = new Date().toISOString();
                const cacheData = {
                    timestamp: timestamp,
                    data: dashboardData,
                    isPreventivas: isPreventivasFile
                };
                localStorage.setItem('gmsCache', JSON.stringify(cacheData));
                showCacheInfo(timestamp);
                
                if (isPreventivasFile) {
                    showSuccessMessage('✅ Arquivo de Preventivas importado com sucesso! Os gráficos específicos de preventivas estão disponíveis.');
                    // Ativar automaticamente os gráficos de preventivas
                    if (window.dashboardCharts) {
                        window.dashboardCharts.showPreventivasSection();
                    }
                } else {
                    showSuccessMessage('✅ Arquivo de Acionamentos Corretivos importado com sucesso!');
                    // Ocultar gráficos de preventivas se for corretivo
                    if (window.dashboardCharts) {
                        window.dashboardCharts.hidePreventivasSection();
                    }
                }
            }
            
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            showErrorMessage('Erro ao processar o arquivo. Verifique se é um arquivo Excel válido.');
            hideLoading();
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Processar dados do Excel
function processExcelData(workbook) {
    try {
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    

        if (!jsonData || jsonData.length === 0) {
            alert('O arquivo está vazio ou não possui dados válidos.');
            hideLoading();
            return;
        }

        const processedData = processRawData(jsonData.slice(1));
        if (!processedData || processedData.length === 0) {
            alert('Não foi possível processar os dados do arquivo. Verifique se o formato está correto.');
            hideLoading();
            return;
        }

        // LIMPAR DADOS ANTIGOS ANTES DE CARREGAR NOVOS
        dashboardData = [];
        window.dashboardData = [];
        
        // Carregar novos dados
        dashboardData = processedData;
        // Garantir que os dados estejam disponíveis globalmente para os gráficos
        window.dashboardData = processedData;
        

        
        updateDashboard();
        hideLoading();
        showDashboard();
    } catch (error) {
        console.error('Erro ao processar dados:', error);
        alert('Erro ao processar os dados do arquivo. Verifique se o arquivo está no formato correto.');
        hideLoading();
    }
}

// Processar dados brutos
function processRawData(rawData) {
    // Função para extrair data/hora de string tipo "PREVISAO: 12/07/2025 - 05:00 - ."
    function extractDateTimeFromAQ1(aq1) {
        if (!aq1 || typeof aq1 !== 'string') return null;
        
        
        
        // Regex para DD/MM/YYYY - HH:MM
        let match = aq1.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s*-\s*(\d{2}:\d{2})/);
        if (match) {
            const result = `${match[1]} ${match[2]}`;
                        return result;
        }
        
        // Regex para DD/MM/YYYY HH:MM
        match = aq1.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(\d{2}:\d{2})/);
        if (match) {
            return `${match[1]} ${match[2]}`;
        }
        
        // Regex para YYYY-MM-DD HH:MM:SS (remove segundos)
        match = aq1.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}):\d{2}/);
        if (match) {
            return `${match[1]} ${match[2]}`;
        }
        
        // Regex para DD-MM-YYYY HH:MM:SS (remove segundos)
        match = aq1.match(/(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2}):\d{2}/);
        if (match) {
            return `${match[1]} ${match[2]}`;
        }
        
        // Regex para DD/MM/YYYY HH:MM:SS (remove segundos)
        match = aq1.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2}):\d{2}/);
        if (match) {
            return `${match[1]} ${match[2]}`;
        }
        
        // Apenas data DD/MM/YYYY
        match = aq1.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
        if (match) {
            return match[1];
        }
        
        // Apenas data YYYY-MM-DD
        match = aq1.match(/(\d{4}-\d{2}-\d{2})/);
        if (match) {
            return match[1];
        }
        return null;
    }
    // Função para converter string data/hora para objeto Date
    function parseDateTimeString(str) {
        if (!str) return null;
        
        
        
        // DD/MM/YYYY HH:MM
        let match = str.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})[\sT]+(\d{2}):(\d{2})/);
        if (match) {
            return new Date(`${match[3]}-${match[2]}-${match[1]}T${match[4]}:${match[5]}:00`);
        }
        
        // DD/MM/YYYY
        match = str.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
        if (match) {
            return new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00`);
        }
        
        // YYYY-MM-DD HH:MM:SS
        match = str.match(/(\d{4})-(\d{2})-(\d{2})[\sT]+(\d{2}):(\d{2}):(\d{2})/);
        if (match) {
            return new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`);
        }
        
        // YYYY-MM-DD
        match = str.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            return new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00`);
        }
        return null;
    }
    return rawData.filter(row => row.length > 0).map(row => {
        // Função para converter data Excel para Date
        const convertExcelDate = (excelDate) => {
            if (!excelDate) return null;
            
            // Se já é uma string de data, tentar fazer parse
            if (typeof excelDate === 'string') {
                // Tentar formato DD-MM-YYYY (formato do arquivo)
                const match1 = excelDate.match(/(\d{2})-(\d{2})-(\d{4})/);
                if (match1) {
                    const [, day, month, year] = match1;
                    return new Date(year, month - 1, parseInt(day), 12, 0, 0);
                }
                
                // Tentar formato DD/MM/YYYY
                const match2 = excelDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                if (match2) {
                    const [, day, month, year] = match2;
                    return new Date(year, month - 1, parseInt(day), 12, 0, 0);
                }
                
                // Tentar formato YYYY-MM-DD
                const match3 = excelDate.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (match3) {
                    const [, year, month, day] = match3;
                    return new Date(year, month - 1, parseInt(day), 12, 0, 0);
                }
                
                // Tentar formato padrão
                const date = new Date(excelDate);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
            
            // Se é número (formato Excel)
            if (!isNaN(excelDate)) {
                const date = new Date((excelDate - 25569 + 1) * 86400 * 1000);
                return isNaN(date.getTime()) ? null : date;
            }
            
            return null;
        };

        // Função para formatar data e hora
        const formatDateTime = (date, time) => {
            if (!date) return '';
            const dateObj = convertExcelDate(date);
            if (!dateObj) return '';
            
            const dateStr = dateObj.toLocaleDateString('pt-BR', {
                timeZone: 'America/Sao_Paulo'
            });
            let timeStr = '';
            
            if (time) {
                if (!isNaN(time)) {
                    const totalSeconds = Math.round((time % 1) * 86400);
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                } else {
                    // Se for string, remover segundos se existirem
                    timeStr = String(time).replace(/\./g, ':').replace(/:\d{2}$/, '');
                }
            }
            
            return timeStr ? `${dateStr} ${timeStr}` : dateStr;
        };

        // Mapear colunas baseado na estrutura do arquivo
        // Função para extrair data/hora de string tipo "PREVISAO: 12/07/2025 - 05:00 - ."
        function extractDateTimeFromAQ1(aq1) {
            if (!aq1 || typeof aq1 !== 'string') return null;
            // Regex para DD/MM/YYYY - HH:MM
            let match = aq1.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s*-\s*(\d{2}:\d{2})/);
            if (match) return `${match[1]} ${match[2]}`;
            // Regex para DD/MM/YYYY HH:MM
            match = aq1.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(\d{2}:\d{2})/);
            if (match) return `${match[1]} ${match[2]}`;
            // Regex para YYYY-MM-DD HH:MM:SS
            match = aq1.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
            if (match) return `${match[1]} ${match[2]}`;
            // Regex para DD-MM-YYYY HH:MM:SS
            match = aq1.match(/(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})/);
            if (match) return `${match[1]} ${match[2]}`;
            // Apenas data
            match = aq1.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
            if (match) return match[1];
            match = aq1.match(/(\d{4}-\d{2}-\d{2})/);
            if (match) return match[1];
            return null;
        }
        // Função para converter string data/hora para objeto Date
        function parseDateTimeString(str) {
            if (!str) return null;
            // DD/MM/YYYY HH:MM
            let match = str.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})[\sT]+(\d{2}):(\d{2})/);
            if (match) return new Date(`${match[3]}-${match[2]}-${match[1]}T${match[4]}:${match[5]}:00`);
            // DD/MM/YYYY
            match = str.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
            if (match) return new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00`);
            // YYYY-MM-DD HH:MM:SS
            match = str.match(/(\d{4})-(\d{2})-(\d{2})[\sT]+(\d{2}):(\d{2}):(\d{2})/);
            if (match) return new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`);
            // YYYY-MM-DD
            match = str.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (match) return new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00`);
            return null;
        }
        // AQ1 = 41, BP1 = 67, BQ1 = 68
        const aq1 = row[41] || '';
        const bp1 = row[67] || '';
        const bq1 = row[68] || '';
        
        // Verificar outras colunas que podem conter previsão
        const outrasColunas = [];
        for (let i = 0; i < row.length; i++) {
            if (row[i] && typeof row[i] === 'string' && row[i].toLowerCase().includes('previs')) {
                outrasColunas.push({ coluna: i, valor: row[i] });
            }
        }
        let previsaoValidaAQ1 = false;
        let dataHoraPrevisaoAQ1 = '';
        

        
        // Montar data/hora combinada de BP1+BQ1
        let bp1bq1Str = '';
        let bp1bq1Date = null;
        
        if (bp1 && bq1) {
            // Se BP1 é número Excel (data), converter primeiro
            if (typeof bp1 === 'number' && bp1 > 30000) {
                const bp1Date = new Date((bp1 - 25569 + 1) * 86400 * 1000);
                const bp1DateStr = bp1Date.toLocaleDateString('pt-BR');
                bp1bq1Str = `${bp1DateStr} ${bq1}`;
            } else if (/\d{2}[:h]\d{2}/.test(bp1)) {
                // Se BP1 já tem hora, não concatena
                bp1bq1Str = bp1;
            } else {
                bp1bq1Str = `${bp1} ${bq1}`;
            }
        } else if (bp1) {
            // Se só tem BP1, converter se for número Excel
            if (typeof bp1 === 'number' && bp1 > 30000) {
                const bp1Date = new Date((bp1 - 25569 + 1) * 86400 * 1000);
                bp1bq1Str = bp1Date.toLocaleDateString('pt-BR');
            } else {
                bp1bq1Str = bp1;
            }
        } else if (bq1) {
            bp1bq1Str = bq1;
        }
        

        
        // Procurar previsão em AQ1 e outras colunas
        let previsaoEncontrada = null;
        let previsaoDateStr = '';
        let previsaoDate = null;
        
        // Primeiro, verificar AQ1
        if (typeof aq1 === 'string' && aq1.toLowerCase().includes('previs')) {
            previsaoEncontrada = { coluna: 41, valor: aq1 };
            previsaoDateStr = extractDateTimeFromAQ1(aq1);
            previsaoDate = parseDateTimeString(previsaoDateStr);
        }
        
        // Se não encontrou em AQ1, verificar outras colunas
        if (!previsaoEncontrada && outrasColunas.length > 0) {
            for (const col of outrasColunas) {
                const dateStr = extractDateTimeFromAQ1(col.valor);
                const date = parseDateTimeString(dateStr);
                if (date) {
                    previsaoEncontrada = col;
                    previsaoDateStr = dateStr;
                    previsaoDate = date;
                    break;
                }
            }
        }
        
        // Processar a previsão encontrada
        if (previsaoEncontrada) {
            // Converter BP1+BQ1 para data se ainda não foi convertido
            if (!bp1bq1Date) {
                bp1bq1Date = parseDateTimeString(bp1bq1Str);
            }
            dataHoraPrevisaoAQ1 = previsaoDateStr || '';
            

            
            // Só considera válido se previsão > BP1+BQ1 (ambos datas válidas)
            if (previsaoDate && bp1bq1Date) {
                if (previsaoDate > bp1bq1Date) {
                    previsaoValidaAQ1 = true;
                    

                }
            }
        }
        return {
            id: row[0] || '',
            ami: row[1] || '',
            tipoAMI: row[2] || '',
            estacao: row[3] || '',
            tipoSite: row[4] || '',
            produto: row[5] || '',
            classificacao: row[6] || '',
            fase: row[7] || '',
            atuacaoGMG: row[8] || '',
            dataGMGInicio: formatDateTime(row[9], row[10]),
            horaGMGInicio: row[10] || '',
            dataGMGFim: formatDateTime(row[11], row[12]),
            horaGMGFim: row[12] || '',
            localidade: row[13] || '',
            cm: row[14] || '',
            regiao: row[15] || '',
            concessionaria: row[16] || '',
            identificador: row[17] || '',
            obsEnergia: row[18] || '',
            solicitante: row[19] || '',
            dataCadast: formatDateTime(row[20], row[21]),
            horaCadast: row[21] || '',
            dataAcion: formatDateTime(row[22], row[23]),
            horaAcion: row[23] || '',
            empreiteira: row[24] || '',
            noc: row[25] || '',
            tecnico: row[26] || '',
            tecnologia: row[27] || '',
            criticidade: row[28] || '',
            prejuizo: row[29] || '',
            escopo: row[30] || '',
            incidenteRAL: row[31] || '',
            alarmes: row[32] || '',
            alarmesDescritivo: row[33] || '',
            dataAlarmes: formatDateTime(row[34], row[35]),
            horaAlarmes: row[35] || '',
            origemAlarme: row[36] || '',
            sla: '',
            tempo: '',
            // Ajuste: agora BP1 = 67 (data), BQ1 = 68 (hora)
            dataPrevisaoTec: (() => {
                const val = row[67];
                if (!val) return '';
                // Se for data válida
                if (typeof val === 'string' && /\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(val)) {
                    return formatDate(val);
                }
                // Se for número Excel (data)
                if (!isNaN(val) && Number(val) > 30000) {
                    // 30000 é um limite seguro para datas Excel (anos > 1982)
                    const date = new Date((val - 25569 + 1) * 86400 * 1000);
                    return date.toLocaleDateString('pt-BR');
                }
                // Se for hora (string tipo HH:MM:SS ou número decimal baixo)
                if (!isNaN(val)) {
                    let totalSeconds = Math.round((val % 1) * 86400);
                    let hours = Math.floor(totalSeconds / 3600);
                    let minutes = Math.floor((totalSeconds % 3600) / 60);
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                }
                if (typeof val === 'string') {
                    return val.replace(/\./g, ':').replace(/:\d{2}$/, '');
                }
                return String(val);
            })(),
            horaPrevisaoTec: (() => {
                const val = row[68];
                if (!val) return '';
                if (!isNaN(val)) {
                    let totalSeconds = Math.round((val % 1) * 86400);
                    let hours = Math.floor(totalSeconds / 3600);
                    let minutes = Math.floor((totalSeconds % 3600) / 60);
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                }
                if (typeof val === 'string') {
                    return val.replace(/\./g, ':').replace(/:\d{2}$/, '');
                }
                return String(val);
            })(),
            previsaoValidaAQ1,
            dataHoraPrevisaoAQ1
        };
    });
}

// Atualizar dashboard
function updateDashboard() {
    updateKPIs();
    updateFilters();
    updateTable();
    
    // Disparar evento para atualizar gráficos se necessário
    window.dispatchEvent(new CustomEvent('dashboardDataUpdated'));
    
    // Atualizar dados dos gráficos sempre que houver dados
    if (window.dashboardCharts && dashboardData.length > 0) {
        window.dashboardCharts.currentData = dashboardData;
        
        // Verificar se são dados de preventivas e mostrar seção específica
        const hasPreventivas = dashboardData.some(item => item.tipoAMI === 'PREVENTIVA');
        
        if (hasPreventivas && window.dashboardCharts) {
            window.dashboardCharts.showPreventivasSection();
        } else if (window.dashboardCharts) {
            window.dashboardCharts.hidePreventivasSection();
        }
        
        // Manter o modo atual (não alternar automaticamente)
        // Se estiver em modo gráficos, apenas atualizar
        if (window.dashboardCharts && window.dashboardCharts.isChartsMode) {
            setTimeout(() => {
                window.dashboardCharts.updateCharts();
            }, 500);
        }
    }
}

// Atualizar KPIs
function updateKPIs() {
    updateKPIsWithData(dashboardData);
}

// Atualizar KPIs com dados específicos (filtrados ou originais)
function updateKPIsWithData(data) {
    const totalAcionamentos = data.length;
    const emAndamento = data.filter(item => {
        const fase = (item.fase || '').toUpperCase();
        return fase.includes('ATUANDO') || fase.includes('GMG MOVEL') || fase.includes('GMG MÓVEL') || fase.includes('GMG MOVE');
    }).length;
    const concluidos = data.filter(item => 
        item.fase && item.fase.toLowerCase().includes('concluido')
    ).length;
    const criticos = data.filter(item => {
        const slaInfo = calculateSLAandTempo(item);
        return slaInfo.slaClass === 'critical';
    }).length;

    document.getElementById('totalAcionamentos').textContent = totalAcionamentos;
    document.getElementById('emAndamento').textContent = emAndamento;
    document.getElementById('concluidos').textContent = concluidos;
    document.getElementById('criticos').textContent = criticos;
}

// Atualizar filtros
function updateFilters() {
    const regioes = [...new Set(dashboardData.map(item => item.regiao).filter(Boolean))];
    const fases = [...new Set(dashboardData.map(item => item.fase).filter(Boolean))];
    const tiposAMI = [...new Set(dashboardData.map(item => item.tipoAMI).filter(Boolean))];
    const tiposSite = [...new Set(dashboardData.map(item => item.tipoSite).filter(Boolean))];
    const alarmes = [...new Set(dashboardData.map(item => item.alarmes).filter(Boolean))];

    populateSelect('filterRegiao', regioes);
    populateSelect('filterFase', fases);
    populateSelect('filterTipoAMI', tiposAMI);
    populateSelect('filterTipoSite', tiposSite);
    populateSelect('filterAlarmes', alarmes);
    
    // Adicionar event listeners para aplicar filtros automaticamente
    setupFilterEventListeners();
}

// Configurar event listeners para filtros
function setupFilterEventListeners() {
    const filterSelects = [
        'filterRegiao', 'filterFase', 'filterTipoAMI', 'filterTipoSite', 'filterAlarmes'
    ];
    
    filterSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            // Aplicar filtro quando seleção mudar
            select.addEventListener('change', () => {
        
                filterData();
            });
            
            // Aplicar filtro quando Enter for pressionado
            select.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
        
                    filterData();
                }
            });
        }
    });
}

// Popular select com opções
function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    // Manter a primeira opção (padrão)
    select.innerHTML = `<option value="">${select.options[0].text}</option>`;
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
    
    // Restaurar valor selecionado se ainda existir
    if (options.includes(currentValue)) {
        select.value = currentValue;
    }
}

// Filtrar dados
function filterData() {
    const regiao = document.getElementById('filterRegiao').value;
    const fase = document.getElementById('filterFase').value;
    const tipoAMI = document.getElementById('filterTipoAMI').value;
    const tipoSite = document.getElementById('filterTipoSite').value;
    const alarmes = document.getElementById('filterAlarmes').value;

    let filteredData = dashboardData;

    if (regiao) filteredData = filteredData.filter(item => item.regiao === regiao);
    if (fase) filteredData = filteredData.filter(item => item.fase === fase);
    if (tipoAMI) filteredData = filteredData.filter(item => item.tipoAMI === tipoAMI);
    if (tipoSite) filteredData = filteredData.filter(item => item.tipoSite === tipoSite);
    if (alarmes) filteredData = filteredData.filter(item => item.alarmes === alarmes);



    // Atualizar tabela
    updateTable(filteredData);
    
    // Atualizar KPIs com dados filtrados
    updateKPIsWithData(filteredData);
    
    // Atualizar gráficos se estiver no modo gráficos
    if (window.dashboardCharts && window.dashboardCharts.isChartsMode) {
        window.dashboardCharts.currentData = filteredData;
        window.dashboardCharts.updateCharts();
    }
}

// Limpar filtros
function clearFilters() {
    document.getElementById('filterRegiao').value = '';
    document.getElementById('filterFase').value = '';
    document.getElementById('filterTipoAMI').value = '';
    document.getElementById('filterTipoSite').value = '';
    document.getElementById('filterAlarmes').value = '';
    

    
    // Restaurar dados originais
    updateTable(dashboardData);
    
    // Restaurar KPIs originais
    updateKPIs();
    
    // Atualizar gráficos se estiver no modo gráficos
    if (window.dashboardCharts && window.dashboardCharts.isChartsMode) {
        window.dashboardCharts.currentData = dashboardData;
        window.dashboardCharts.updateCharts();
    }
}

// Atualizar tabela
function updateTable(data = dashboardData) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    data.forEach(item => {
        const slaInfo = calculateSLAandTempo(item);
        const row = document.createElement('tr');
        // Exibir só data, só hora, ou ambos, mas nunca dois horários
        let previsaoTec = '-';
        let previsaoTecClass = 'previsao-neutral';

        
        // NOVO: priorizar AQ1 se for previsão válida
        if (item.previsaoValidaAQ1 && item.dataHoraPrevisaoAQ1) {
            previsaoTec = item.dataHoraPrevisaoAQ1;
            previsaoTecClass = getPrevisaoTecClass(item.dataHoraPrevisaoAQ1, ''); // Usar função de cores
            

        } else if (item.dataPrevisaoTec && item.horaPrevisaoTec) {
            previsaoTec = `${item.dataPrevisaoTec} ${item.horaPrevisaoTec}`;
            previsaoTecClass = getPrevisaoTecClass(item.dataPrevisaoTec, item.horaPrevisaoTec);
            

        } else if (item.dataPrevisaoTec) {
            previsaoTec = item.dataPrevisaoTec;
            previsaoTecClass = getPrevisaoTecClass(item.dataPrevisaoTec, '00:00:00');
        } else if (item.horaPrevisaoTec) {
            previsaoTec = item.horaPrevisaoTec;
            previsaoTecClass = getPrevisaoTecClass('', item.horaPrevisaoTec);
        }
        


        // NOVO: Verificar se a fase é ATUANDO ou TECNICO ATUANDO COM GMG MOVEL/MÓVEL/MOVE
        const faseUpper = (item.fase || '').toUpperCase();
        const isAtuando = faseUpper === 'ATUANDO' ||
            faseUpper.includes('TECNICO ATUANDO COM GMG') ||
            faseUpper.includes('TECNICO ATUANDO COM GMG MÓVEL') ||
            faseUpper.includes('TECNICO ATUANDO COM GMG MOVEL') ||
            faseUpper.includes('TECNICO ATUANDO COM GMG MOVE');

        let previsaoTecHtml = '';
        if (isAtuando) {
            // Aplica badge verde especial
            previsaoTecHtml = `<span class="previsao-badge previsao-verde-atuando">${previsaoTec}</span>`;
        } else {
            previsaoTecHtml = `<span class="previsao-badge ${previsaoTecClass}">${previsaoTec}</span>`;
        }

        // Criar link para o GMS se tiver ID
        const amiLink = item.id ? 
            `<a href="https://rno.gms.stte.com.br/v3/acionamento_historico.php?acao=exibir&id=${item.id}" target="_blank" class="ami-link" title="Ver histórico do AMI ${item.ami} no GMS (ID: ${item.id})">${item.ami || '-'}</a>` : 
            (item.ami || '-');

        row.innerHTML = `
            <td>${amiLink}</td>
            <td>${item.solicitante || '-'}</td>
            <td>${item.estacao || '-'}</td>
            <td>${item.localidade || '-'}</td>
            <td>${item.regiao || '-'}</td>
            <td><span class="status-badge status-${getStatusClass(item.fase)}">${item.fase || '-'}</span></td>
            <td>${previsaoTecHtml}</td>
            <td>${item.alarmes || '-'}</td>
            <td>${formatDate(item.dataAcion) || '-'}</td>
            <td>${item.tecnico || '-'}</td>
            <td><span class="sla-badge sla-${slaInfo.slaClass}">${slaInfo.sla}</span></td>
            <td>${slaInfo.tempo || '-'}</td>
        `;
        
        // Adicionar event listener para o link do AMI
        const amiLinkElement = row.querySelector('.ami-link');
        if (amiLinkElement) {
            amiLinkElement.addEventListener('click', function(e) {
                // Mostrar notificação de abertura
                showInfoMessage(`Abrindo histórico do AMI ${item.ami} no GMS...`);
            });
        }
        
        tableBody.appendChild(row);
    });
}

// Calcular SLA e tempo
function calculateSLAandTempo(item) {
    if (!item.dataAcion) {
        return { sla: 'N/A', tempo: 'N/A', slaClass: 'neutral' };
    }

    const dataAcion = parseDateTime(item.dataAcion);
    if (!dataAcion) {
        return { sla: 'N/A', tempo: 'N/A', slaClass: 'neutral' };
    }

    const agora = new Date();
    const tempoDecorrido = agora - dataAcion;
    const horasDecorridas = tempoDecorrido / (1000 * 60 * 60);

    const slaConfig = getSLAConfig(item.tipoSite, item.alarmes);
    const tempoFormatado = formatTempo(tempoDecorrido);

    // Verificar se o técnico está atuando
    const fase = (item.fase || '').toLowerCase();
    const isTecnicoAtuando = fase.includes('atuando') || 
                            fase.includes('gmg móvel') || 
                            fase.includes('gmg movel') ||
                            fase.includes('técnico atuando') ||
                            fase.includes('tecnico atuando');

    let slaClass = 'good';
    
    // Se o técnico está atuando, sempre considerar como "good" (verde)
    if (isTecnicoAtuando) {
        slaClass = 'good';
    } else {
        // Aplicar regras normais de SLA apenas se não estiver atuando
    if (horasDecorridas > slaConfig.critico) {
        slaClass = 'critical';
    } else if (horasDecorridas > slaConfig.warning) {
        slaClass = 'warning';
    } else if (horasDecorridas > slaConfig.caution) {
        slaClass = 'caution';
        }
    }

    return {
        sla: `${slaConfig.horas}h`,
        tempo: tempoFormatado,
        slaClass: slaClass
    };
}

// Obter configuração de SLA
function getSLAConfig(tipoSite, tipoAlarme) {
    // Normaliza para maiúsculas para evitar problemas de comparação
    const alarme = (tipoAlarme || '').toUpperCase();

    if (alarme.includes('RETIFICADOR')) {
        return { horas: 24, caution: 12, warning: 18, critico: 24 };
    }
    if (
        alarme.includes('ENERGIA') ||
        alarme.includes('ALTA TEMPERATURA') ||
        alarme.includes('DISJUNTOR')
    ) {
        return { horas: 4, caution: 2, warning: 3, critico: 4 };
    }
    // Outros alarmes
    return { horas: 4, caution: 2, warning: 3, critico: 4 };
}

// Formatar tempo
function formatTempo(milliseconds) {
    const horas = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutos = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
        return `${horas}h ${minutos}m`;
    } else {
        return `${minutos}m`;
    }
}

// Fazer parse de data/hora
function parseDateTime(dateTimeStr) {
    if (!dateTimeStr) return null;
    
    // Tentar diferentes formatos
    const formats = [
        /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/,
        /(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/,
        /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/,  // Sem segundos - PRINCIPAL
        /(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/,   // Sem segundos
        /(\d{2})\/(\d{2})\/(\d{4})/,
        /(\d{2})-(\d{2})-(\d{4})/
    ];
    
    for (const format of formats) {
        const match = dateTimeStr.match(format);
        if (match) {
            const [, day, month, year, hour = 0, minute = 0, second = 0] = match;
            const result = new Date(year, month - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
            return result;
        }
    }
    
    // Se não encontrou nenhum formato, tentar criar uma data simples
    try {
        const result = new Date(dateTimeStr);
        if (!isNaN(result.getTime())) {
            return result;
        }
    } catch (error) {
        // Ignorar erro
    }
    
    return null;
}

// Obter classe de status
function getStatusClass(fase) {
    if (!fase) return 'neutral';
    
    const faseLower = fase.toLowerCase();
    if (faseLower.includes('assumido')) return 'assumido';
    if (faseLower.includes('previsao')) return 'previsao';
    if (faseLower.includes('atuando')) return 'atuando';
    if (faseLower.includes('concluido')) return 'concluido';
    
    return 'neutral';
}

// Formatar data
function formatDate(dateStr) {
    if (!dateStr) return '';
    // Se já está no formato DD/MM/YYYY ou DD-MM-YYYY, apenas retorna a data (sem hora)
    if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(dateStr)) {
        return dateStr.split(' ')[0];
    }
    // Caso contrário, tenta converter normalmente
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return dateStr;
    }
}

// Funções de UI
function showLoading() {
    document.getElementById('loading').classList.remove('d-none');
    document.getElementById('dashboard').classList.add('d-none');
    document.getElementById('emptyState').classList.add('d-none');
    document.getElementById('changelog').classList.add('d-none');
}

function hideLoading() {
    document.getElementById('loading').classList.add('d-none');
}

// Função showDashboard removida - agora implementada acima com navegação completa

function showEmptyState() {
    document.getElementById('emptyState').classList.remove('d-none');
    document.getElementById('dashboard').classList.add('d-none');
    document.getElementById('changelog').classList.add('d-none');
}

// Função para atualizar tabela
function refreshTable() {
    if (dashboardData.length > 0) {
        updateTable();
    }
}

// Função para atualizar dados do GMS
function updateFromGMS() {
    // Criar backup antes da atualização
    if (typeof createBackup === 'function') {
        createBackup('Antes da atualização do GMS');
    }
    
    const gmsUrl = 'https://rno.gms.stte.com.br/v3/excel.php?tabela=acionamento&aba=todos&cx_sel_filtro_01=&cx_filtro_01=&cx_sel_filtro_02=&cx_filtro_02=&cx_sel_filtro_03=&cx_filtro_03=&cx_de=&cx_ate=&abertos=SIM&nao_assumidos=NAO&qde=25';
    
    // Abrir o link do GMS em uma nova aba
    window.open(gmsUrl, '_blank');
    
    // Mostrar instruções para o usuário
    showInfoMessage('Nova aba aberta! Após o download, arraste o arquivo Excel para esta área ou clique em "Carregar Relatório".');
    
    // Ativar área de drop para arquivos
    activateDropZone();
}



// Função para ativar área de drop para arquivos
function activateDropZone() {
    const dashboard = document.getElementById('dashboard');
    const emptyState = document.getElementById('emptyState');
    
    // Marcar como ativo
    dropZoneActive = true;
    console.log('🎯 Modo de arraste visual ativado');
    
    // Adicionar classe de drop zone
    if (dashboard) dashboard.classList.add('drop-zone-active');
    if (emptyState) emptyState.classList.add('drop-zone-active');
    
    // Adicionar event listener apenas para tecla ESC
    document.addEventListener('keydown', handleKeyDown);
    
    // Mostrar mensagem com instruções
    showInfoMessage('📁 Modo de arraste visual ativado! Arraste um arquivo Excel aqui ou pressione ESC para cancelar.');
    
    // Remover drop zone após 15 segundos
    setTimeout(() => {
        deactivateDropZone();
    }, 15000);
}

// Função para desativar área de drop
function deactivateDropZone() {
    const dashboard = document.getElementById('dashboard');
    const emptyState = document.getElementById('emptyState');
    
    // Marcar como inativo
    dropZoneActive = false;
    console.log('❌ Modo de arraste visual desativado');
    
    if (dashboard) dashboard.classList.remove('drop-zone-active');
    if (emptyState) emptyState.classList.remove('drop-zone-active');
    
    document.removeEventListener('keydown', handleKeyDown);
}

// Função para lidar com drag over (modo visual)
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Função para lidar com drag over global (sempre ativa)
function handleGlobalDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Se não estiver no modo visual, mostrar feedback sutil
    if (!dropZoneActive) {
        document.body.style.cursor = 'copy';
    }
}



// Função para lidar com teclas pressionadas
function handleKeyDown(e) {
    // Se pressionar ESC e o modo de arraste estiver ativo, desativar
    if (e.key === 'Escape' && dropZoneActive) {
        deactivateDropZone();
    }
}

// Função para lidar com drop de arquivo (modo visual)
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        
        // Verificar se é um arquivo Excel
        if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.type === 'application/vnd.ms-excel' ||
            file.name.toLowerCase().endsWith('.xlsx') ||
            file.name.toLowerCase().endsWith('.xls')) {
            
            // Processar o arquivo
            processDroppedFile(file);
        } else {
            showErrorMessage('Por favor, arraste apenas arquivos Excel (.xls ou .xlsx)');
        }
    }
    
    // Desativar drop zone
    deactivateDropZone();
}

// Função para lidar com drop de arquivo global (sempre ativa)
function handleGlobalDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Restaurar cursor
    document.body.style.cursor = 'default';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        
        // Verificar se é um arquivo Excel
        if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.type === 'application/vnd.ms-excel' ||
            file.name.toLowerCase().endsWith('.xlsx') ||
            file.name.toLowerCase().endsWith('.xls')) {
            
            console.log('📁 Arquivo Excel detectado via drop global:', file.name);
            
            // Processar o arquivo
            processDroppedFile(file);
        } else {
            showErrorMessage('Por favor, arraste apenas arquivos Excel (.xls ou .xlsx)');
        }
    }
}

// Função para lidar com clique global
function handleGlobalClick(e) {
    // Se o modo visual estiver ativo e não clicou no botão "Atualizar", desativar
    if (dropZoneActive) {
        const target = e.target;
        const isUpdateButton = target.closest('a[onclick*="updateFromGMS"]') || 
                              target.closest('button[onclick*="updateFromGMS"]') ||
                              target.closest('.nav-link[onclick*="updateFromGMS"]');
        
        if (!isUpdateButton) {
            console.log('🖱️ Clique detectado - desativando modo visual de arraste');
            deactivateDropZone();
        }
    }
}

// Função para processar arquivo arrastado
function processDroppedFile(file) {
    // Criar backup antes de processar arquivo
    if (typeof createBackup === 'function') {
        createBackup(`Antes de processar arquivo: ${file.name}`);
    }
    
    // Desativar modo visual de arraste se estiver ativo
    if (dropZoneActive) {
        deactivateDropZone();
    }
    
    showLoading();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Processar dados
            processExcelData(workbook);
            
            // Verificar se é um arquivo do GMS
            const isGMSFile = file.name.toLowerCase().includes('acionamentos_gms') || 
                             file.name.toLowerCase().includes('gms') ||
                             file.name.toLowerCase().includes('excel.php');
            
            if (isGMSFile) {
                // Salvar no cache se for arquivo do GMS
                const timestamp = new Date().toISOString();
                const cacheData = {
                    timestamp: timestamp,
                    data: dashboardData
                };
                localStorage.setItem('gmsCache', JSON.stringify(cacheData));
                showCacheInfo(timestamp);
                showSuccessMessage('Arquivo do GMS importado e salvo no cache!');
            } else {
                showSuccessMessage('Arquivo importado com sucesso!');
            }
            
            hideLoading();
            
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            showErrorMessage('Erro ao processar o arquivo. Verifique se é um arquivo Excel válido.');
            hideLoading();
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Função unificada para mostrar notificações
function showNotification(message, type = 'info', duration = 5000) {
    if (!notificationContainer) {
        console.warn('Container de notificações não inicializado');
        return;
    }
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = `
        min-width: 300px;
        margin: 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Definir ícone baseado no tipo
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'danger') icon = 'exclamation-triangle';
    if (type === 'warning') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" onclick="removeNotification(this.parentElement)"></button>
    `;
    
    // Adicionar ao container
    notificationContainer.appendChild(notification);
    
    // Adicionar à fila
    notificationQueue.push(notification);
    
    // Remover automaticamente após o tempo especificado
    setTimeout(() => {
        removeNotification(notification);
    }, duration);
    
    // Limitar número máximo de notificações
    if (notificationQueue.length > 5) {
        const oldestNotification = notificationQueue.shift();
        if (oldestNotification && oldestNotification.parentNode) {
            oldestNotification.remove();
        }
    }
}

// Função para remover notificação
function removeNotification(notification) {
    if (notification && notification.parentNode) {
        // Adicionar animação de saída
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
                // Remover da fila
                const index = notificationQueue.indexOf(notification);
                if (index > -1) {
                    notificationQueue.splice(index, 1);
                }
            }
        }, 300);
    }
}

// Tornar função global para uso no HTML
window.removeNotification = removeNotification;

// Função para mostrar mensagem informativa
function showInfoMessage(message) {
    showNotification(message, 'info', 10000);
}

// Função para mostrar mensagem de sucesso
function showSuccessMessage(message) {
    showNotification(message, 'success', 5000);
}

// Função para mostrar mensagem de erro
function showErrorMessage(message) {
    showNotification(message, 'danger', 8000);
}

// Função para carregar dados do cache
function loadFromCache() {
    const cachedData = localStorage.getItem('gmsCache');
    
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            const cacheAge = new Date() - new Date(parsed.timestamp);
            const maxAge = 30 * 60 * 1000; // 30 minutos
            
            if (cacheAge < maxAge && parsed.data && parsed.data.length > 0) {
                dashboardData = parsed.data;
                // Garantir que os dados estejam disponíveis globalmente para os gráficos
                window.dashboardData = parsed.data;
                
                // Atualizar dashboard e mostrar dados
                updateDashboard();
                showDashboard();
                showCacheInfo(parsed.timestamp);
                
                // Verificar se são dados de preventivas e mostrar seção específica
                const isPreventivas = parsed.isPreventivas || dashboardData.some(item => item.tipoAMI === 'PREVENTIVA');
                if (isPreventivas && window.dashboardCharts) {
                    window.dashboardCharts.showPreventivasSection();
                }
                
                // Atualizar gráficos se estiverem em modo gráfico
                if (window.dashboardCharts && window.dashboardCharts.isChartsMode) {
                    window.dashboardCharts.currentData = parsed.data;
                    setTimeout(() => {
                        window.dashboardCharts.updateCharts();
                    }, 500);
                }
                
                return true;
            } else {
                // Cache expirado ou vazio, remover
                localStorage.removeItem('gmsCache');
            }
        } catch (error) {
            console.error('Erro ao carregar cache:', error);
            localStorage.removeItem('gmsCache');
        }
    }
    return false;
}

// Função para mostrar informações do cache
function showCacheInfo(timestamp) {
    const cacheInfo = document.getElementById('cacheInfo');
    const cacheInfoText = document.getElementById('cacheInfoText');
    
    if (timestamp) {
        const date = new Date(timestamp);
        const timeAgo = getTimeAgo(date);
        cacheInfoText.textContent = `Dados atualizados ${timeAgo} (${date.toLocaleString('pt-BR')})`;
        cacheInfo.style.display = 'block';
    } else {
        cacheInfo.style.display = 'none';
    }
}

// Função para calcular tempo decorrido
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) {
        return 'agora mesmo';
    } else if (diffMins < 60) {
        return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
        return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
        const diffDays = Math.floor(diffHours / 24);
        return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
}

// Função para limpar cache
function clearCache() {
    localStorage.removeItem('gmsCache');
    document.getElementById('cacheInfo').style.display = 'none';
    
    // Limpar dados atuais também
    dashboardData = [];
    window.dashboardData = [];
    
    // Ocultar gráficos de preventivas
    if (window.dashboardCharts) {
        window.dashboardCharts.hidePreventivasSection();
    }
    
    // Mostrar estado vazio
    showEmptyState();
    
    showSuccessMessage('Cache e dados limpos com sucesso!');
}

// Função de debug removida - não é mais necessária

// Download de relatório TXT organizado por estados e fases
function downloadReport() {
    if (dashboardData.length === 0) {
        alert('Nenhum dado disponível para download.');
        return;
    }

    const regiao = document.getElementById('filterRegiao').value;
    const fase = document.getElementById('filterFase').value;
    const tipoAMI = document.getElementById('filterTipoAMI').value;
    const tipoSite = document.getElementById('filterTipoSite').value;
    const alarmes = document.getElementById('filterAlarmes').value;

    let filteredData = dashboardData;

    if (regiao) filteredData = filteredData.filter(item => item.regiao === regiao);
    if (fase) filteredData = filteredData.filter(item => item.fase === fase);
    if (tipoAMI) filteredData = filteredData.filter(item => item.tipoAMI === tipoAMI);
    if (tipoSite) filteredData = filteredData.filter(item => item.tipoSite === tipoSite);
    if (alarmes) filteredData = filteredData.filter(item => item.alarmes === alarmes);

    // Função para obter nome completo do estado
    function getEstadoNome(sigla) {
        const estados = {
            'PA': 'PARÁ',
            'AM': 'AMAZONAS',
            'MA': 'MARANHÃO',
            'RR': 'RORAIMA',
            'AP': 'AMAPÁ',
            'TO': 'TOCANTINS',
            'AC': 'ACRE',
            'RO': 'RONDÔNIA'
        };
        return estados[sigla] || sigla;
    }

    // Função para formatar data e hora
    function formatDataHora(item) {
        let dataHora = '';
        if (item.dataAcion) {
            if (/\d{2}[:h]\d{2}/.test(item.dataAcion)) {
                dataHora = item.dataAcion;
            } else if (item.horaAcion) {
                dataHora = `${item.dataAcion} ${item.horaAcion}`;
            } else {
                dataHora = item.dataAcion;
            }
        } else if (item.horaAcion) {
            dataHora = item.horaAcion;
        } else {
            dataHora = 'N/A';
        }
        return dataHora;
    }

    // Função para formatar previsão do técnico
    function formatPrevisaoTec(item) {
        let previsao = '';
        
        // Verificar se temos data e hora da previsão do técnico
        if (item.dataPrevisaoTec) {
            if (/\d{2}[:h]\d{2}/.test(item.dataPrevisaoTec)) {
                // Se já contém hora no formato DD/MM/YYYY HH:MM
                previsao = item.dataPrevisaoTec;
            } else if (item.horaPrevisaoTec) {
                // Combinar data e hora separadas
                previsao = `${item.dataPrevisaoTec} ${item.horaPrevisaoTec}`;
            } else {
                // Só data
                previsao = item.dataPrevisaoTec;
            }
        } else if (item.horaPrevisaoTec) {
            // Só hora
            previsao = item.horaPrevisaoTec;
        } else if (item.dataHoraPrevisaoAQ1) {
            // Usar previsão extraída do AQ1 se disponível
            previsao = item.dataHoraPrevisaoAQ1;
        } else {
            // Verificar outros campos possíveis
            const camposPossiveis = [
                'previsaoTec',
                'previsaoTecnico', 
                'dataPrevisao',
                'horaPrevisao',
                'previsao',
                'dataHoraPrevisao'
            ];
            
            for (const campo of camposPossiveis) {
                if (item[campo]) {
                    previsao = item[campo];
                    break;
                }
            }
            
            if (!previsao) {
                previsao = 'N/A';
            }
        }
        return previsao;
    }

    // Organizar dados por estado e fase
    const dadosOrganizados = {};
    
    filteredData.forEach(item => {
        const estado = item.regiao || 'N/A';
        const fase = item.fase || 'N/A';
        
        if (!dadosOrganizados[estado]) {
            dadosOrganizados[estado] = {};
        }
        if (!dadosOrganizados[estado][fase]) {
            dadosOrganizados[estado][fase] = [];
        }
        dadosOrganizados[estado][fase].push(item);
    });

    // Gerar relatório organizado
    let reportContent = '╔══════════════════════════════════════════════════════════════════════════════╗\n';
    reportContent += '║                        INFORME OPERACIONAL NOC                                ║\n';
    reportContent += '║                    Relatório de Ocorrências Técnicas                          ║\n';
    reportContent += '╚══════════════════════════════════════════════════════════════════════════════╝\n\n';
    reportContent += '📋 Segue abaixo o resumo das ocorrências registradas no NOC para acompanhamento e providências:\n\n';

    // Processar cada estado
    Object.keys(dadosOrganizados).sort().forEach(estado => {
        const estadoNome = getEstadoNome(estado);
        const fases = dadosOrganizados[estado];
        
        // Separador de estado
        reportContent += `\n${'═'.repeat(80)}\n`;
        reportContent += `🏢 ESTADO: ${estadoNome} (${estado})\n`;
        reportContent += `${'═'.repeat(80)}\n\n`;

        // Processar fases em ordem de prioridade
        const ordemFases = ['ATUANDO', 'TECNICO ACIONADO', 'TECNICO ATUANDO COM GMG MOVEL', 'PREVISAO', 'INFORMAR TECNICO'];
        
        ordemFases.forEach(faseNome => {
            if (fases[faseNome] && fases[faseNome].length > 0) {
                const items = fases[faseNome];
                
                // Título da seção
                let tituloSecao = '';
                switch(faseNome) {
                    case 'ATUANDO':
                        tituloSecao = `🚨 EM ATUAÇÃO NO ${estadoNome}`;
                        break;
                    case 'TECNICO ACIONADO':
                        tituloSecao = `📞 TÉCNICO ACIONADO NO ${estadoNome}`;
                        break;
                    case 'TECNICO ATUANDO COM GMG MOVEL':
                        tituloSecao = `🚗 TÉCNICO ATUANDO COM GMG MÓVEL NO ${estadoNome}`;
                        break;
                    case 'PREVISAO':
                        tituloSecao = `⏰ FASE: PREVISÃO NO ${estadoNome}`;
                        break;
                    case 'INFORMAR TECNICO':
                        tituloSecao = `📢 INFORMAR TÉCNICO NO ${estadoNome}`;
                        break;
                    default:
                        tituloSecao = `📋 ${faseNome} NO ${estadoNome}`;
                }
                
                reportContent += `${tituloSecao}\n`;
                reportContent += `${'─'.repeat(tituloSecao.length)}\n\n`;

                // Listar itens da fase
                items.forEach(item => {
                    reportContent += `AMI: ${item.ami || 'N/A'}\n`;
                    reportContent += `ESTAÇÃO: ${item.estacao || 'N/A'}\n`;
                    reportContent += `TIPO DE ALARME: ${item.alarmes || 'N/A'}\n`;
                    reportContent += `TÉCNICO RESPONSÁVEL: ${item.tecnico || 'N/A'}\n`;
                    reportContent += `FASE: ${item.fase || 'N/A'}\n`;
                    reportContent += `REGIÃO: ${item.regiao || 'N/A'}\n`;
                    reportContent += `DATA E HORA: ${formatDataHora(item)}\n`;
                    
                    // Adicionar previsão do técnico se disponível
                    const previsaoTec = formatPrevisaoTec(item);
                    if (previsaoTec !== 'N/A') {
                        // Só mostrar previsão se o técnico não estiver atuando
                        const fase = (item.fase || '').toUpperCase();
                        const tecnicosAtuando = fase.includes('ATUANDO') || 
                                              fase.includes('GMG MOVEL') || 
                                              fase.includes('GMG MÓVEL') || 
                                              fase.includes('GMG MOVE');
                        
                        if (!tecnicosAtuando) {
                            reportContent += `PREVISÃO DO TÉCNICO: ${previsaoTec}\n`;
                        }
                    }
                    
                    reportContent += '\n';
                });
                
                reportContent += '\n';
            }
        });

        // Processar outras fases não listadas na ordem padrão
        Object.keys(fases).forEach(faseNome => {
            if (!ordemFases.includes(faseNome) && fases[faseNome].length > 0) {
                const items = fases[faseNome];
                
                reportContent += `📋 ${faseNome} NO ${estadoNome}\n`;
                reportContent += `${'─'.repeat(faseNome.length + estadoNome.length + 8)}\n\n`;

                items.forEach(item => {
                    reportContent += `AMI: ${item.ami || 'N/A'}\n`;
                    reportContent += `ESTAÇÃO: ${item.estacao || 'N/A'}\n`;
                    reportContent += `TIPO DE ALARME: ${item.alarmes || 'N/A'}\n`;
                    reportContent += `TÉCNICO RESPONSÁVEL: ${item.tecnico || 'N/A'}\n`;
                    reportContent += `FASE: ${item.fase || 'N/A'}\n`;
                    reportContent += `REGIÃO: ${item.regiao || 'N/A'}\n`;
                    reportContent += `DATA E HORA: ${formatDataHora(item)}\n`;
                    
                    const previsaoTec = formatPrevisaoTec(item);
                    if (previsaoTec !== 'N/A') {
                        // Só mostrar previsão se o técnico não estiver atuando
                        const fase = (item.fase || '').toUpperCase();
                        const tecnicosAtuando = fase.includes('ATUANDO') || 
                                              fase.includes('GMG MOVEL') || 
                                              fase.includes('GMG MÓVEL') || 
                                              fase.includes('GMG MOVE');
                        
                        if (!tecnicosAtuando) {
                            reportContent += `PREVISÃO DO TÉCNICO: ${previsaoTec}\n`;
                        }
                    }
                    
                    reportContent += '\n';
                });
                
                reportContent += '\n';
            }
        });
    });

    // Rodapé do relatório
    reportContent += `${'═'.repeat(80)}\n`;
    reportContent += `📊 RESUMO ESTATÍSTICO\n`;
    reportContent += `${'═'.repeat(80)}\n\n`;
    
    let totalGeral = 0;
    Object.keys(dadosOrganizados).forEach(estado => {
        const estadoNome = getEstadoNome(estado);
        let totalEstado = 0;
        Object.keys(dadosOrganizados[estado]).forEach(fase => {
            totalEstado += dadosOrganizados[estado][fase].length;
        });
        totalGeral += totalEstado;
        reportContent += `${estadoNome}: ${totalEstado} ocorrências\n`;
    });
    
    reportContent += `\nTOTAL GERAL: ${totalGeral} ocorrências\n`;
    reportContent += `\nRelatório gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    reportContent += `${'═'.repeat(80)}\n`;

    // Download do arquivo
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe_operacional_noc_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Download de relatório Excel
function downloadExcel() {
    if (dashboardData.length === 0) {
        alert('Nenhum dado disponível para download.');
        return;
    }

    const regiao = document.getElementById('filterRegiao').value;
    const fase = document.getElementById('filterFase').value;
    const tipoAMI = document.getElementById('filterTipoAMI').value;
    const tipoSite = document.getElementById('filterTipoSite').value;
    const alarmes = document.getElementById('filterAlarmes').value;

    let filteredData = dashboardData;

    if (regiao) filteredData = filteredData.filter(item => item.regiao === regiao);
    if (fase) filteredData = filteredData.filter(item => item.fase === fase);
    if (tipoAMI) filteredData = filteredData.filter(item => item.tipoAMI === tipoAMI);
    if (tipoSite) filteredData = filteredData.filter(item => item.tipoSite === tipoSite);
    if (alarmes) filteredData = filteredData.filter(item => item.alarmes === alarmes);

    // Preparar dados para Excel
    const excelData = filteredData.map(item => {
        const slaInfo = calculateSLAandTempo(item);
        return {
            'AMI': item.ami || '',
            'Estação': item.estacao || '',
            'Localidade': item.localidade || '',
            'Região': item.regiao || '',
            'Fase': item.fase || '',
            'Tipo Site': item.tipoSite || '',
            'Tipo Alarme': item.alarmes || '',
            'Data Acionamento': formatDate(item.dataAcion) || '',
            'Técnico': item.tecnico || '',
            'SLA': slaInfo.sla,
            'Tempo': slaInfo.tempo || ''
        };
    });

    // Criar workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

    // Download
    XLSX.writeFile(wb, `relatorio_acionamentos_${new Date().toISOString().split('T')[0]}.xlsx`);
} 

function getPrevisaoTecClass(data, hora) {
    // Sistema de cores otimizado ✅
    
    // Se temos data e hora combinadas (formato DD/MM/YYYY HH:MM)
    if (data && data.includes(' ') && data.includes(':')) {
        // Data já está no formato completo DD/MM/YYYY HH:MM
        const dt = parseDateTime(data);
        if (dt && !isNaN(dt.getTime())) {
            const agora = new Date();
            const diffMs = dt - agora;
            
            if (diffMs >= 3600 * 1000) {
                // Mais de 1h para a previsão
                return 'previsao-ok';
            } else if (diffMs >= 0 && diffMs < 3600 * 1000) {
                // Menos de 1h para a previsão
                return 'previsao-warning';
            } else if (diffMs < 0) {
                // Já passou da previsão
                return 'previsao-atraso';
            }
        }
    }
    
    // Se temos data e hora separadas
    if (data && hora) {
        let dataStr = data || '';
        let horaStr = hora || '00:00';
        
        // Tentar montar Date
        let dt = null;
        if (dataStr) {
            // Se data já está no formato DD/MM/YYYY
            const match = dataStr.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
            if (match) {
                const [, day, month, year] = match;
                const [h, m] = horaStr.split(':').map(x => parseInt(x) || 0);
                dt = new Date(year, month - 1, day, h, m, 0);
            }
        }
        
        if (dt && !isNaN(dt.getTime())) {
            const agora = new Date();
            const diffMs = dt - agora;
            
            if (diffMs >= 3600 * 1000) {
                // Mais de 1h para a previsão
                return 'previsao-ok';
            } else if (diffMs >= 0 && diffMs < 3600 * 1000) {
                // Menos de 1h para a previsão
                return 'previsao-warning';
            } else if (diffMs < 0) {
                // Já passou da previsão
                return 'previsao-atraso';
            }
        }
    }
    
    // Se temos apenas data (sem hora)
    if (data && !hora && !data.includes(':')) {
        const dt = parseDateTime(data);
        if (dt && !isNaN(dt.getTime())) {
            const agora = new Date();
            const diffMs = dt - agora;
            
            if (diffMs >= 3600 * 1000) {
                return 'previsao-ok';
            } else if (diffMs >= 0 && diffMs < 3600 * 1000) {
                return 'previsao-warning';
            } else if (diffMs < 0) {
                return 'previsao-atraso';
            }
        }
    }
    
    return 'previsao-neutral';
}

// Download de relatório PDF
function downloadPDF() {
    if (dashboardData.length === 0) {
        alert('Nenhum dado disponível para download.');
        return;
    }

    const regiao = document.getElementById('filterRegiao').value;
    const fase = document.getElementById('filterFase').value;
    const tipoAMI = document.getElementById('filterTipoAMI').value;
    const tipoSite = document.getElementById('filterTipoSite').value;
    const alarmes = document.getElementById('filterAlarmes').value;

    let filteredData = dashboardData;

    if (regiao) filteredData = filteredData.filter(item => item.regiao === regiao);
    if (fase) filteredData = filteredData.filter(item => item.fase === fase);
    if (tipoAMI) filteredData = filteredData.filter(item => item.tipoAMI === tipoAMI);
    if (tipoSite) filteredData = filteredData.filter(item => item.tipoSite === tipoSite);
    if (alarmes) filteredData = filteredData.filter(item => item.alarmes === alarmes);

    // Função para obter nome completo do estado
    function getEstadoNome(sigla) {
        const estados = {
            'PA': 'PARÁ',
            'AM': 'AMAZONAS',
            'MA': 'MARANHÃO',
            'RR': 'RORAIMA',
            'AP': 'AMAPÁ',
            'TO': 'TOCANTINS',
            'AC': 'ACRE',
            'RO': 'RONDÔNIA'
        };
        return estados[sigla] || sigla;
    }

    // Função para formatar data e hora
    function formatDataHora(item) {
        let dataHora = '';
        if (item.dataAcion) {
            if (/\d{2}[:h]\d{2}/.test(item.dataAcion)) {
                dataHora = item.dataAcion;
            } else if (item.horaAcion) {
                dataHora = `${item.dataAcion} ${item.horaAcion}`;
            } else {
                dataHora = item.dataAcion;
            }
        } else if (item.horaAcion) {
            dataHora = item.horaAcion;
        } else {
            dataHora = 'N/A';
        }
        return dataHora;
    }

    // Função para formatar previsão do técnico
    function formatPrevisaoTec(item) {
        let previsao = '';
        
        // Verificar se temos data e hora da previsão do técnico
        if (item.dataPrevisaoTec) {
            if (/\d{2}[:h]\d{2}/.test(item.dataPrevisaoTec)) {
                // Se já contém hora no formato DD/MM/YYYY HH:MM
                previsao = item.dataPrevisaoTec;
            } else if (item.horaPrevisaoTec) {
                // Combinar data e hora separadas
                previsao = `${item.dataPrevisaoTec} ${item.horaPrevisaoTec}`;
            } else {
                // Só data
                previsao = item.dataPrevisaoTec;
            }
        } else if (item.horaPrevisaoTec) {
            // Só hora
            previsao = item.horaPrevisaoTec;
        } else if (item.dataHoraPrevisaoAQ1) {
            // Usar previsão extraída do AQ1 se disponível
            previsao = item.dataHoraPrevisaoAQ1;
        } else {
            // Verificar outros campos possíveis
            const camposPossiveis = [
                'previsaoTec',
                'previsaoTecnico', 
                'dataPrevisao',
                'horaPrevisao',
                'previsao',
                'dataHoraPrevisao'
            ];
            
            for (const campo of camposPossiveis) {
                if (item[campo]) {
                    previsao = item[campo];
                    break;
                }
            }
            
            if (!previsao) {
                previsao = 'N/A';
            }
        }
        return previsao;
    }

    // Organizar dados por estado e fase
    const dadosOrganizados = {};
    
    filteredData.forEach(item => {
        const estado = item.regiao || 'N/A';
        const fase = item.fase || 'N/A';
        
        if (!dadosOrganizados[estado]) {
            dadosOrganizados[estado] = {};
        }
        if (!dadosOrganizados[estado][fase]) {
            dadosOrganizados[estado][fase] = [];
        }
        dadosOrganizados[estado][fase].push(item);
    });

    // Criar PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações de página
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    
    let yPosition = 30;
    
    // Função para adicionar texto com quebra de linha
    function addText(text, x, y, maxWidth, fontSize = 12, fontStyle = 'normal') {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        
        return lines.length * (fontSize * 0.4);
    }
    
    // Função para adicionar linha horizontal
    function addHorizontalLine(y) {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
    }
    
    // Cabeçalho
    doc.setFillColor(0, 51, 102); // Azul escuro
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    addText('INFORME OPERACIONAL NOC', pageWidth/2, 20, contentWidth, 18, 'bold');
    addText('Relatório de Ocorrências Técnicas', pageWidth/2, 30, contentWidth, 12, 'normal');
    
    // Resetar cor do texto
    doc.setTextColor(0, 0, 0);
    
    yPosition = 50;
    
    // Descrição
    yPosition += addText('Segue abaixo o resumo das ocorrências registradas no NOC para acompanhamento e providências:', margin, yPosition, contentWidth, 10);
    yPosition += 10;
    
    // Processar cada estado
    Object.keys(dadosOrganizados).sort().forEach(estado => {
        const estadoNome = getEstadoNome(estado);
        const fases = dadosOrganizados[estado];
        
        // Verificar se há espaço suficiente na página
        if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 30;
        }
        
        // Separador de estado
        addHorizontalLine(yPosition);
        yPosition += 5;
        
        doc.setTextColor(0, 51, 102);
        yPosition += addText(`ESTADO: ${estadoNome} (${estado})`, margin, yPosition, contentWidth, 14, 'bold');
        doc.setTextColor(0, 0, 0);
        
        addHorizontalLine(yPosition);
        yPosition += 10;
        
        // Processar fases em ordem de prioridade
        const ordemFases = ['ATUANDO', 'TECNICO ACIONADO', 'TECNICO ATUANDO COM GMG MOVEL', 'PREVISAO', 'INFORMAR TECNICO'];
        
        ordemFases.forEach(faseNome => {
            if (fases[faseNome] && fases[faseNome].length > 0) {
                const items = fases[faseNome];
                
                // Verificar se há espaço suficiente na página
                if (yPosition > pageHeight - 80) {
                    doc.addPage();
                    yPosition = 30;
                }
                
                // Título da seção
                let tituloSecao = '';
                let corSecao = [0, 0, 0];
                
                switch(faseNome) {
                    case 'ATUANDO':
                        tituloSecao = `EM ATUAÇÃO NO ${estadoNome}`;
                        corSecao = [220, 53, 69]; // Vermelho
                        break;
                    case 'TECNICO ACIONADO':
                        tituloSecao = `TÉCNICO ACIONADO NO ${estadoNome}`;
                        corSecao = [255, 193, 7]; // Amarelo
                        break;
                    case 'TECNICO ATUANDO COM GMG MOVEL':
                        tituloSecao = `TÉCNICO ATUANDO COM GMG MÓVEL NO ${estadoNome}`;
                        corSecao = [255, 193, 7]; // Amarelo
                        break;
                    case 'PREVISAO':
                        tituloSecao = `FASE: PREVISÃO NO ${estadoNome}`;
                        corSecao = [40, 167, 69]; // Verde
                        break;
                    case 'INFORMAR TECNICO':
                        tituloSecao = `INFORMAR TÉCNICO NO ${estadoNome}`;
                        corSecao = [108, 117, 125]; // Cinza
                        break;
                    default:
                        tituloSecao = `${faseNome} NO ${estadoNome}`;
                        corSecao = [0, 0, 0]; // Preto
                }
                
                doc.setTextColor(corSecao[0], corSecao[1], corSecao[2]);
                yPosition += addText(tituloSecao, margin, yPosition, contentWidth, 12, 'bold');
                doc.setTextColor(0, 0, 0);
                
                yPosition += 5;
                
                // Listar itens da fase
                items.forEach(item => {
                    // Verificar se há espaço suficiente na página
                    if (yPosition > pageHeight - 100) {
                        doc.addPage();
                        yPosition = 30;
                    }
                    
                    // AMI
                    doc.setTextColor(0, 51, 102);
                    yPosition += addText(`AMI: ${item.ami || 'N/A'}`, margin, yPosition, contentWidth, 10, 'bold');
                    doc.setTextColor(0, 0, 0);
                    
                    // Estação
                    yPosition += addText(`ESTAÇÃO: ${item.estacao || 'N/A'}`, margin, yPosition, contentWidth, 10);
                    
                    // Tipo de Alarme
                    yPosition += addText(`TIPO DE ALARME: ${item.alarmes || 'N/A'}`, margin, yPosition, contentWidth, 10);
                    
                    // Técnico Responsável
                    yPosition += addText(`TÉCNICO RESPONSÁVEL: ${item.tecnico || 'N/A'}`, margin, yPosition, contentWidth, 10);
                    
                    // Fase
                    doc.setTextColor(0, 51, 102);
                    yPosition += addText(`FASE: ${item.fase || 'N/A'}`, margin, yPosition, contentWidth, 10, 'bold');
                    doc.setTextColor(0, 0, 0);
                    
                    // Região
                    yPosition += addText(`REGIÃO: ${item.regiao || 'N/A'}`, margin, yPosition, contentWidth, 10);
                    
                    // Data e Hora
                    yPosition += addText(`DATA E HORA: ${formatDataHora(item)}`, margin, yPosition, contentWidth, 10);
                    
                    // Previsão do técnico (se não estiver atuando)
                    const previsaoTec = formatPrevisaoTec(item);
                    if (previsaoTec !== 'N/A') {
                        const fase = (item.fase || '').toUpperCase();
                        const tecnicosAtuando = fase.includes('ATUANDO') || 
                                              fase.includes('GMG MOVEL') || 
                                              fase.includes('GMG MÓVEL') || 
                                              fase.includes('GMG MOVE');
                        
                        if (!tecnicosAtuando) {
                            doc.setTextColor(40, 167, 69); // Verde
                            yPosition += addText(`PREVISÃO DO TÉCNICO: ${previsaoTec}`, margin, yPosition, contentWidth, 10, 'bold');
                            doc.setTextColor(0, 0, 0);
                        }
                    }
                    
                    yPosition += 8;
                });
                
                yPosition += 5;
            }
        });

        // Processar outras fases não listadas na ordem padrão
        Object.keys(fases).forEach(faseNome => {
            if (!ordemFases.includes(faseNome) && fases[faseNome].length > 0) {
                const items = fases[faseNome];
                
                // Verificar se há espaço suficiente na página
                if (yPosition > pageHeight - 80) {
                    doc.addPage();
                    yPosition = 30;
                }
                
                doc.setTextColor(108, 117, 125);
                yPosition += addText(`${faseNome} NO ${estadoNome}`, margin, yPosition, contentWidth, 12, 'bold');
                doc.setTextColor(0, 0, 0);
                
                yPosition += 5;
                
                items.forEach(item => {
                    // Verificar se há espaço suficiente na página
                    if (yPosition > pageHeight - 100) {
                        doc.addPage();
                        yPosition = 30;
                    }
                    
                    // AMI
                    doc.setTextColor(0, 51, 102);
                    yPosition += addText(`AMI: ${item.ami || 'N/A'}`, margin, yPosition, contentWidth, 10, 'bold');
                    doc.setTextColor(0, 0, 0);
                    
                    // Estação
                    yPosition += addText(`ESTAÇÃO: ${item.estacao || 'N/A'}`, margin, yPosition, contentWidth, 10);
                    
                    // Tipo de Alarme
                    yPosition += addText(`TIPO DE ALARME: ${item.alarmes || 'N/A'}`, margin, yPosition, contentWidth, 10);
                    
                    // Técnico Responsável
                    yPosition += addText(`TÉCNICO RESPONSÁVEL: ${item.tecnico || 'N/A'}`, margin, yPosition, contentWidth, 10);
                    
                    // Fase
                    doc.setTextColor(0, 51, 102);
                    yPosition += addText(`FASE: ${item.fase || 'N/A'}`, margin, yPosition, contentWidth, 10, 'bold');
                    doc.setTextColor(0, 0, 0);
                    
                    // Região
                    yPosition += addText(`REGIÃO: ${item.regiao || 'N/A'}`, margin, yPosition, contentWidth, 10);
                    
                    // Data e Hora
                    yPosition += addText(`DATA E HORA: ${formatDataHora(item)}`, margin, yPosition, contentWidth, 10);
                    
                    // Previsão do técnico (se não estiver atuando)
                    const previsaoTec = formatPrevisaoTec(item);
                    if (previsaoTec !== 'N/A') {
                        const fase = (item.fase || '').toUpperCase();
                        const tecnicosAtuando = fase.includes('ATUANDO') || 
                                              fase.includes('GMG MOVEL') || 
                                              fase.includes('GMG MÓVEL') || 
                                              fase.includes('GMG MOVE');
                        
                        if (!tecnicosAtuando) {
                            doc.setTextColor(40, 167, 69); // Verde
                            yPosition += addText(`PREVISÃO DO TÉCNICO: ${previsaoTec}`, margin, yPosition, contentWidth, 10, 'bold');
                            doc.setTextColor(0, 0, 0);
                        }
                    }
                    
                    yPosition += 8;
                });
                
                yPosition += 5;
            }
        });
    });

    // Rodapé com estatísticas
    if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 30;
    }
    
    addHorizontalLine(yPosition);
    yPosition += 5;
    
    doc.setTextColor(0, 51, 102);
    yPosition += addText('RESUMO ESTATÍSTICO', margin, yPosition, contentWidth, 14, 'bold');
    doc.setTextColor(0, 0, 0);
    
    addHorizontalLine(yPosition);
    yPosition += 10;
    
    let totalGeral = 0;
    Object.keys(dadosOrganizados).forEach(estado => {
        const estadoNome = getEstadoNome(estado);
        let totalEstado = 0;
        Object.keys(dadosOrganizados[estado]).forEach(fase => {
            totalEstado += dadosOrganizados[estado][fase].length;
        });
        totalGeral += totalEstado;
        yPosition += addText(`${estadoNome}: ${totalEstado} ocorrências`, margin, yPosition, contentWidth, 10);
    });
    
    yPosition += 5;
    doc.setTextColor(0, 51, 102);
    yPosition += addText(`TOTAL GERAL: ${totalGeral} ocorrências`, margin, yPosition, contentWidth, 12, 'bold');
    doc.setTextColor(0, 0, 0);
    
    yPosition += 10;
    yPosition += addText(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition, contentWidth, 10);
    
    addHorizontalLine(yPosition);
    
    // Download do PDF
    doc.save(`informe_operacional_noc_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Sistema de cores funcionando corretamente ✅ 