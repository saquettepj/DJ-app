# Sistema de Sessão - DJ App

## Visão Geral

O sistema de sessão foi implementado para gerenciar múltiplas sessões de usuário, preservando a chave da API e os favoritos salvos entre sessões. Quando um usuário insere uma nova chave da API, o sistema automaticamente:

1. **Remove a sessão anterior** (se existir)
2. **Preserva a chave da API** e os favoritos salvos
3. **Cria uma nova sessão** com a nova chave da API
4. **Restaura os favoritos** da sessão anterior (se existir)

## Como Funciona

### 1. Gerenciamento de Sessões

- **SessionManager**: Classe principal que gerencia todas as sessões
- **Persistência**: As sessões são salvas no localStorage do navegador
- **Identificação**: Cada sessão tem um ID único e é associada a uma chave da API

### 2. Fluxo de Troca de Sessão

```
Usuário insere nova API Key
         ↓
   Validação da API Key
         ↓
   Verificação de sessão existente
         ↓
   Se existe sessão com mesma API Key:
   - Reutiliza a sessão existente
   - Restaura favoritos automaticamente
         ↓
   Se é uma nova API Key:
   - Remove sessão anterior
   - Preserva favoritos da sessão anterior
   - Cria nova sessão
   - Restaura favoritos na nova sessão
```

### 3. Estrutura de Dados

```typescript
interface Session {
  id: string;                    // ID único da sessão
  apiKey: string;               // Chave da API do usuário
  favorites: Favorite[];        // Lista de favoritos salvos
  createdAt: number;            // Timestamp de criação
  lastActive: number;           // Última atividade
  theme: 'basic' | 'rpg';      // Tema atual da interface
}
```

### 4. Integração com Componentes

- **ApiKeyInput**: Verifica sessões existentes ao carregar
- **FavoritesManager**: Sincroniza favoritos com o SessionManager
- **Main App**: Gerencia troca de sessões e restauração de estado

## Funcionalidades

### ✅ Implementadas

- [x] Criação automática de sessões
- [x] Preservação de favoritos entre sessões
- [x] Reutilização de sessões existentes
- [x] Sincronização automática de favoritos
- [x] Persistência no localStorage
- [x] Gerenciamento de temas por sessão
- [x] Limpeza automática de sessões antigas

### 🔄 Fluxo de Trabalho

1. **Primeira execução**: Cria nova sessão com tema 'basic'
2. **Troca de API Key**: 
   - Se a API Key já existe em uma sessão, reutiliza
   - Se é nova, cria nova sessão preservando favoritos
3. **Mudança de tema**: Atualiza o tema na sessão atual
4. **Persistência**: Salva automaticamente todas as mudanças

## Arquivos Modificados

### Novos Arquivos
- `utils/SessionManager.ts` - Gerenciador principal de sessões

### Arquivos Modificados
- `index.tsx` - Integração com o sistema de sessão
- `utils/FavoritesManager.ts` - Sincronização com sessões
- `components/ApiKeyInput.ts` - Verificação de sessões existentes

## Uso

O sistema funciona automaticamente. O usuário não precisa fazer nada especial:

1. **Insere a chave da API** no campo de input
2. **Sistema valida** a chave automaticamente
3. **Sessão é criada/atualizada** automaticamente
4. **Favoritos são preservados** entre sessões
5. **Tema é mantido** por sessão

## Benefícios

- **Persistência**: Favoritos não são perdidos ao trocar de API Key
- **Reutilização**: Sessões existentes são reutilizadas automaticamente
- **Isolamento**: Cada API Key tem sua própria sessão independente
- **Transparência**: Usuário não precisa gerenciar sessões manualmente
- **Performance**: Carregamento rápido de sessões existentes

## Considerações Técnicas

- **Storage**: Utiliza localStorage para persistência
- **Sincronização**: Eventos customizados para comunicação entre componentes
- **Error Handling**: Tratamento robusto de erros de localStorage
- **Backward Compatibility**: Mantém compatibilidade com versões anteriores
- **Memory Management**: Limpeza automática de dados obsoletos
