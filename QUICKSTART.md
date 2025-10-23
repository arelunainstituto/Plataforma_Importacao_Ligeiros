# ⚡ Quickstart - 5 Minutos para Começar

Guia rápido para ter a plataforma rodando em menos de 5 minutos.

## 🎯 Pré-requisitos Rápidos

```bash
# Instalar Node.js 18+ e pnpm
npm install -g pnpm

# Instalar Supabase CLI
brew install supabase/tap/supabase  # macOS
# ou
scoop install supabase              # Windows
```

## 🚀 3 Passos para Rodar

### 1. Setup Inicial (2 min)

```bash
# Clone e instale
git clone <repo-url>
cd Plataforma_Importacao_Ligeiros
pnpm install

# Configure ambiente
cp env.example .env
```

### 2. Inicie o Supabase (2 min)

```bash
# Inicia banco local + serviços
pnpm supabase:start

# Aguarde... (primeira vez demora ~2 min)
# Copie as credenciais exibidas para .env
```

Atualize `.env` com os valores exibidos:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

### 3. Aplique Migrations & Rode (1 min)

```bash
# Aplica migrations SQL
cd supabase && supabase db reset && cd ..

# Inicia aplicação
pnpm dev
```

## 🎉 Pronto!

Abra http://localhost:3000

**Login demo:**
- Email: `admin@example.com`
- Password: `password123`

**Nota:** Se o login não funcionar, crie um utilizador:
1. Abra http://localhost:54323 (Supabase Studio)
2. **Authentication** → **Users** → **Add user**
3. Email: `admin@example.com`, Password: `password123`

## 📚 Próximos Passos

- [Setup Completo](./SETUP.md) - Guia detalhado
- [Arquitetura](./ARCHITECTURE.md) - Como funciona
- [README](./README.md) - Documentação geral

## 🐛 Problemas?

```bash
# Parar tudo e recomeçar
pnpm supabase:stop
docker system prune -a
pnpm supabase:start
cd supabase && supabase db reset
```

---

**Ajuda rápida:**
- Supabase não inicia → Certifique-se que Docker Desktop está rodando
- Erro 500 → Verifique se migrations foram aplicadas (`supabase db reset`)
- Login falha → Crie user no Studio (http://localhost:54323)



