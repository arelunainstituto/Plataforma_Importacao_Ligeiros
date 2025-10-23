# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2025-10-23

### ✨ Adicionado
- **Banco de dados Supabase em produção** - Projeto criado e configurado em `eu-west-1`
- **5 Migrations aplicadas** com sucesso:
  - Schema inicial (Tenants, Users, Customers, Vehicles)
  - Tarefas e Documentos
  - Impostos e Pagamentos
  - Auditoria e Notificações
  - Políticas RLS (Row-Level Security)
- **15 Tabelas criadas** com RLS habilitado
- **Dados iniciais** - Tabelas fiscais ISV (Cilindrada + CO2) 2024
- **Configurações de ambiente** - `.env` e `apps/web/.env.local` configurados

### 🔧 Configurado
- Conexão com Supabase em produção (`asowrlsfgymuogbclgga.supabase.co`)
- Variáveis de ambiente para desenvolvimento
- Credenciais de autenticação (anon key)

### 📊 Estatísticas
- **15 Tabelas** com RLS ativo
- **50+ Políticas** de segurança
- **15 ENUMS** PostgreSQL
- **20+ Índices** otimizados
- **8 Triggers** automáticos
- **5 Funções SQL**
- **1 View** (DashboardStats)

## [1.0.0] - 2025-10-23

### 🎉 Release Inicial

#### ✨ Adicionado
- **Estrutura do Monorepo** com pnpm workspaces + Turbo
- **Frontend Next.js 14** (App Router, React Server Components)
  - Página de login funcional
  - Dashboard com estatísticas
  - Componentes UI (shadcn/ui)
  - Integração Supabase (client/server)
  - Middleware de autenticação
- **Backend Supabase** (estrutura SQL completa)
  - 5 migrations SQL (~1.560 linhas)
  - 3 Edge Functions (Deno)
    - `calculate-isv` - Cálculo automático de ISV
    - `generate-pdf` - Geração de PDFs
    - `vin-decoder` - Decode de VIN
  - Configuração completa (config.toml)
  - Seed data para testes
- **Package Types** (`packages/types`)
  - 11 arquivos com schemas Zod (~1.234 linhas)
  - Validação completa de dados
  - Tipos TypeScript exportados
- **Documentação Completa**
  - README.md com guia completo
  - ARCHITECTURE.md com diagramas
  - PROJECT_SUMMARY.md com resumo executivo
  - SETUP.md, QUICKSTART.md e outros guias
- **CI/CD** - GitHub Actions workflows
  - Lint & Type-check
  - Build pipeline
  - Deploy Vercel (preview + production)
  - Deploy Supabase migrations

#### 🏗️ Arquitetura
- Sistema multi-tenant com RLS
- RBAC completo (6 roles)
- Auditoria de todas as ações
- Gestão documental com Storage
- Workflow operacional completo
- Cálculo automático de impostos (ISV/IVA/IUC)

#### 📦 Stack Tecnológica
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Validação:** Zod
- **State Management:** TanStack Query
- **Build System:** pnpm + Turbo
- **CI/CD:** GitHub Actions + Vercel

#### 📊 Estatísticas Iniciais
- **80 arquivos** criados
- **~14.274 linhas** de código
- **~5.693 linhas** sem node_modules
- **15 Tabelas** definidas
- **15 ENUMS** PostgreSQL
- **3 Edge Functions**

---

## Tipos de Mudanças

- `Adicionado` - para novas funcionalidades
- `Modificado` - para mudanças em funcionalidades existentes
- `Depreciado` - para funcionalidades que serão removidas
- `Removido` - para funcionalidades removidas
- `Corrigido` - para correção de bugs
- `Segurança` - para vulnerabilidades de segurança

[1.1.0]: https://github.com/arelunainstituto/Plataforma_Importacao_Ligeiros/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/arelunainstituto/Plataforma_Importacao_Ligeiros/releases/tag/v1.0.0

