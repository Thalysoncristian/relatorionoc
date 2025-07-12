// Sistema de Backup - Dashboard de Acionamentos STTE
// Versão: 1.0.0

class BackupSystem {
    constructor() {
        this.backupKey = 'dashboard_backup_';
        this.maxBackups = 10; // Máximo de 10 backups salvos
        this.currentVersion = '2.1.0';
    }

    // Criar backup automático
    createBackup(description = 'Backup automático') {
        try {
            const backup = {
                timestamp: new Date().toISOString(),
                version: this.currentVersion,
                description: description,
                files: {
                    'script.js': this.getFileContent('script.js'),
                    'styles.css': this.getFileContent('styles.css'),
                    'index.html': this.getFileContent('index.html')
                },
                metadata: {
                    dashboardData: localStorage.getItem('gmsCache'),
                    userAgent: navigator.userAgent,
                    screenResolution: `${screen.width}x${screen.height}`,
                    timestamp: Date.now()
                }
            };

            // Salvar backup no localStorage
            const backupId = `backup_${Date.now()}`;
            localStorage.setItem(this.backupKey + backupId, JSON.stringify(backup));

            // Limpar backups antigos
            this.cleanOldBackups();

            return backupId;

        } catch (error) {
            console.error('❌ Erro ao criar backup:', error);
            return null;
        }
    }

    // Obter conteúdo do arquivo (simulado - em produção seria via fetch)
    getFileContent(filename) {
        // Em um ambiente real, isso seria feito via fetch
        // Por enquanto, retornamos uma referência
        return `Referência para ${filename} - ${new Date().toISOString()}`;
    }

    // Listar todos os backups
    listBackups() {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.backupKey)) {
                try {
                    const backup = JSON.parse(localStorage.getItem(key));
                    backups.push({
                        id: key.replace(this.backupKey, ''),
                        ...backup
                    });
                } catch (error) {
                    console.error('Erro ao ler backup:', key, error);
                }
            }
        }
        return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Restaurar backup
    restoreBackup(backupId) {
        try {
            const backupData = localStorage.getItem(this.backupKey + backupId);
            if (!backupData) {
                throw new Error('Backup não encontrado');
            }

            const backup = JSON.parse(backupData);
            
            // Restaurar dados do dashboard se existirem
            if (backup.metadata && backup.metadata.dashboardData) {
                localStorage.setItem('gmsCache', backup.metadata.dashboardData);
            }

            return backup;

        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            return null;
        }
    }

    // Limpar backups antigos
    cleanOldBackups() {
        const backups = this.listBackups();
        if (backups.length > this.maxBackups) {
            const backupsToRemove = backups.slice(this.maxBackups);
            backupsToRemove.forEach(backup => {
                localStorage.removeItem(this.backupKey + backup.id);
            });
        }
    }

    // Exportar backup para arquivo
    exportBackup(backupId) {
        try {
            const backupData = localStorage.getItem(this.backupKey + backupId);
            if (!backupData) {
                throw new Error('Backup não encontrado');
            }

            const backup = JSON.parse(backupData);
            const blob = new Blob([JSON.stringify(backup, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard_backup_${backupId}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;

        } catch (error) {
            console.error('❌ Erro ao exportar backup:', error);
            return false;
        }
    }

    // Importar backup de arquivo
    importBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    // Validar estrutura do backup
                    if (!backup.timestamp || !backup.version || !backup.files) {
                        throw new Error('Arquivo de backup inválido');
                    }

                    // Salvar backup importado
                    const backupId = `imported_${Date.now()}`;
                    localStorage.setItem(this.backupKey + backupId, JSON.stringify(backup));

                    resolve(backupId);

                } catch (error) {
                    console.error('❌ Erro ao importar backup:', error);
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    // Criar backup antes de mudanças importantes
    createPreChangeBackup(changeDescription) {
        return this.createBackup(`Antes de: ${changeDescription}`);
    }

    // Verificar integridade dos backups
    checkBackupIntegrity() {
        const backups = this.listBackups();
        const issues = [];

        backups.forEach(backup => {
            if (!backup.timestamp) issues.push(`Backup ${backup.id}: Sem timestamp`);
            if (!backup.version) issues.push(`Backup ${backup.id}: Sem versão`);
            if (!backup.files) issues.push(`Backup ${backup.id}: Sem arquivos`);
        });

        return {
            total: backups.length,
            issues: issues,
            healthy: issues.length === 0
        };
    }

    // Mostrar informações do sistema de backup
    getSystemInfo() {
        const backups = this.listBackups();
        const integrity = this.checkBackupIntegrity();
        
        return {
            version: this.currentVersion,
            totalBackups: backups.length,
            maxBackups: this.maxBackups,
            lastBackup: backups.length > 0 ? backups[0].timestamp : null,
            integrity: integrity,
            storageUsed: this.getStorageUsage()
        };
    }

    // Calcular uso de storage
    getStorageUsage() {
        let totalSize = 0;
        const backups = this.listBackups();
        
        backups.forEach(backup => {
            totalSize += JSON.stringify(backup).length;
        });

        return {
            bytes: totalSize,
            kilobytes: (totalSize / 1024).toFixed(2),
            megabytes: (totalSize / (1024 * 1024)).toFixed(2)
        };
    }
}

// Instância global do sistema de backup
const backupSystem = new BackupSystem();

// Funções de conveniência para uso no dashboard
function createBackup(description) {
    return backupSystem.createBackup(description);
}

function restoreBackup(backupId) {
    return backupSystem.restoreBackup(backupId);
}

function listBackups() {
    return backupSystem.listBackups();
}

function exportBackup(backupId) {
    return backupSystem.exportBackup(backupId);
}

// Criar backup automático a cada 30 minutos
setInterval(() => {
    createBackup('Backup automático - 30min');
}, 30 * 60 * 1000);

// Criar backup na inicialização
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        createBackup('Backup inicial - Carregamento da página');
    }, 5000);
}); 