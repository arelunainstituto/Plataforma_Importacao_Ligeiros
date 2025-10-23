# 📋 Guia de Setup - Plataforma de Importação de Veículos

Este documento fornece instruções passo-a-passo para configurar e executar a plataforma.

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 ([Instalação](https://pnpm.io/installation))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Supabase CLI** ([Instalação](https://supabase.com/docs/guides/cli))
- **Git** ([Download](https://git-scm.com/))

### Verificar Instalações

```bash
node --version    # Deve ser >= 18.0.0
pnpm --version    # Deve ser >= 8.0.0
docker --version  # Qualquer versão recente
supabase --version # Qualquer versão recente
```

## 🚀 Setup Inicial

### 1. Clonar o Repositório

```bash
git clone <repository-url>
cd Plataforma_Importacao_Ligeiros
```

### 2. Instalar Dependências

```bash
pnpm install
```

Este comando instalará todas as dependências de todos os workspaces do monorepo.

### 3. Configurar Variáveis de Ambiente

```bash
cp env.example .env
```

Edite o ficheiro `.env` criado e preencha as variáveis necessárias (ou deixe os valores default para desenvolvimento local).

## 🗄️ Configurar Supabase Local

### 1. Iniciar Supabase

```bash
pnpm supabase:start
```

Este comando irá:
- Baixar as imagens Docker necessárias (primeira vez pode demorar)
- Iniciar PostgreSQL, PostgREST, GoTrue (Auth), Storage, e outros serviços
- Exibir as credenciais locais

Exemplo de output:
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
anon key: eyJh...
service_role key: eyJh...
```

### 2. Copiar Credenciais para .env

Copie os valores exibidos para o ficheiro `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### 3. Aplicar Migrations

As migrations SQL já estão em `supabase/migrations/`. Para aplicá-las:

```bash
cd supabase
supabase db reset
```

Este comando:
- Reseta o banco de dados local
- Aplica todas as migrations na ordem correta
- Executa o seed (dados de exemplo)

**Nota:** Use `db reset` em desenvolvimento. Em produção, use `db push`.

### 4. Verificar Database

Abra o **Supabase Studio** em http://localhost:54323 e verifique:
- ✅ Tabelas criadas (Tenant, Customer, Vehicle, ImportCase, etc.)
- ✅ RLS policies ativas
- ✅ Functions e triggers criados
- ✅ Dados de seed carregados

## 👤 Criar Primeiro Utilizador

### Via Supabase Studio (Recomendado)

1. Abra http://localhost:54323
2. Vá para **Authentication** → **Users**
3. Clique em **Add user** → **Create new user**
4. Preencha:
   - Email: `admin@example.com`
   - Password: `password123`
5. Clique em **Save**

### Via SQL (Supabase Studio → SQL Editor)

```sql
-- 1. Criar utilizador na tabela auth.users (Supabase Auth)
-- Nota: Isto é feito automaticamente via Studio ou API de signup

-- 2. Associar ao tenant criado no seed
INSERT INTO "TenantUser" (tenant_id, user_id, role)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- ID do tenant de exemplo
  (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1),
  'ADMIN'
);
```

## 🖥️ Iniciar Aplicação

### Modo Desenvolvimento

```bash
# Iniciar todos os apps (web + api)
pnpm dev

# Ou apenas o frontend
pnpm --filter @importacao/web dev
```

A aplicação estará disponível em:
- **Web App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **Inbucket (Emails)**: http://localhost:54324

### Login

Acesse http://localhost:3000/auth/login e use:
- Email: `admin@example.com`
- Password: `password123`

## 🧪 Testes

```bash
# Testes de todos os packages
pnpm test

# Lint
pnpm lint

# Type-check
pnpm type-check
```

## 🛠️ Comandos Úteis

### Database

```bash
# Gerar tipos TypeScript do schema Supabase
supabase gen types typescript --local > apps/web/src/types/supabase.ts

# Abrir Prisma Studio (se usar Prisma)
pnpm db:studio

# Criar nova migration
cd supabase
supabase migration new <nome-da-migration>

# Verificar status
pnpm supabase:status

# Parar Supabase
pnpm supabase:stop
```

### Edge Functions

```bash
# Testar Edge Function localmente
supabase functions serve calculate-isv

# Deploy de uma função (produção)
supabase functions deploy calculate-isv
```

### Monorepo

```bash
# Limpar tudo e reinstalar
pnpm clean
pnpm install

# Build de todos os packages
pnpm build

# Executar comando em workspace específico
pnpm --filter @importacao/types <comando>
```

## 🌍 Deploy em Produção

### 1. Configurar Supabase Cloud

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Aguarde o provisionamento (2-3 minutos)
4. Copie as credenciais do **Project Settings** → **API**:
   - `URL`
   - `anon/public key`
   - `service_role key`

### 2. Aplicar Migrations

```bash
# Link ao projeto
supabase link --project-ref <seu-project-ref>

# Push das migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy --no-verify-jwt
```

### 3. Deploy Frontend (Vercel)

1. Push do código para GitHub
2. Conecte o repositório no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente no Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Defina **Root Directory**: `apps/web`
5. Deploy automático será ativado

### 4. Configurar CI/CD

As variáveis necessárias no GitHub Secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🐛 Troubleshooting

### Supabase não inicia

```bash
# Verificar se Docker está em execução
docker ps

# Parar e remover containers
pnpm supabase:stop
docker system prune -a

# Reiniciar
pnpm supabase:start
```

### Erro de conexão ao banco

- Verifique se o Supabase está rodando: `pnpm supabase:status`
- Confirme as credenciais no `.env`
- Tente resetar: `cd supabase && supabase db reset`

### Migrations não aplicam

```bash
# Verificar migrations pendentes
supabase migration list

# Forçar reset (CUIDADO: apaga dados)
supabase db reset

# Ou aplicar manualmente via Studio
# SQL Editor → copiar conteúdo da migration → Execute
```

### Portas em uso

Se as portas padrão (54321, 54322, etc.) estiverem em uso:

```bash
# Editar supabase/config.toml e mudar as portas
# Depois:
pnpm supabase:stop
pnpm supabase:start
```

## 📚 Próximos Passos

Após o setup:
1. ✅ Explorar o Dashboard
2. ✅ Criar um processo de importação de teste
3. ✅ Testar upload de documentos
4. ✅ Calcular ISV via Edge Function
5. ✅ Configurar roles e permissões RLS
6. ✅ Personalizar branding e configurações

## 🆘 Ajuda

- **Documentação Supabase**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **pnpm Docs**: https://pnpm.io
- **Issues**: Abra uma issue no repositório

---

Desenvolvido por **TRAe Projects**



