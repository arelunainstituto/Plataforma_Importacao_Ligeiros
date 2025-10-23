# 📑 Índice do Projeto

Navegação rápida por toda a documentação e código da Plataforma de Importação de Veículos.

## 🚀 Começar

| Documento | Descrição | Tempo |
|-----------|-----------|-------|
| [QUICKSTART.md](./QUICKSTART.md) | **Começar em 5 minutos** - Setup mais rápido | ⚡ 5 min |
| [SETUP.md](./SETUP.md) | **Setup completo** - Guia passo-a-passo detalhado | 📖 15 min |
| [README.md](./README.md) | **Visão geral** - O que é o projeto | 📄 10 min |
| [scripts/setup.sh](./scripts/setup.sh) | **Script automático** - Setup com um comando | 🤖 5 min |

## 📚 Documentação Técnica

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura completa, decisões de design, fluxos |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Resumo executivo, estatísticas, checklist |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Guia de contribuição, convenções, workflow |

## 🗂️ Estrutura do Código

### Backend (Supabase)

| Caminho | Descrição | Linhas |
|---------|-----------|--------|
| `supabase/migrations/` | **SQL Migrations** | |
| ├─ `20240101000000_initial_schema.sql` | Schema inicial (15 tabelas) | 465 |
| ├─ `20240101000001_tasks_documents.sql` | Tarefas e documentos | 182 |
| ├─ `20240101000002_taxes_payments.sql` | Impostos e pagamentos | 273 |
| ├─ `20240101000003_audit_notifications.sql` | Auditoria e notificações | 242 |
| ├─ `20240101000004_rls_policies.sql` | Row-Level Security | 398 |
| `supabase/functions/` | **Edge Functions (Deno)** | |
| ├─ `calculate-isv/index.ts` | Cálculo ISV/IVA/IUC | 168 |
| ├─ `generate-pdf/index.ts` | Geração de PDFs | 137 |
| ├─ `vin-decoder/index.ts` | Decode VIN (mock) | 94 |
| `supabase/seed.sql` | Dados de exemplo | 50 |
| `supabase/config.toml` | Configuração local | 87 |

### Frontend (Next.js 14)

| Caminho | Descrição |
|---------|-----------|
| `apps/web/src/app/` | **Pages & Layouts** |
| ├─ `layout.tsx` | Root layout (providers, theme) |
| ├─ `page.tsx` | Homepage (redirect) |
| ├─ `globals.css` | Estilos globais + variáveis CSS |
| ├─ `auth/login/` | Página de login + form |
| ├─ `dashboard/page.tsx` | Dashboard principal |
| `apps/web/src/components/` | **Componentes UI** |
| ├─ `ui/button.tsx` | Botão (shadcn/ui) |
| ├─ `ui/card.tsx` | Card (shadcn/ui) |
| ├─ `ui/sonner.tsx` | Toast notifications |
| ├─ `providers.tsx` | React Query + Theme provider |
| `apps/web/src/lib/` | **Utilities & Clients** |
| ├─ `supabase/server.ts` | Supabase client (server) |
| ├─ `supabase/client.ts` | Supabase client (browser) |
| ├─ `supabase/middleware.ts` | Auth middleware |
| ├─ `utils.ts` | Helpers (formatação, etc) |
| `apps/web/src/middleware.ts` | Next.js middleware (auth) |

### Packages

| Caminho | Descrição | Linhas |
|---------|-----------|--------|
| `packages/types/` | **Schemas Zod + TypeScript** | |
| ├─ `index.ts` | Exports principais | 12 |
| ├─ `enums.ts` | Enums + labels | 212 |
| ├─ `tenant.ts` | Tenant, TenantUser, UserProfile | 71 |
| ├─ `customer.ts` | Customer (singular/coletiva) | 72 |
| ├─ `vehicle.ts` | Vehicle + VIN decode | 117 |
| ├─ `import-case.ts` | ImportCase + relações | 132 |
| ├─ `task.ts` | CaseTask, Appointment | 103 |
| ├─ `document.ts` | Document + upload/verification | 104 |
| ├─ `tax.ts` | TaxTable, TaxEstimation, ISV | 135 |
| ├─ `payment.ts` | Payment + summary | 75 |
| ├─ `notification.ts` | Notification + preferences | 98 |
| ├─ `audit.ts` | AuditLog, IntegrationEvent | 115 |

### DevOps

| Caminho | Descrição |
|---------|-----------|
| `.github/workflows/` | **CI/CD Pipelines** |
| ├─ `ci.yml` | Lint, build, test, deploy |
| ├─ `codeql.yml` | Análise de segurança |
| `scripts/setup.sh` | Script de setup automático |

### Configuração

| Ficheiro | Descrição |
|----------|-----------|
| `package.json` | Root package (scripts globais) |
| `pnpm-workspace.yaml` | Workspaces config |
| `turbo.json` | Turbo build config |
| `.prettierrc` | Prettier config |
| `.gitignore` | Git ignore rules |
| `env.example` | Template de variáveis de ambiente |
| `apps/web/next.config.js` | Next.js config |
| `apps/web/tailwind.config.ts` | Tailwind config |
| `apps/web/tsconfig.json` | TypeScript config |

