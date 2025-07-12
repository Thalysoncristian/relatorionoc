# 📊 Sistema de Gráficos - Dashboard STTE

## 📋 Visão Geral

Sistema de gráficos interativos usando ECharts da Apache para visualização de dados dos acionamentos de telecomunicações.

## ✨ Funcionalidades

### 🔄 **Alternância de Modos**
- **Dashboard**: Visualização em tabela (padrão)
- **Gráficos**: Visualização em gráficos interativos
- **Mesma Página**: Alternância sem recarregar
- **Botão Dinâmico**: Muda de "Dashboard" para "Acionamentos"

### 📈 **Tipos de Gráficos**

#### **1. Status dos Acionamentos (Pizza)**
- Em Andamento
- Concluídos
- Críticos
- Outros
- **Cores**: Azul, Verde, Vermelho, Cinza

#### **2. Acionamentos por Região (Barras)**
- Distribuição geográfica
- Barras verticais
- **Cor**: Azul STTE

#### **3. Acionamentos por Tipo de Alarme (Barras Horizontais)**
- Top 10 tipos de alarme
- Barras horizontais
- **Cor**: Laranja

#### **4. SLA Status (Doughnut)**
- Dentro do SLA
- Atenção
- Crítico
- Sem Dados
- **Cores**: Verde, Amarelo, Vermelho, Cinza

#### **5. Evolução Temporal (Linha)**
- Total de acionamentos
- Em andamento
- Concluídos
- **Cores**: Azul, Laranja, Verde

## 🛠️ Como Usar

### **Alternar Modos**
1. **Clique no botão "Dashboard"** → Muda para modo gráficos
2. **Clique no botão "Acionamentos"** → Volta para modo tabela
3. **Mesma página** → Sem recarregamento

### **Interação com Gráficos**
- **Hover**: Mostra detalhes
- **Clique**: Interação específica por gráfico
- **Responsivo**: Adapta a diferentes telas
- **Tooltips**: Informações detalhadas

## 📁 Estrutura de Arquivos

```
relatorionoc/
├── charts.js          # Lógica dos gráficos
├── charts.css         # Estilos dos gráficos
├── script.js          # Script principal (integração)
├── index.html         # HTML (inclui gráficos)
└── CHARTS_README.md   # Esta documentação
```

## 🎨 Design e UX

### **Cards dos Gráficos**
- **Bordas coloridas**: Cada gráfico tem cor específica
- **Hover effects**: Elevação e sombra
- **Animações**: Fade in suave
- **Responsivo**: Adapta a mobile/tablet

### **Cores do Sistema**
- **Status**: Azul (#0073aa)
- **Região**: Verde (#28a745)
- **Alarmes**: Amarelo (#ffc107)
- **SLA**: Vermelho (#dc3545)
- **Timeline**: Roxo (#6f42c1)

## 📱 Responsividade

### **Desktop (>768px)**
- Gráficos: 350px altura
- Timeline: 400px altura
- Layout: 2 colunas

### **Tablet (768px)**
- Gráficos: 300px altura
- Timeline: 350px altura
- Layout: 2 colunas

### **Mobile (<576px)**
- Gráficos: 250px altura
- Timeline: 300px altura
- Layout: 1 coluna

## 🔧 Configuração

### **ECharts**
- **CDN**: Carregado automaticamente
- **Versão**: 5.4.3
- **Tema**: Padrão (customizável)

### **Dados**
- **Fonte**: `window.dashboardData`
- **Atualização**: Evento `dashboardDataUpdated`
- **Cache**: Integrado com sistema de cache

## 📊 Tipos de Dados Processados

### **Status**
```javascript
{
  'Em Andamento': 15,
  'Concluídos': 25,
  'Críticos': 5,
  'Outros': 10
}
```

### **Região**
```javascript
{
  'Norte': 20,
  'Sul': 15,
  'Leste': 10,
  'Oeste': 10
}
```

### **Alarmes**
```javascript
{
  'Energia': 15,
  'Retificador': 10,
  'Alta Temperatura': 8,
  'Disjuntor': 5
}
```

### **SLA**
```javascript
{
  'Dentro do SLA': 30,
  'Atenção': 10,
  'Crítico': 5,
  'Sem Dados': 5
}
```

## 🚀 Performance

### **Otimizações**
- **Lazy Loading**: ECharts carregado sob demanda
- **Eventos**: Atualização apenas quando necessário
- **Cache**: Dados reutilizados
- **Resize**: Gráficos redimensionam automaticamente

### **Monitoramento**
- **Console**: Logs de carregamento
- **Erros**: Tratamento de falhas
- **Loading**: Indicadores visuais

## 🔄 Integração

### **Com Script Principal**
```javascript
// Disparar atualização
window.dispatchEvent(new CustomEvent('dashboardDataUpdated'));

// Alternar modo
toggleDashboardMode();
```

### **Com Sistema de Backup**
- Gráficos incluídos em backups
- Estado preservado
- Restauração automática

## 🎯 Personalização

### **Cores dos Gráficos**
```css
.chart-card[data-chart="status"] {
    border-left-color: #0073aa;
}
```

### **Tamanhos**
```css
.chart-container {
    height: 300px;
}
```

### **Animações**
```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
```

## 🆘 Solução de Problemas

### **Gráficos não carregam**
1. Verificar console (F12)
2. Verificar conexão com internet
3. Recarregar página
4. Verificar dados carregados

### **Gráficos não atualizam**
1. Verificar se há dados
2. Disparar evento manual: `window.dispatchEvent(new CustomEvent('dashboardDataUpdated'))`
3. Alternar modo: `toggleDashboardMode()`

### **Problemas de responsividade**
1. Verificar CSS carregado
2. Redimensionar janela
3. Verificar breakpoints

## 📈 Futuras Melhorias

- **Filtros**: Filtros específicos para gráficos
- **Exportação**: Exportar gráficos como imagem
- **Temas**: Múltiplos temas visuais
- **Interatividade**: Drill-down nos dados
- **Animações**: Mais animações personalizadas

---

**Sistema de Gráficos v1.0.0** - Dashboard de Acionamentos STTE 