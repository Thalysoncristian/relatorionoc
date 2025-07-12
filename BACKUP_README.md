# 🔄 Sistema de Backup - Dashboard STTE

## 📋 Visão Geral

O sistema de backup automático protege o dashboard contra perda de dados e permite restaurar versões anteriores do sistema.

## ✨ Funcionalidades

### 🔄 **Backup Automático**
- **Inicialização**: Backup criado ao carregar a página
- **Periódico**: Backup a cada 30 minutos
- **Antes de Mudanças**: Backup antes de processar arquivos
- **Limpeza**: Máximo de 10 backups salvos

### 💾 **Armazenamento**
- **localStorage**: Backups salvos no navegador
- **Metadados**: Informações do sistema e dados do dashboard
- **Integridade**: Verificação automática dos backups

### 📁 **Exportação/Importação**
- **Exportar**: Download de backup como arquivo JSON
- **Importar**: Restaurar backup de arquivo
- **Validação**: Verificação de integridade dos arquivos

## 🛠️ Como Usar

### **Backup Automático**
O sistema cria backups automaticamente:
- Ao inicializar o dashboard
- A cada 30 minutos
- Antes de processar arquivos do GMS
- Antes de atualizações importantes

### **Verificar Backups**
```javascript
// Listar todos os backups
const backups = listBackups();
console.log(backups);

// Verificar informações do sistema
const info = backupSystem.getSystemInfo();
console.log(info);
```

### **Criar Backup Manual**
```javascript
// Criar backup com descrição
createBackup('Backup manual - Teste');

// Criar backup antes de mudança
createBackup('Antes de alteração importante');
```

### **Restaurar Backup**
```javascript
// Restaurar backup específico
restoreBackup('backup_1234567890');

// Restaurar dados do cache
const backup = backupSystem.restoreBackup('backup_1234567890');
if (backup && backup.metadata.dashboardData) {
    localStorage.setItem('gmsCache', backup.metadata.dashboardData);
}
```

### **Exportar Backup**
```javascript
// Exportar backup para arquivo
exportBackup('backup_1234567890');
```

### **Importar Backup**
```javascript
// Importar backup de arquivo
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        try {
            const backupId = await backupSystem.importBackup(file);
            console.log('Backup importado:', backupId);
        } catch (error) {
            console.error('Erro ao importar:', error);
        }
    }
});
```

## 📊 Estrutura do Backup

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "2.1.0",
  "description": "Backup automático - 30min",
  "files": {
    "script.js": "Referência para script.js",
    "styles.css": "Referência para styles.css", 
    "index.html": "Referência para index.html"
  },
  "metadata": {
    "dashboardData": "Dados do cache do dashboard",
    "userAgent": "Informações do navegador",
    "screenResolution": "1920x1080",
    "timestamp": 1705312200000
  }
}
```

## 🔧 Configuração

### **Parâmetros do Sistema**
- **maxBackups**: 10 (máximo de backups salvos)
- **backupKey**: 'dashboard_backup_' (prefixo no localStorage)
- **currentVersion**: '2.1.0' (versão atual do sistema)

### **Personalização**
```javascript
// Alterar número máximo de backups
backupSystem.maxBackups = 20;

// Alterar prefixo das chaves
backupSystem.backupKey = 'meu_backup_';
```

## 📈 Monitoramento

### **Verificar Integridade**
```javascript
const integrity = backupSystem.checkBackupIntegrity();
console.log('Backups saudáveis:', integrity.healthy);
console.log('Problemas encontrados:', integrity.issues);
```

### **Uso de Storage**
```javascript
const usage = backupSystem.getStorageUsage();
console.log('Uso atual:', usage.kilobytes, 'KB');
```

## 🚨 Recuperação de Emergência

### **Se o Sistema Falhar**
1. **Verificar Console**: Abrir DevTools e verificar logs
2. **Listar Backups**: `listBackups()` no console
3. **Restaurar Último**: `restoreBackup('backup_mais_recente')`
4. **Recarregar Página**: F5 para aplicar restauração

### **Se localStorage Estiver Corrompido**
1. **Limpar localStorage**: `localStorage.clear()`
2. **Importar Backup**: Usar arquivo JSON exportado
3. **Verificar Integridade**: `checkBackupIntegrity()`

## 📝 Logs do Sistema

O sistema registra todas as operações no console:
- ✅ Backup criado
- 🔄 Backup restaurado  
- 📁 Backup exportado
- 🗑️ Backup removido
- ❌ Erros de backup

## 🔒 Segurança

- **Dados Locais**: Backups ficam apenas no navegador
- **Sem Upload**: Nenhum dado enviado para servidores externos
- **Validação**: Verificação de integridade dos backups
- **Limpeza**: Remoção automática de backups antigos

## 🆘 Suporte

Para problemas com o sistema de backup:
1. Verificar console do navegador
2. Verificar integridade dos backups
3. Exportar backups importantes
4. Limpar localStorage se necessário
5. Recarregar página

---

**Sistema de Backup v1.0.0** - Dashboard de Acionamentos STTE 