## 🎯 Features por Módulo

### Autenticação & Segurança
- ✅ `supabase/migrations/20240101000000_initial_schema.sql` (Tenant, TenantUser)
- ✅ `supabase/migrations/20240101000004_rls_policies.sql` (RLS policies)
- ✅ `apps/web/src/lib/supabase/` (Auth clients)
- ✅ `apps/web/src/app/auth/login/` (Login page)
- ✅ `packages/types/tenant.ts` (Schemas)

### Processos de Importação
- ✅ `supabase/migrations/20240101000000_initial_schema.sql` (ImportCase)
- ✅ `supabase/migrations/20240101000001_tasks_documents.sql` (CaseTask)
- ✅ `apps/web/src/app/dashboard/page.tsx` (Dashboard)
- ✅ `packages/types/import-case.ts` (Schemas)

### Gestão Documental
- ✅ `supabase/migrations/20240101000001_tasks_documents.sql` (Document)
- ✅ `supabase/functions/generate-pdf/` (Geração PDF)
- ✅ `packages/types/document.ts` (Schemas)

### Cálculos Fiscais
- ✅ `supabase/migrations/20240101000002_taxes_payments.sql` (TaxEstimation)
- ✅ `supabase/functions/calculate-isv/` (Edge Function)
- ✅ `packages/types/tax.ts` (Schemas)

### Auditoria & Compliance
- ✅ `supabase/migrations/20240101000003_audit_notifications.sql` (AuditLog)
- ✅ `packages/types/audit.ts` (Schemas)

### Integrações
- ✅ `supabase/functions/vin-decoder/` (VIN decode)
- ✅ `supabase/migrations/20240101000003_audit_notifications.sql` (IntegrationEvent)

## 📊 Estatísticas Rápidas

| Métrica | Valor |
|---------|-------|
| **Total de linhas de código** | ~5.693 |
| **SQL (migrations)** | ~1.560 linhas |
| **TypeScript (backend)** | ~399 linhas |
| **TypeScript (frontend)** | ~800 linhas |
| **TypeScript (types)** | ~1.234 linhas |
| **Documentação** | ~1.400 linhas |
| **Configuração** | ~300 linhas |
| **Tabelas SQL** | 15 |
| **Edge Functions** | 3 |
| **RLS Policies** | 50+ |
| **Schemas Zod** | 11 entidades |
| **Páginas Next.js** | 3 (base) |
| **Componentes UI** | 5 (base) |

## 🛠️ Comandos Principais

```bash
# Setup inicial
./scripts/setup.sh              # Setup automático (recomendado)
pnpm install                    # Instalar dependências

# Supabase
pnpm supabase:start            # Iniciar Supabase local
pnpm supabase:stop             # Parar Supabase
pnpm supabase:status           # Ver status
pnpm supabase:reset            # Reset DB (aplica migrations)

# Desenvolvimento
pnpm dev                       # Iniciar todos os apps
pnpm dev:web                   # Apenas frontend
pnpm build                     # Build para produção
pnpm lint                      # Lint
pnpm format                    # Format código

# Outros
pnpm clean                     # Limpar builds
```

## 🔗 Links Úteis

### Locais (após setup)
- **App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **Emails (Inbucket)**: http://localhost:54324

### Externos
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Zod Docs](https://zod.dev)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## 🎓 Para Aprender Mais

| Tópico | Documento | Seção |
|--------|-----------|-------|
| Como funciona a arquitetura? | [ARCHITECTURE.md](./ARCHITECTURE.md) | Visão Geral |
| Como são calculados os impostos? | [ARCHITECTURE.md](./ARCHITECTURE.md) | Edge Functions |
| Como funciona a segurança? | [ARCHITECTURE.md](./ARCHITECTURE.md) | Row-Level Security |
| Quais são os estados do processo? | [ARCHITECTURE.md](./ARCHITECTURE.md) | Fluxo de Estado |
| Como fazer deploy? | [SETUP.md](./SETUP.md) | Deploy em Produção |
| Como contribuir? | [CONTRIBUTING.md](./CONTRIBUTING.md) | - |
| O que foi implementado? | [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Checklist |

## ❓ FAQ Rápido

**Q: Qual é o primeiro passo?**  
A: Siga o [QUICKSTART.md](./QUICKSTART.md) para setup em 5 minutos.

**Q: Como criar um utilizador?**  
A: Abra http://localhost:54323 → Authentication → Users → Add user

**Q: Supabase não inicia?**  
A: Certifique-se que Docker Desktop está a correr.

**Q: Onde estão as migrations?**  
A: Em `supabase/migrations/`

**Q: Como adicionar uma nova tabela?**  
A: Crie uma nova migration SQL + adicione RLS policies

**Q: Como adicionar uma nova página?**  
A: Crie em `apps/web/src/app/` (App Router)

**Q: Onde está o código de cálculo de ISV?**  
A: `supabase/functions/calculate-isv/index.ts`

---

**Última atualização:** 2025-10-23  
**Versão:** 1.0.0  
**Desenvolvido por:** TRAe Projects

🚀 **Pronto para começar? Execute: `./scripts/setup.sh`**



