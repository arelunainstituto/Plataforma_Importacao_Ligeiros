# 🎉 Aplicação Rodando em Modo DEMO

## ✅ Status: ONLINE

A aplicação está rodando em **modo demonstração** em:

### 🌐 **http://localhost:3000**

---

## 📱 Como Acessar

1. **Abra o navegador** em: http://localhost:3000
2. Você será redirecionado automaticamente para a **página de login**
3. A interface está funcionando perfeitamente!

---

## ⚠️ Limitações do Modo DEMO

Como o **Supabase não está instalado/rodando**, algumas funcionalidades estarão limitadas:

### ❌ Não Funciona Agora:
- ❌ Login/Autenticação (sem backend)
- ❌ Dashboard com dados reais
- ❌ Busca de processos
- ❌ Upload de documentos
- ❌ Cálculo de ISV

### ✅ Funciona Perfeitamente:
- ✅ Interface completa e responsiva
- ✅ Navegação entre páginas
- ✅ Layouts e componentes UI
- ✅ Tema claro/escuro
- ✅ Formulários (sem submit)

---

## 🚀 Para Funcionalidade Completa

Para ter **todas as funcionalidades** funcionando, você precisa:

### 1. Instalar Supabase CLI

**macOS:**
```bash
# Atualizar Command Line Tools primeiro
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install

# Depois instalar Supabase
brew install supabase/tap/supabase
```

### 2. Iniciar Supabase Local

```bash
cd Plataforma_Importacao_Ligeiros
cd supabase
supabase start
```

Isso iniciará:
- PostgreSQL (banco de dados)
- Supabase Auth (autenticação)
- Supabase Storage (documentos)
- Supabase Studio (admin em http://localhost:54323)

### 3. Aplicar Migrations

```bash
supabase db reset
```

### 4. Atualizar Credenciais

Copie as credenciais exibidas por `supabase start` para o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<seu-anon-key-real>
```

### 5. Reiniciar Aplicação

```bash
# Parar servidor atual
pkill -f "next dev"

# Reiniciar
cd apps/web
pnpm dev
```

---

## 📸 O Que Você Pode Ver Agora

### Página de Login
- ✅ Design profissional
- ✅ Formulário de email/password
- ✅ Validação visual
- ✅ Responsivo mobile

### Interface
- ✅ Sidebar de navegação
- ✅ Header com perfil
- ✅ Cards de métricas
- ✅ Tabelas responsivas
- ✅ Botões e formulários

---

## 🎨 Tecnologias Visíveis

Mesmo em modo demo, você pode ver:

- **Next.js 14** com App Router
- **Tailwind CSS** para styling
- **shadcn/ui** componentes modernos
- **TypeScript** type-safety
- **Responsive Design** mobile-first
- **Dark Mode** toggle

---

## 🛠️ Comandos Úteis

```bash
# Parar servidor
pkill -f "next dev"

# Ver logs do servidor
tail -f apps/web/.next/trace

# Verificar se está rodando
curl http://localhost:3000

# Trocar de porta (se 3000 estiver ocupada)
cd apps/web
PORT=3001 pnpm dev
```

---

## 📚 Próximos Passos

1. **Explorar a interface** em http://localhost:3000
2. **Instalar Supabase CLI** quando tiver tempo
3. **Seguir o [QUICKSTART.md](./QUICKSTART.md)** para setup completo
4. **Ler [ARCHITECTURE.md](./ARCHITECTURE.md)** para entender o sistema

---

## 🆘 Problemas?

**Erro "Cannot GET /"**
→ Servidor ainda está iniciando, aguarde 10-15 segundos

**Página em branco**
→ Limpe cache do navegador (Cmd+Shift+R no Mac)

**Porta ocupada**
→ Use `PORT=3001 pnpm dev` em outra porta

**Servidor travou**
→ `pkill -f "next dev"` e reinicie

---

## ℹ️ Informações do Sistema

- **URL**: http://localhost:3000
- **Porta**: 3000
- **Status**: ✅ Rodando
- **Modo**: DEMO (sem backend)
- **Build**: Development
- **Hot Reload**: ✅ Ativo

---

**Desenvolvido por TRAe Projects**  
**Data:** 23 de Outubro de 2025

🎉 **Aproveite a demonstração!**



