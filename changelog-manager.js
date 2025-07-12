/**
 * Changelog Manager - Sistema de Gerenciamento de Versões
 * Este script automatiza o processo de atualização do changelog
 */

class ChangelogManager {
    constructor() {
        this.changelogFile = 'changelog.html';
        this.versionHistory = [];
        this.currentVersion = '1.3.0';
    }

    /**
     * Adiciona uma nova entrada ao changelog
     * @param {string} type - Tipo da mudança (feature, bugfix, improvement)
     * @param {string} title - Título da mudança
     * @param {string} description - Descrição detalhada
     * @param {string} version - Versão (opcional, usa a atual se não informada)
     */
    addEntry(type, title, description, version = null) {
        const entry = {
            type: type,
            title: title,
            description: description,
            version: version || this.currentVersion,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.versionHistory.push(entry);
        this.saveToLocalStorage();
        this.updateChangelogFile();
        
        console.log(`✅ Entrada adicionada ao changelog: ${title}`);
        return entry;
    }

    /**
     * Cria uma nova versão
     * @param {string} version - Número da versão
     * @param {string} description - Descrição da versão
     */
    createVersion(version, description = '') {
        this.currentVersion = version;
        const versionEntry = {
            type: 'version',
            title: `Versão ${version}`,
            description: description,
            version: version,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.versionHistory.push(versionEntry);
        this.saveToLocalStorage();
        this.updateChangelogFile();
        
        console.log(`🚀 Nova versão criada: ${version}`);
        return versionEntry;
    }

    /**
     * Salva o histórico no localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('changelogHistory', JSON.stringify(this.versionHistory));
            localStorage.setItem('currentVersion', this.currentVersion);
        } catch (error) {
            console.error('Erro ao salvar changelog no localStorage:', error);
        }
    }

    /**
     * Carrega o histórico do localStorage
     */
    loadFromLocalStorage() {
        try {
            const history = localStorage.getItem('changelogHistory');
            const version = localStorage.getItem('currentVersion');
            
            if (history) {
                this.versionHistory = JSON.parse(history);
            }
            if (version) {
                this.currentVersion = version;
            }
        } catch (error) {
            console.error('Erro ao carregar changelog do localStorage:', error);
        }
    }

    /**
     * Atualiza o arquivo HTML do changelog
     */
    updateChangelogFile() {
        // Esta função seria chamada para atualizar o arquivo HTML
        // Em um ambiente real, isso seria feito via API ou build process
        console.log('📝 Changelog atualizado. Execute manualmente para aplicar as mudanças.');
    }

    /**
     * Gera o HTML do changelog
     */
    generateHTML() {
        const versions = this.groupByVersion();
        let html = '';

        for (const [version, entries] of Object.entries(versions)) {
            const versionEntry = entries.find(entry => entry.type === 'version');
            const changes = entries.filter(entry => entry.type !== 'version');
            
            html += this.generateVersionHTML(version, versionEntry, changes);
        }

        return html;
    }

    /**
     * Agrupa entradas por versão
     */
    groupByVersion() {
        const groups = {};
        
        this.versionHistory.forEach(entry => {
            if (!groups[entry.version]) {
                groups[entry.version] = [];
            }
            groups[entry.version].push(entry);
        });

        return groups;
    }

    /**
     * Gera HTML para uma versão específica
     */
    generateVersionHTML(version, versionEntry, changes) {
        const isCurrent = version === this.currentVersion;
        const date = versionEntry ? new Date(versionEntry.date).toLocaleDateString('pt-BR') : 'Data não informada';
        
        let html = `
            <div class="version-item">
                <div class="version-number">
                    Versão ${version} ${isCurrent ? '<span class="version-tag">Atual</span>' : ''}
                </div>
                <div class="version-date">${date}</div>
        `;

        changes.forEach(change => {
            html += `
                <div class="change-item ${change.type}">
                    <span class="change-type">${this.getTypeLabel(change.type)}</span>
                    <strong>${change.title}:</strong> ${change.description}
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * Retorna o label do tipo de mudança
     */
    getTypeLabel(type) {
        const labels = {
            'feature': 'Nova Funcionalidade',
            'bugfix': 'Correção',
            'improvement': 'Melhoria',
            'version': 'Versão'
        };
        return labels[type] || type;
    }

    /**
     * Exporta o changelog como JSON
     */
    exportJSON() {
        return JSON.stringify(this.versionHistory, null, 2);
    }

    /**
     * Importa changelog de JSON
     */
    importJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.versionHistory = data;
            this.saveToLocalStorage();
            console.log('✅ Changelog importado com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao importar changelog:', error);
            return false;
        }
    }

    /**
     * Limpa todo o histórico
     */
    clear() {
        this.versionHistory = [];
        this.saveToLocalStorage();
        console.log('🗑️ Changelog limpo');
    }
}

// Instância global do ChangelogManager
window.changelogManager = new ChangelogManager();

// Carregar dados salvos ao inicializar
document.addEventListener('DOMContentLoaded', function() {
    window.changelogManager.loadFromLocalStorage();
});

// Funções de conveniência para uso rápido
window.addChangelogEntry = function(type, title, description, version) {
    return window.changelogManager.addEntry(type, title, description, version);
};

window.createChangelogVersion = function(version, description) {
    return window.changelogManager.createVersion(version, description);
};

// Exemplo de uso:
/*
// Adicionar uma nova funcionalidade
addChangelogEntry('feature', 'Sistema de Backup', 'Implementado sistema automático de backup dos dados');

// Adicionar uma correção
addChangelogEntry('bugfix', 'Relatório TXT', 'Corrigido problema de duplicidade de hora no campo "DATA E HORA"');

// Criar uma nova versão
createChangelogVersion('1.4.0', 'Versão com melhorias de performance');
*/ 