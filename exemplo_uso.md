# Como Usar o Dashboard de Acionamentos

## 🚀 Início Rápido

### 1. Acessar o Dashboard
- Abra o arquivo `index.html` no seu navegador
- Ou acesse a URL do deploy no Netlify

### 2. Carregar um Relatório
1. Clique no botão **"Carregar Relatório"** no header
2. Selecione um arquivo Excel (.xls ou .xlsx)
3. Aguarde o processamento dos dados
4. O dashboard será automaticamente atualizado

### 3. Usar os Filtros e Exportar
Na seção horizontal, você encontrará:

#### Filtros Disponíveis
- **Região**: Selecione uma região específica
- **Fase**: Filtre por status (Assumido, Em Andamento, Concluído, etc.)
- **Tipo AMI**: Filtre por tipo de AMI
- **Tipo Site**: Filtre por tipo de site (Rádio, Fibra, etc.)
- **Tipo do Alarme**: Filtre por tipo de alarme
- Clique em **"Aplicar"** para atualizar a tabela

#### Exportar
- **Relatório TXT**: Baixa um arquivo de texto no formato "Informe Operacional NOC"
- **Relatório Excel**: Baixa um arquivo Excel com os dados filtrados

## 📊 Entendendo os KPIs

### Cards Principais
- **Total de Acionamentos**: Número total de registros carregados
- **Em Andamento**: Acionamentos com status "em andamento"
- **Concluídos**: Acionamentos finalizados
- **Críticos**: Acionamentos com criticidade alta

### Tabela de Dados
A tabela mostra:
- **AMI**: Identificador do AMI
- **Estação**: Nome da estação
- **Localidade**: Localização
- **Região**: Região geográfica
- **Fase**: Status atual (com badge colorido)
- **Tipo Site**: Tipo de site
- **Tipo do Alarme**: Tipo de alarme
- **Data Acion.**: Data e hora do acionamento
- **Técnico**: Técnico responsável
- **SLA**: Tempo limite (com badge colorido)
- **Tempo**: Tempo decorrido desde o acionamento

## 🎨 Cores e Status

### Status Badges
- **Assumido**: Azul
- **Previsão**: Laranja
- **Atuando**: Verde
- **Concluído**: Verde

### SLA Badges
- **Good** (Verde): Dentro do SLA
- **Caution** (Laranja): Aproximando do limite
- **Warning** (Amarelo): Próximo do limite
- **Critical** (Vermelho): Fora do SLA
- **Neutral** (Cinza): Sem dados suficientes

## 📱 Navegação

### Menu Principal
- **Dashboard**: Visualização principal (padrão)
- **Relatórios**: Seção para relatórios (futuro)
- **Configurações**: Configurações do sistema (futuro)

### Layout Principal
- **Filtros e Exportação**: Localizados horizontalmente acima da tabela principal
- **Layout responsivo**: Se adapta a diferentes tamanhos de tela
- **Informações**: Dados do desenvolvedor no rodapé

## 🔧 Funcionalidades Avançadas

### Atualizar Tabela
- Clique no botão **"Atualizar"** na tabela para recarregar os dados



### Exportação Inteligente
- Os relatórios exportados mantêm os filtros aplicados
- **Formato TXT**: Relatório no formato "Informe Operacional NOC" com layout profissional
- **Formato Excel**: Ideal para processamento posterior e análises detalhadas

### Responsividade
- **Desktop**: Layout completo com sidebar
- **Tablet**: Sidebar colapsa automaticamente
- **Mobile**: Layout otimizado para telas pequenas

## ⚠️ Dicas Importantes

1. **Formato do Arquivo**: Certifique-se de que o Excel tem as colunas corretas
2. **Tamanho do Arquivo**: Arquivos muito grandes podem demorar para processar
3. **Navegador**: Use navegadores modernos (Chrome, Firefox, Safari, Edge)
4. **Filtros**: Use os filtros para encontrar dados específicos rapidamente
5. **Exportação**: Sempre verifique os filtros antes de exportar

## 🆘 Solução de Problemas

### Arquivo não carrega
- Verifique se é um arquivo Excel válido (.xls ou .xlsx)
- Certifique-se de que o arquivo não está corrompido
- Tente com um arquivo menor

### Filtros não funcionam
- Verifique se há dados carregados
- Certifique-se de que os valores dos filtros existem nos dados
- Tente recarregar a página

### Exportação não funciona
- Verifique se há dados filtrados
- Certifique-se de que o navegador permite downloads
- Tente usar outro navegador

## 📞 Suporte

Para dúvidas ou problemas:
- **Email**: thalyson.silva.pa@stte.com.br
- **Departamento**: NOC - STTE
- **Desenvolvedor**: Thalyson Silva

---

**Dashboard de Acionamentos - STTE**  
*Versão 2.0 - Interface WordPress* 