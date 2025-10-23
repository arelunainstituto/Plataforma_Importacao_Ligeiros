# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para a Plataforma de Importação de Veículos!

## 📋 Processo de Contribuição

1. **Fork** o repositório
2. **Clone** o seu fork: `git clone <your-fork>`
3. **Crie** um branch: `git checkout -b feature/minha-funcionalidade`
4. **Commit** as alterações: `git commit -m 'feat: adicionar nova funcionalidade'`
5. **Push** para o branch: `git push origin feature/minha-funcionalidade`
6. **Abra** um Pull Request

## 📝 Convenções

### Commits (Conventional Commits)

```
feat: nova funcionalidade
fix: correção de bug
docs: alteração em documentação
style: formatação, ponto e vírgula, etc (sem alteração de código)
refactor: refatoração de código
test: adição de testes
chore: atualização de dependências, configs, etc
```

**Exemplos:**
```bash
git commit -m "feat: adicionar cálculo de IUC"
git commit -m "fix: corrigir validação de NIF"
git commit -m "docs: atualizar README com instruções de deploy"
```

### Branches

- `main` - Produção (sempre estável)
- `develop` - Desenvolvimento (staging)
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `docs/*` - Documentação
- `refactor/*` - Refatorações

### Code Style

Este projeto usa:
- **Prettier** para formatação automática
- **ESLint** para linting

```bash
# Formatar código
pnpm format

# Lint
pnpm lint

# Type-check
pnpm type-check
```

## 🏗️ Estrutura de Código

### Adicionar Nova Entidade

1. **Schema Zod** em `packages/types/`
2. **Migration SQL** em `supabase/migrations/`
3. **RLS Policy** na mesma migration
4. **UI Components** em `apps/web/src/components/`
5. **Pages** em `apps/web/src/app/`

### Adicionar Edge Function

1. Criar em `supabase/functions/<nome>/index.ts`
2. Testar localmente: `supabase functions serve <nome>`
3. Deploy: `supabase functions deploy <nome>`

## 🧪 Testes

```bash
# Testes unitários
pnpm test

# E2E (quando implementado)
pnpm test:e2e

# Coverage
pnpm test -- --coverage
```

## 🔍 Code Review

Todos os PRs serão revistos quanto a:
- ✅ Código funcional e testado
- ✅ Seguir convenções de código
- ✅ Documentação atualizada
- ✅ Sem quebrar funcionalidades existentes
- ✅ Types corretos (TypeScript)
- ✅ RLS policies quando aplicável

## 🐛 Reportar Bugs

Use o template de Issue:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Screenshots (se aplicável)
- Versão/ambiente

## 💡 Sugerir Funcionalidades

Use o template de Feature Request:
- Problema que resolve
- Solução proposta
- Alternativas consideradas
- Contexto adicional

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Zod Docs](https://zod.dev)
- [TanStack Query](https://tanstack.com/query/latest)

## ⚖️ Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

---

**Obrigado por contribuir! 🎉**



