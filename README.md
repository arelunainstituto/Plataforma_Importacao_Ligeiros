# 🚗 Plataforma de Importação e Legalização de Veículos

Plataforma B2B/B2C completa para gestão de processos de importação de veículos da União Europeia para Portugal, com cálculo automático de impostos (ISV/IVA/IUC), gestão documental, workflows operacionais e portal do cliente.

## 🏗️ Arquitetura

Este é um **monorepo** gerido com **pnpm workspaces** e **Turbo**, utilizando **Supabase** como backend único (PostgreSQL, Auth, Storage, Edge Functions).

```
plataforma-importacao-ligeiros/
├── apps/
│   ├── web/          # Next.js 14 (App Router, TypeScript, Tailwind, shadcn/ui)
│   └── api/          # NestJS (camada de serviços opcional)
├── packages/
│   ├── db/           # Prisma Client + Schema
│   ├── ui/           # Componentes partilhados (shadcn/ui)
│   ├── types/        # Tipos e schemas Zod
│   └── config/       # Configurações ESLint/TypeScript
├── supabase/
│   ├── migrations/   # SQL migrations
│   ├── functions/    # Edge Functions
│   └── config.toml   # Configuração do projeto Supabase
└── .github/
    └── workflows/    # CI/CD pipelines
```

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 14** (App Router, React Server Components)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes UI
- **TanStack Query** - Data fetching & cache
- **react-hook-form** + **zod** - Validação de formulários
- **Recharts** - Gráficos e visualizações

### Backend
- **Supabase**:
  - PostgreSQL (database)
  - Auth (autenticação multi-provider)
  - Storage (documentos com RLS)
  - Edge Functions (jobs assíncronos)
  - Realtime (atualizações em tempo real)
- **Prisma** - ORM type-safe
- **NestJS** (opcional) - Camada de serviços/domínio

### DevOps
- **pnpm** - Package manager
- **Turbo** - Build system
- **GitHub Actions** - CI/CD
- **Vercel** - Deploy frontend
- **Playwright** - E2E testing
- **Jest** - Unit testing

