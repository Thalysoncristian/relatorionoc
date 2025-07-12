# Sistema de Changelog - Documentação

## Visão Geral

O sistema de changelog foi implementado para rastrear automaticamente as mudanças e atualizações do projeto. Ele inclui:

- **Página de Changelog**: Interface visual para visualizar o histórico de versões
- **Changelog Manager**: Script JavaScript para gerenciar entradas automaticamente
- **Integração**: Link na navegação principal para acessar o changelog

## Como Usar

### 1. Visualizar o Changelog

Acesse a página de changelog através do link "Changelog" na navegação principal, ou acesse diretamente:
```
http://seu-dominio/changelog.html
```

### 2. Adicionar Entradas via Console

Abra o console do navegador (F12) e use os comandos:

```javascript
// Adicionar uma nova funcionalidade
addChangelogEntry('feature', 'Título da Funcionalidade', 'Descrição detalhada');

// Adicionar uma correção
addChangelogEntry('bugfix', 'Título da Correção', 'Descrição do problema corrigido');

// Adicionar uma melhoria
addChangelogEntry('improvement', 'Título da Melhoria', 'Descrição da melhoria implementada');

// Criar uma nova versão
createChangelogVersion('1.4.0', 'Descrição da nova versão');
```

### 3. Tipos de Entrada

- **feature**: Nova funcionalidade (azul)
- **bugfix**: Correção de bug (vermelho)
- **improvement**: Melhoria (amarelo)
- **version**: Nova versão (especial)

### 4. Gerenciamento Avançado

```javascript
// Acessar o manager diretamente
const manager = window.changelogManager;

// Exportar changelog como JSON
const json = manager.exportJSON();
console.log(json);

// Importar changelog de JSON
manager.importJSON(jsonString);

// Limpar todo o histórico
manager.clear();

// Ver histórico atual
console.log(manager.versionHistory);
```

## Estrutura dos Dados

Cada entrada do changelog contém:

```javascript
{
    type: 'feature|bugfix|improvement|version',
    title: 'Título da mudança',
    description: 'Descrição detalhada',
    version: '1.3.0',
    date: '2025-01-XXTXX:XX:XX.XXXZ',
    timestamp: 1234567890123
}
```

## Personalização

### Modificar Estilos

Os estilos estão definidos no arquivo `changelog.html`. Você pode personalizar:

- Cores dos tipos de entrada
- Layout e espaçamentos
- Animações e transições
- Responsividade

### Adicionar Novos Tipos

Para adicionar novos tipos de entrada, modifique:

1. **changelog-manager.js**: Adicione o novo tipo no método `getTypeLabel()`
2. **changelog.html**: Adicione o CSS correspondente

## Integração com Git

Para integrar com o controle de versão:

1. **Commit automático**: Configure hooks do Git para executar comandos do changelog
2. **Tags de versão**: Use tags do Git para marcar versões
3. **CI/CD**: Integre com pipelines de deploy

### Exemplo de Hook

```bash
#!/bin/bash
# .git/hooks/post-commit

# Adicionar entrada ao changelog baseada na mensagem do commit
COMMIT_MSG=$(git log -1 --pretty=%B)
if [[ $COMMIT_MSG == *"[FEATURE]"* ]]; then
    echo "addChangelogEntry('feature', 'Nova funcionalidade', 'Adicionada via commit');" | node
fi
```

## Backup e Restauração

O changelog é salvo automaticamente no localStorage do navegador. Para backup:

```javascript
// Fazer backup
const backup = localStorage.getItem('changelogHistory');

// Restaurar backup
localStorage.setItem('changelogHistory', backup);
```

## Troubleshooting

### Problemas Comuns

1. **Changelog não aparece**: Verifique se o arquivo `changelog-manager.js` está sendo carregado
2. **Entradas não salvam**: Verifique o console para erros de localStorage
3. **Estilos não aplicam**: Verifique se o CSS está sendo carregado corretamente

### Logs de Debug

```javascript
// Ativar logs detalhados
localStorage.setItem('changelogDebug', 'true');

// Verificar status
console.log('Changelog Manager Status:', {
    version: window.changelogManager.currentVersion,
    entries: window.changelogManager.versionHistory.length,
    storage: !!localStorage.getItem('changelogHistory')
});
```

## Contribuição

Para contribuir com melhorias no sistema de changelog:

1. Faça suas alterações
2. Teste localmente
3. Adicione entrada no changelog sobre suas mudanças
4. Faça commit e push

## Versões

- **1.3.0**: Sistema de changelog implementado
- **1.2.0**: Sistema de backup e gráficos
- **1.1.0**: Filtros avançados
- **1.0.0**: Versão inicial 