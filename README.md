# 🚦 Dashboard de Acionamentos - STTE

Dashboard moderno estilo WordPress para análise de acionamentos de telecomunicações, desenvolvido para o NOC da STTE.

---

## ✨ Principais Funcionalidades

- 🎨 **Interface WordPress-like**: Design moderno e responsivo
- 📤 **Upload Manual de Arquivos**: Relatórios Excel via web
- 🧮 **KPIs em Tempo Real**: Total, Em Andamento, Concluídos, Críticos
- 🗂️ **Filtros Horizontais**: Região, Fase, Tipo AMI, Tipo Site, Alarmes
- 📊 **Tabela Interativa**: Dados detalhados, badges coloridas, exportação
- 📁 **Exportação**: Relatórios TXT (Informe Operacional NOC) e Excel
- 📱 **Design Responsivo**: Desktop, tablet e mobile

---

## 📁 Estrutura do Projeto

```
Thalyson/
├── index.html        # Página principal
├── styles.css        # Estilos CSS
├── script.js         # Funcionalidades JS
├── netlify.toml      # Deploy Netlify
└── README.md         # Este arquivo
```

---

## 🚀 Como Usar

1. **Abra o `index.html`** no navegador
2. Clique em **"Carregar Relatório"** e selecione um arquivo Excel (.xls/.xlsx)
3. Use os **filtros horizontais** para refinar os dados
4. Veja os **KPIs** e a tabela detalhada
5. Exporte relatórios em TXT ou Excel

---

## 🗃️ Formato Esperado do Excel

| Ordem | Coluna             | Ordem | Coluna             |
|-------|--------------------|-------|--------------------|
| 1     | ID                 | 20    | Solicitante        |
| 2     | AMI                | 21    | Data Cadast        |
| 3     | Tipo AMI           | 22    | Hora Cadast        |
| 4     | Estação            | 23    | Data Acion         |
| 5     | Tipo Site          | 24    | Hora Acion         |
| 6     | Produto            | 25    | Empreiteira        |
| 7     | Classificação      | 26    | NOC                |
| 8     | Fase               | 27    | Técnico            |
| 9     | Atuação GMG        | 28    | Tecnologia         |
| 10    | Data GMG Início    | 29    | Criticidade        |
| 11    | Hora GMG Início    | 30    | Prejuízo           |
| 12    | Data GMG Fim       | 31    | Escopo             |
| 13    | Hora GMG Fim       | 32    | Incidente RAL      |
| 14    | Localidade         | 33    | Alarmes            |
| 15    | CM                 | 34    | Alarmes Descritivo |
| 16    | Região             | 35    | Data Alarmes       |
| 17    | Concessionária     | 36    | Hora Alarmes       |
| 18    | Identificador      | 37    | Origem Alarme      |
| 19    | Obs Energia        |       |                    |

---

## 📊 KPIs e Status

- **Total de Acionamentos**: Todos os registros carregados
- **Em Andamento**: Status "ATUANDO" ou "GMG MÓVEL/MOVEL/MOVE"
- **Concluídos**: Acionamentos finalizados
- **Críticos**: SLA vencido

### Badges de Status

- <span style="background:#e3f2fd;color:#1976d2;padding:2px 6px;border-radius:4px;">Assumido</span>
- <span style="background:#fff3e0;color:#f57c00;padding:2px 6px;border-radius:4px;">Previsão</span>
- <span style="background:#e8f5e8;color:#388e3c;padding:2px 6px;border-radius:4px;">Atuando</span>
- <span style="background:#e8f5e8;color:#388e3c;padding:2px 6px;border-radius:4px;">Concluído</span>

### SLA

- **Good** (Verde): Dentro do SLA
- **Caution** (Laranja): Aproximando do limite
- **Warning** (Amarelo): Próximo do limite
- **Critical** (Vermelho): Fora do SLA
- **Neutral** (Cinza): Sem dados suficientes

---

## 🛠️ Tecnologias

- HTML5, CSS3, JavaScript
- Bootstrap 5, Font Awesome
- SheetJS (Excel), Chart.js (futuro)

---

## 🌐 Deploy

- Deploy automático via Netlify
- Arquivo `netlify.toml` já configurado
- [Acesse o projeto no GitHub](https://github.com/Thalysoncristian/relatorionoc)

---

## 👨‍💻 Autor

**Thalyson Silva**  
NOC - STTE  
📧 thalyson.silva.pa@stte.com.br

---

## 📝 Changelog

### v2.0.0 - Interface WordPress
- Redesign completo
- Removido Python/automação
- Layout responsivo e moderno
- Novo sistema de cores e KPIs

### v1.0.0 - Versão Original
- Dashboard básico
- Carregamento automático via Python
- Gráficos e métricas

---

## 📄 Licença

Projeto interno da STTE - Todos os direitos reservados.

---

Desenvolvido com ❤️ para o NOC da STTE