-- Migration: Schema inicial - Tenants, Users, Customers, Vehicles
-- Data: 2024-01-01
-- Descrição: Tabelas base do domínio

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para pesquisa full-text

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'OPERATOR',
  'VIEWER',
  'CLIENT'
);

CREATE TYPE case_status AS ENUM (
  'INTAKE',
  'DOCS_PENDING',
  'DOCS_VERIFICATION',
  'CUSTOMS_DECLARATION',
  'ISV_CALCULATION',
  'INSPECTION_B',
  'IMT_REGISTRATION',
  'REGISTRY',
  'PLATES_ISSUED',
  'COMPLETED',
  'ON_HOLD',
  'REJECTED'
);

CREATE TYPE task_status AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'OVERDUE'
);

CREATE TYPE task_type AS ENUM (
  'DOCUMENT_COLLECTION',
  'DOCUMENT_VERIFICATION',
  'CUSTOMS_DECLARATION',
  'ISV_PAYMENT',
  'INSPECTION_B_BOOKING',
  'INSPECTION_B_COMPLETION',
  'IMT_SUBMISSION',
  'IMT_APPROVAL',
  'REGISTRY_SUBMISSION',
  'PLATES_REQUEST',
  'CUSTOMER_CONTACT',
  'OTHER'
);

CREATE TYPE document_type AS ENUM (
  'INVOICE',
  'COC',
  'REGISTRATION_CERT',
  'ID_DOCUMENT',
  'NIF_DOCUMENT',
  'ADDRESS_PROOF',
  'DUA',
  'INSPECTION_CERT',
  'IMT_FORM',
  'PAYMENT_PROOF',
  'OTHER'
);

CREATE TYPE document_status AS ENUM (
  'PENDING_UPLOAD',
  'UPLOADED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'EXPIRED'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REFUNDED'
);

CREATE TYPE payment_type AS ENUM (
  'ISV',
  'IVA',
  'IUC',
  'IMT_FEE',
  'INSPECTION_FEE',
  'SERVICE_FEE',
  'OTHER'
);

CREATE TYPE notification_type AS ENUM (
  'EMAIL',
  'SMS',
  'IN_APP',
  'PUSH'
);

CREATE TYPE notification_priority AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);

CREATE TYPE fuel_type AS ENUM (
  'GASOLINE',
  'DIESEL',
  'ELECTRIC',
  'HYBRID',
  'PLUGIN_HYBRID',
  'LPG',
  'CNG',
  'HYDROGEN',
  'OTHER'
);

CREATE TYPE vehicle_category AS ENUM (
  'M1',  -- Veículos ligeiros de passageiros
  'N1',  -- Veículos ligeiros de mercadorias
  'M2',  -- Veículos de passageiros com mais de 8 lugares
  'N2',  -- Veículos de mercadorias (peso bruto 3.5-12t)
  'L',   -- Motociclos e ciclomotores
  'OTHER'
);

CREATE TYPE person_type AS ENUM (
  'INDIVIDUAL',
  'COMPANY'
);

CREATE TYPE tax_table_type AS ENUM (
  'ISV_CILINDRADA',
  'ISV_CO2',
  'IVA_RATES',
  'IUC_TABLE'
);

-- ============================================================================
-- TABELA: Tenant (Multi-tenancy)
-- ============================================================================

CREATE TABLE "Tenant" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  nif VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenant_nif ON "Tenant"(nif);
CREATE INDEX idx_tenant_active ON "Tenant"(is_active);

COMMENT ON TABLE "Tenant" IS 'Organizações/Empresas que utilizam a plataforma';
COMMENT ON COLUMN "Tenant".settings IS 'Configurações fiscais, notificações, etc (JSON)';

-- ============================================================================
-- TABELA: TenantUser (Ligação User ↔ Tenant + RBAC)
-- ============================================================================

CREATE TABLE "TenantUser" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'VIEWER',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_tenant_user_tenant ON "TenantUser"(tenant_id);
CREATE INDEX idx_tenant_user_user ON "TenantUser"(user_id);
CREATE INDEX idx_tenant_user_role ON "TenantUser"(role);

COMMENT ON TABLE "TenantUser" IS 'Associação entre utilizadores e tenants com RBAC';

-- ============================================================================
-- TABELA: Customer (Clientes)
-- ============================================================================

CREATE TABLE "Customer" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  type person_type NOT NULL DEFAULT 'INDIVIDUAL',
  
  -- Pessoa singular
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  
  -- Pessoa coletiva
  company_name VARCHAR(255),
  
  nif VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  
  address TEXT,
  postal_code VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(2) DEFAULT 'PT',
  
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT customer_name_check CHECK (
    (type = 'INDIVIDUAL' AND first_name IS NOT NULL AND last_name IS NOT NULL) OR
    (type = 'COMPANY' AND company_name IS NOT NULL)
  )
);

