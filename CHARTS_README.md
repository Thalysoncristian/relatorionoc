# 📊 Sistema de Gráficos - Dashboard STTE

## Visão Geral

O sistema de gráficos do Dashboard STTE oferece visualizações interativas e dinâmicas dos dados de acionamento, permitindo análise rápida e eficiente das operações de NOC.

## 🎯 Gráficos Disponíveis

### 1. **Sites que Mais Tiveram Falha** 📍
- **Tipo**: Line Chart (Gráfico de Linha)
- **Dados**: Top 10 sites com mais acionamentos
- **Cor**: Vermelho (#ff6b6b)
- **Análise**: Identifica sites problemáticos que precisam de atenção especial

### 2. **Técnicos que Mais Tiveram Acionamento** 👨‍🔧
- **Tipo**: Bar Chart (Gráfico de Barras)
- **Dados**: Top 10 técnicos com mais acionamentos
- **Cor**: Azul (#0073aa)
- **Análise**: Mostra carga de trabalho dos técnicos e distribuição de tarefas

### 3. **Tipos de Falha Mais Comuns** ⚡
- **Tipo**: Doughnut Chart (Gráfico de Rosca)
- **Dados**: Top 8 tipos de falha/alarme
- **Cores**: Paleta colorida variada
- **Análise**: Identifica padrões de falhas para melhorar manutenção preventiva

### 4. **Acionamentos por Região** 🗺️
- **Tipo**: Polar Area Chart (Gráfico de Área Polar)
- **Dados**: Distribuição por região (AM, PA, MA, etc.)
- **Cores**: Tons de azul e verde
- **Análise**: Mostra concentração geográfica dos problemas

### 5. **Distribuição por Criticidade** ⚠️
- **Tipo**: Pie Chart (Gráfico de Pizza)
- **Dados**: Baixa, Média, Alta criticidade
- **Cores**: Verde (Baixa), Amarelo (Média), Vermelho (Alta)
- **Análise**: Priorização de atendimento baseada na criticidade

### 6. **Acionamentos por Concessionária** 🏢
- **Tipo**: Horizontal Bar Chart (Gráfico de Barras Horizontal)
- **Dados**: Top 10 concessionárias
- **Cor**: Roxo (#6f42c1)
- **Análise**: Relacionamento com concessionárias de energia

### 7. **SLAs Perdidas vs Cumpridas** ⏰
- **Tipo**: Grouped Bar Chart (Gráfico de Barras Agrupadas)
- **Dados**: SLAs cumpridas vs perdidas por estado
- **Cores**: Verde (Cumpridas), Vermelho (Perdidas)
- **Análise**: Performance de atendimento e qualidade do serviço

### 8. **Evolução Temporal dos Acionamentos** 📈
- **Tipo**: Line Chart (Gráfico de Linha)
- **Dados**: Acionamentos por dia ao longo do tempo
- **Cor**: Azul claro (#17a2b8)
- **Análise**: Tendências temporais e sazonalidade

## 🔧 Funcionalidades

### Interatividade
- **Tooltips**: Informações detalhadas ao passar o mouse
- **Animações**: Transições suaves entre dados
- **Responsividade**: Adaptação automática a diferentes telas

### Filtros Dinâmicos
- Os gráficos se atualizam automaticamente quando filtros são aplicados
- KPIs refletem os dados filtrados
- Análise contextual baseada na seleção atual

### Performance
- Carregamento assíncrono via CDN
- Otimização para grandes volumes de dados
- Cache inteligente de configurações

## 📱 Responsividade

### Desktop (>768px)
- Altura dos gráficos: 220px
- Gráfico temporal: 250px
- Layout em grid 2x2

### Tablet (576px - 768px)
- Altura dos gráficos: 150px
- Gráfico temporal: 175px
- Layout adaptativo

### Mobile (<576px)
- Altura dos gráficos: 125px
- Gráfico temporal: 150px
- Layout em coluna única

## 🎨 Personalização

### Cores dos Gráficos
```css
/* Sites */
#sitesChart { border-color: #ff6b6b; }

/* Técnicos */
#tecnicosChart { background-color: #0073aa; }

/* Tipos de Falha */
#tiposFalhaChart { /* Paleta colorida */ }

/* Regiões */
#regioesChart { /* Tons azuis/verdes */ }

/* Criticidade */
#criticidadeChart { /* Verde/Amarelo/Vermelho */ }

/* Concessionárias */
#concessionariasChart { background-color: #6f42c1; }

/* SLAs */
#slaChart { /* Verde/Vermelho */ }

/* Evolução Temporal */
#evolucaoTemporalChart { border-color: #17a2b8; }
```

### Animações
- **Duração**: 2 segundos
- **Easing**: easeInOutQuart
- **Delay**: Progressivo por elemento

## 📊 Dados Analisados

### Campos Utilizados
- `estacao`: Nome do site/estação
- `tecnico`: Nome do técnico responsável
- `alarmes`: Tipo de alarme/falha
- `regiao`: Região geográfica
- `criticidade`: Nível de criticidade
- `concessionaria`: Concessionária de energia
- `dataAcion`: Data de acionamento
- `dataCadast`: Data de cadastro
- `sla`: Status do SLA

### Cálculos Automáticos
- **Contagem**: Frequência de ocorrências
- **Percentuais**: Distribuição relativa
- **SLAs**: Análise de cumprimento
- **Tendências**: Evolução temporal

## 🚀 Como Usar

### Alternar Modo
```javascript
// Via função global
toggleDashboardMode();

// Via instância
dashboardCharts.toggleMode();
```

### Atualizar Dados
```javascript
// Atualização automática
window.dispatchEvent(new Event('dashboardDataUpdated'));

// Atualização manual
dashboardCharts.updateCharts();
```

### Acessar Instância
```javascript
// Instância global
window.dashboardCharts

// Ou diretamente
dashboardCharts
```

## 🔍 Casos de Uso

### 1. **Análise de Performance**
- Gráfico de SLAs para avaliar qualidade do atendimento
- Evolução temporal para identificar tendências

### 2. **Gestão de Recursos**
- Gráfico de técnicos para distribuição de carga
- Sites problemáticos para manutenção preventiva

### 3. **Análise de Falhas**
- Tipos de falha para identificar padrões
- Criticidade para priorização

### 4. **Relacionamento com Concessionárias**
- Gráfico de concessionárias para análise de parcerias
- Regiões para planejamento geográfico

## 🛠️ Manutenção

### Logs
- Console logs detalhados para debugging
- Identificação de erros de carregamento
- Monitoramento de performance

### Fallbacks
- Gráficos vazios quando não há dados
- Recarregamento automático em caso de erro
- Compatibilidade com diferentes navegadores

### Atualizações
- Sistema modular para fácil expansão
- Configurações centralizadas
- Documentação atualizada

---

**Versão**: 3.0.0  
**Última Atualização**: Julho 2025  
**Tecnologia**: Chart.js 4.4.0 