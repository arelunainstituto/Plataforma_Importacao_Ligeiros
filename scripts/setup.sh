#!/bin/bash

# Script de Setup Automático
# Plataforma de Importação de Veículos

set -e

echo "🚀 Setup da Plataforma de Importação de Veículos"
echo "================================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Verificar Node.js
echo "📦 A verificar dependências..."
echo ""

if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado!"
    echo "   Instale Node.js >= 18.0.0 em https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versão >= 18.0.0 é necessária (actual: $(node -v))"
    exit 1
fi
print_success "Node.js $(node -v)"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm não está instalado. A instalar..."
    npm install -g pnpm
fi
print_success "pnpm $(pnpm -v)"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado!"
    echo "   Instale Docker Desktop em https://www.docker.com/products/docker-desktop"
    exit 1
fi
print_success "Docker $(docker -v | cut -d' ' -f3 | tr -d ',')"

# Verificar Supabase CLI
if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI não está instalado. A instalar..."
    
    # Detectar OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            print_error "Homebrew não encontrado. Instale manualmente: https://supabase.com/docs/guides/cli"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        print_info "Instale Supabase CLI: https://supabase.com/docs/guides/cli"
        exit 1
    else
        print_error "OS não suportado para instalação automática."
        print_info "Instale manualmente: https://supabase.com/docs/guides/cli"
        exit 1
    fi
fi
print_success "Supabase CLI $(supabase -v)"

echo ""
echo "✅ Todas as dependências estão instaladas!"
echo ""

# Instalar dependências do projeto
print_info "A instalar dependências do projeto..."
pnpm install
print_success "Dependências instaladas"

# Configurar .env
if [ ! -f .env ]; then
    print_info "A criar ficheiro .env..."
    cp env.example .env
    print_success "Ficheiro .env criado"
    print_warning "⚠️  Lembre-se de preencher as variáveis de ambiente após iniciar o Supabase!"
else
    print_info "Ficheiro .env já existe"
fi

echo ""
echo "🗄️  A iniciar Supabase..."
echo ""

# Verificar se Docker está a correr
if ! docker info &> /dev/null; then
    print_error "Docker não está a correr!"
    echo "   Inicie o Docker Desktop e execute este script novamente."
    exit 1
fi

# Iniciar Supabase
cd supabase
if supabase status &> /dev/null; then
    print_info "Supabase já está a correr"
else
    print_info "A iniciar Supabase (pode demorar alguns minutos na primeira vez)..."
    supabase start
fi

echo ""
print_success "Supabase iniciado!"
echo ""

# Mostrar credenciais
echo "📋 Credenciais do Supabase Local:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
supabase status | grep -E "API URL|DB URL|Studio URL|anon key|service_role key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_warning "Copie os valores acima para o ficheiro .env:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - DATABASE_URL"
echo ""

read -p "Pressione Enter para continuar após atualizar o .env..."

# Aplicar migrations
echo ""
print_info "A aplicar migrations SQL..."
supabase db reset
cd ..

print_success "Migrations aplicadas!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Completo!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 A plataforma está pronta para usar!"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Criar utilizador:"
echo "   Abra http://localhost:54323 (Supabase Studio)"
echo "   Authentication → Users → Add user"
echo "   Email: admin@example.com"
echo "   Password: password123"
echo ""
echo "2. Iniciar aplicação:"
echo "   ${BLUE}pnpm dev${NC}"
echo ""
echo "3. Abrir no browser:"
echo "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "📚 Documentação:"
echo "   - README.md - Visão geral"
echo "   - QUICKSTART.md - Guia rápido"
echo "   - SETUP.md - Setup detalhado"
echo "   - ARCHITECTURE.md - Arquitetura"
echo ""
echo "🆘 Problemas? Consulte SETUP.md → Troubleshooting"
echo ""