CREATE INDEX idx_customer_tenant ON "Customer"(tenant_id);
CREATE INDEX idx_customer_nif ON "Customer"(nif);
CREATE INDEX idx_customer_email ON "Customer"(email);
CREATE INDEX idx_customer_type ON "Customer"(type);
CREATE INDEX idx_customer_search ON "Customer" USING gin(
  (first_name || ' ' || last_name || ' ' || COALESCE(company_name, '')) gin_trgm_ops
);

COMMENT ON TABLE "Customer" IS 'Clientes (pessoa singular ou coletiva)';

-- ============================================================================
-- TABELA: Vehicle (Veículos)
-- ============================================================================

CREATE TABLE "Vehicle" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  
  -- Identificação
  vin VARCHAR(17) NOT NULL UNIQUE,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  variant VARCHAR(100),
  version VARCHAR(100),
  
  -- Características técnicas
  first_registration_date DATE,
  manufacture_year INTEGER,
  category vehicle_category DEFAULT 'M1',
  fuel_type fuel_type NOT NULL,
  engine_capacity INTEGER, -- Cilindrada em cc
  power_kw DECIMAL(10, 2),
  power_hp DECIMAL(10, 2),
  co2_emissions INTEGER, -- g/km
  euro_emission_standard VARCHAR(10),
  
  -- Dimensões e peso
  weight_empty INTEGER, -- kg
  weight_gross INTEGER, -- kg
  seats INTEGER,
  doors INTEGER,
  
  -- Cor
  color VARCHAR(50),
  color_code VARCHAR(20),
  
  -- Dados de origem
  origin_country VARCHAR(2), -- Código ISO
  origin_registration VARCHAR(50),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicle_tenant ON "Vehicle"(tenant_id);
CREATE INDEX idx_vehicle_vin ON "Vehicle"(vin);
CREATE INDEX idx_vehicle_make_model ON "Vehicle"(make, model);
CREATE INDEX idx_vehicle_category ON "Vehicle"(category);
CREATE INDEX idx_vehicle_fuel ON "Vehicle"(fuel_type);

COMMENT ON TABLE "Vehicle" IS 'Veículos a importar/legalizados';
COMMENT ON COLUMN "Vehicle".vin IS 'Vehicle Identification Number (17 caracteres)';
COMMENT ON COLUMN "Vehicle".co2_emissions IS 'Emissões CO2 em g/km (WLTP/NEDC)';

-- ============================================================================
-- TABELA: ImportCase (Processos de Importação)
-- ============================================================================

CREATE TABLE "ImportCase" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  
  customer_id UUID NOT NULL REFERENCES "Customer"(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES "Vehicle"(id) ON DELETE RESTRICT,
  
  status case_status NOT NULL DEFAULT 'INTAKE',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Datas importantes
  intake_date TIMESTAMPTZ DEFAULT NOW(),
  target_completion_date DATE,
  actual_completion_date TIMESTAMPTZ,
  
  -- Valores financeiros
  purchase_price DECIMAL(12, 2),
  purchase_currency VARCHAR(3) DEFAULT 'EUR',
  estimated_total_cost DECIMAL(12, 2),
  
  -- Origem
  dealer_name VARCHAR(255),
  dealer_country VARCHAR(2),
  purchase_date DATE,
  
  -- Observações
  notes TEXT,
  internal_notes TEXT, -- Notas apenas para equipa
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequência para case_number
CREATE SEQUENCE import_case_number_seq START 1000;

CREATE INDEX idx_case_tenant ON "ImportCase"(tenant_id);
CREATE INDEX idx_case_customer ON "ImportCase"(customer_id);
CREATE INDEX idx_case_vehicle ON "ImportCase"(vehicle_id);
CREATE INDEX idx_case_status ON "ImportCase"(status);
CREATE INDEX idx_case_assigned ON "ImportCase"(assigned_to);
CREATE INDEX idx_case_number ON "ImportCase"(case_number);
CREATE INDEX idx_case_dates ON "ImportCase"(intake_date, target_completion_date);

COMMENT ON TABLE "ImportCase" IS 'Processos de importação de veículos';
COMMENT ON COLUMN "ImportCase".case_number IS 'Número único do processo (gerado automaticamente)';

-- ============================================================================
-- TRIGGER: Auto-gerar case_number
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL THEN
    NEW.case_number := 'IMP-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                       LPAD(nextval('import_case_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_case_number
BEFORE INSERT ON "ImportCase"
FOR EACH ROW
EXECUTE FUNCTION generate_case_number();

-- ============================================================================
-- TRIGGER: updated_at automático
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tenant_updated_at
BEFORE UPDATE ON "Tenant"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_tenant_user_updated_at
BEFORE UPDATE ON "TenantUser"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_customer_updated_at
BEFORE UPDATE ON "Customer"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_vehicle_updated_at
BEFORE UPDATE ON "Vehicle"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_import_case_updated_at
BEFORE UPDATE ON "ImportCase"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();



