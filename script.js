// Variáveis globais
let dashboardData = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
    showEmptyState();
    initializeNavigation();
});

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
    // Por enquanto, apenas mostra o dashboard
    // Você pode expandir isso para mostrar diferentes seções
    if (sectionName === 'dashboard') {
        if (dashboardData.length > 0) {
            showDashboard();
        } else {
            showEmptyState();
        }
    }
}

// Inicializar upload de arquivo
function initializeFileUpload() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileUpload);
}

// Manipular upload de arquivo
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Remover exibição do nome do arquivo, pois não existe mais o elemento fileName
    // document.getElementById('fileName').textContent = file.name;
    
    // Mostrar loading
    showLoading();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Processar dados
            processExcelData(workbook);
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            alert('Erro ao processar o arquivo. Verifique se é um arquivo Excel válido.');
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
        console.log('Conteúdo lido do Excel:', jsonData);

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

        dashboardData = processedData;
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
                    const seconds = totalSeconds % 60;
                    timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    timeStr = String(time).replace(/\./g, ':');
                }
            }
            
            return timeStr ? `${dateStr} ${timeStr}` : dateStr;
        };

        // Mapear colunas baseado na estrutura do arquivo
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
                    let seconds = totalSeconds % 60;
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
                if (typeof val === 'string') {
                    return val.replace(/\./g, ':');
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
                    let seconds = totalSeconds % 60;
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
                if (typeof val === 'string') {
                    return val.replace(/\./g, ':');
                }
                return String(val);
            })()
        };
    });
}

// Atualizar dashboard
function updateDashboard() {
    updateKPIs();
    updateFilters();
    updateTable();
}

// Atualizar KPIs
function updateKPIs() {
    const totalAcionamentos = dashboardData.length;
    const emAndamento = dashboardData.filter(item => {
        const fase = (item.fase || '').toUpperCase();
        return fase.includes('ATUANDO') || fase.includes('GMG MOVEL') || fase.includes('GMG MÓVEL') || fase.includes('GMG MOVE');
    }).length;
    const concluidos = dashboardData.filter(item => 
        item.fase && item.fase.toLowerCase().includes('concluido')
    ).length;
    const criticos = dashboardData.filter(item => {
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

    updateTable(filteredData);
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
        if (item.dataPrevisaoTec && item.horaPrevisaoTec) {
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

        row.innerHTML = `
            <td>${item.ami || '-'}</td>
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
        /(\d{2})\/(\d{2})\/(\d{4})/,
        /(\d{2})-(\d{2})-(\d{4})/
    ];
    
    for (const format of formats) {
        const match = dateTimeStr.match(format);
        if (match) {
            const [, day, month, year, hour = 0, minute = 0, second = 0] = match;
            return new Date(year, month - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
        }
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
}

function hideLoading() {
    document.getElementById('loading').classList.add('d-none');
}

function showDashboard() {
    document.getElementById('dashboard').classList.remove('d-none');
    document.getElementById('emptyState').classList.add('d-none');
}

function showEmptyState() {
    document.getElementById('emptyState').classList.remove('d-none');
    document.getElementById('dashboard').classList.add('d-none');
}

// Função para atualizar tabela
function refreshTable() {
    if (dashboardData.length > 0) {
        updateTable();
    }
}

// Download de relatório TXT
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

    let reportContent = '==========================\n';
    reportContent += 'INFORME OPERACIONAL NOC\n';
    reportContent += 'Relatório de Ocorrências Técnicas\n';
    reportContent += '==========================\n\n';
    reportContent += 'Segue abaixo o resumo das ocorrências registradas no NOC para acompanhamento e providências:\n\n';

    // Dados formatados conforme especificado
    filteredData.forEach(item => {
        reportContent += `AMI: ${item.ami || 'N/A'}\n`;
        reportContent += `ESTAÇÃO: ${item.estacao || 'N/A'}\n`;
        reportContent += `TIPO DE ALARME: ${item.alarmes || 'N/A'}\n`;
        reportContent += `TÉCNICO RESPONSÁVEL: ${item.tecnico || 'N/A'}\n`;
        reportContent += `FASE: ${item.fase || 'N/A'}\n`;
        reportContent += `REGIÃO: ${item.regiao || 'N/A'}\n`;
        reportContent += `DATA E HORA: ${formatDate(item.dataAcion) || 'N/A'}\n\n`;
    });

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
    if (!data && !hora) return 'previsao-neutral';
    // Montar Date a partir de data e hora
    let dataStr = data || '';
    let horaStr = hora || '00:00:00';
    // Tentar montar Date
    let dt = null;
    if (dataStr) {
        // Se data já está no formato DD/MM/YYYY
        const match = dataStr.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
        if (match) {
            const [, day, month, year] = match;
            const [h, m, s] = horaStr.split(':').map(x => parseInt(x) || 0);
            dt = new Date(year, month - 1, day, h, m, s);
        }
    }
    if (!dt || isNaN(dt.getTime())) return 'previsao-neutral';
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
    return 'previsao-neutral';
} 