## 📋 Pré-requisitos

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Supabase CLI** ([instalação](https://supabase.com/docs/guides/cli))
- **Docker** (para desenvolvimento local com Supabase)

## 🔧 Setup Inicial

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar Supabase Local

```bash
# Iniciar containers Docker do Supabase
pnpm supabase:start

# Copiar .env.example para .env e preencher as variáveis
cp .env.example .env
```

Após iniciar o Supabase, o CLI exibirá as credenciais locais:
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
anon key: eyJh...
service_role key: eyJh...
```

Copie estes valores para o `.env`.

### 3. Aplicar Migrations

```bash
# Gerar Prisma Client
pnpm db:generate

# Aplicar migrations ao Supabase local
pnpm db:push

# Ou usar migrations SQL diretamente
cd supabase
supabase db reset
```

### 4. Seed Database (opcional)

```bash
pnpm --filter @importacao/db seed
```

### 5. Iniciar Aplicação

```bash
# Iniciar todos os apps (web + api) em modo dev
pnpm dev

# Ou apenas o frontend
pnpm --filter @importacao/web dev
```

A aplicação estará disponível em:
- **Web App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323

## 🗃️ Modelo de Dados

### Entidades Principais

- **User** → Utilizadores (ref. `auth.users`)
- **Tenant** → Empresas/Organizações
- **TenantUser** → Ligação User ↔ Tenant (RBAC)
- **Customer** → Clientes (pessoa singular/coletiva)
- **Vehicle** → Veículos (VIN, marca, modelo, CO₂)
- **ImportCase** → Processos de importação
- **CaseTask** → Tarefas operacionais
- **Document** → Documentos (Storage)
- **TaxEstimation** → Cálculo ISV/IVA/IUC
- **Payment** → Pagamentos
- **Appointment** → Agendamentos (inspeção, IMT)
- **AuditLog** → Auditoria completa
- **Notification** → Notificações

### Estados do Processo

```
INTAKE → DOCS_PENDING → DOCS_VERIFICATION → 
CUSTOMS_DECLARATION → ISV_CALCULATION → 
INSPECTION_B → IMT_REGISTRATION → REGISTRY → 
PLATES_ISSUED → COMPLETED
```

Estados alternativos: `ON_HOLD`, `REJECTED`

## 🔐 Autenticação & Segurança

### Supabase Auth

- **Email/Password**
- **Magic Link**
- **OAuth** (Google, Microsoft, GitHub)

### Row-Level Security (RLS)

Todas as tabelas principais têm políticas RLS baseadas em `tenant_id`:

```sql
CREATE POLICY "tenant_access" ON "ImportCase"
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM tenant_users 
    WHERE user_id = auth.uid()
  )
);
```

### Papéis (Roles)

- `SUPER_ADMIN` - Administrador da plataforma
- `ADMIN` - Administrador do tenant
- `MANAGER` - Gestor de operações
- `OPERATOR` - Operador (tarefas)
- `VIEWER` - Visualizador (read-only)
- `CLIENT` - Cliente externo (portal)

## 📦 Storage

### Buckets Supabase

1. **documents** (privado)
   - Faturas, certificados, DUA, etc.
   - RLS: acesso por tenant_id
   
2. **exports** (privado)
   - Relatórios PDF/Excel gerados
   - RLS: acesso por tenant_id

Exemplo de upload:

```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`${tenantId}/${caseId}/${file.name}`, file);
```

## ⚡ Edge Functions

Localizadas em `supabase/functions/`:

- **calculate-isv** - Cálculo automático de ISV
- **generate-pdf** - Geração de documentos PDF
- **ocr-document** - OCR de documentos (mock)
- **send-notification** - Envio de notificações
- **vin-decoder** - Decode de VIN (mock)

Deploy:
```bash
supabase functions deploy calculate-isv
```

## 🧮 Regras de Negócio

### Cálculo de ISV

Baseado em:
- Cilindrada (cc)
- Emissões CO₂ (g/km)
- Idade do veículo
- Tipo de combustível
- Tabelas parametrizadas (versionadas)

### Cálculo de IVA

- **Particular** (intracomunitário): sem IVA
- **Empresa**: IVA sobre valor aquisição + ISV + custos

### Cálculo de IUC

Estimativa anual baseada em CO₂ e cilindrada.

## 🧪 Testes

```bash
# Unit tests (todos os packages)
pnpm test

# E2E tests (Playwright)
pnpm --filter @importacao/web test:e2e

# Coverage
pnpm test -- --coverage
```

## 🚢 Deploy

### Frontend (Vercel)

```bash
# Conectar repositório ao Vercel
vercel

# Configurar variáveis de ambiente no dashboard Vercel
# Deploy automático via GitHub
git push origin main
```

### Backend (Supabase)

```bash
# Link ao projeto Supabase
supabase link --project-ref your-project-ref

# Deploy migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy --no-verify-jwt
```

### CI/CD

Pipeline GitHub Actions (`.github/workflows/ci.yml`):
1. Lint & Type Check
2. Unit Tests
3. Build
4. E2E Tests
5. Deploy (on push to main)

## 📊 Scripts Úteis

```bash
# Desenvolvimento
pnpm dev                    # Iniciar todos os apps
pnpm dev:web               # Apenas frontend
pnpm dev:api               # Apenas API

# Database
pnpm db:generate           # Gerar Prisma Client
pnpm db:push               # Push schema ao DB
pnpm db:migrate            # Criar migration
pnpm db:studio             # Abrir Prisma Studio
pnpm supabase:reset        # Reset DB local

# Build & Deploy
pnpm build                 # Build all apps
pnpm lint                  # Lint all
pnpm format                # Format code

# Limpeza
pnpm clean                 # Limpar builds
rm -rf node_modules        # Limpar tudo
pnpm install               # Reinstalar
```

## 📖 Documentação

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 🤝 Contribuir

1. Fork o projeto
2. Criar feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit as alterações (`git commit -m 'feat: adicionar nova funcionalidade'`)
4. Push para o branch (`git push origin feature/nova-funcionalidade`)
5. Abrir Pull Request

## 📝 Licença

Propriedade privada - Todos os direitos reservados.

## 👥 Equipa

Desenvolvido por **TRAe Projects**

---

**Nota**: Este é um projeto em desenvolvimento ativo. Consulte a documentação interna para detalhes de implementação.



