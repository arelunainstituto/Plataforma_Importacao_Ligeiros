-- Migration: Impostos e Pagamentos
-- Data: 2024-01-01
-- Descrição: Cálculo de ISV/IVA/IUC e gestão de pagamentos

-- ============================================================================
-- TABELA: TaxTable (Tabelas Fiscais Parametrizadas)
-- ============================================================================

CREATE TABLE "TaxTable" (
  id VARCHAR(100) PRIMARY KEY,
  type tax_table_type NOT NULL,
  version VARCHAR(50) NOT NULL,
  effective_date DATE NOT NULL,
  end_date DATE,
  
  data JSONB NOT NULL, -- Tabela de escalões/taxas em JSON
  
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(type, version)
);

CREATE INDEX idx_tax_table_type ON "TaxTable"(type);
CREATE INDEX idx_tax_table_version ON "TaxTable"(version);
CREATE INDEX idx_tax_table_active ON "TaxTable"(is_active);
CREATE INDEX idx_tax_table_dates ON "TaxTable"(effective_date, end_date);

COMMENT ON TABLE "TaxTable" IS 'Tabelas fiscais versionadas (ISV, IVA, IUC)';
COMMENT ON COLUMN "TaxTable".data IS 'Estrutura JSON com escalões e taxas';

-- Exemplo de data para ISV Cilindrada:
-- {
--   "brackets": [
--     {"min": 0, "max": 1000, "rate": 0.60},
--     {"min": 1001, "max": 1250, "rate": 1.00},
--     ...
--   ]
-- }

-- ============================================================================
-- TABELA: TaxEstimation (Cálculos de Impostos)
-- ============================================================================

CREATE TABLE "TaxEstimation" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES "ImportCase"(id) ON DELETE CASCADE,
  
  -- Versão de cálculo
  calculation_version INTEGER DEFAULT 1,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Base de cálculo
  vehicle_value DECIMAL(12, 2) NOT NULL,
  vehicle_age_months INTEGER,
  depreciation_rate DECIMAL(5, 2),
  depreciated_value DECIMAL(12, 2),
  
  -- ISV
  isv_cilindrada DECIMAL(12, 2) DEFAULT 0,
  isv_co2 DECIMAL(12, 2) DEFAULT 0,
  isv_total DECIMAL(12, 2) NOT NULL,
  isv_reduction_percentage DECIMAL(5, 2) DEFAULT 0, -- Depreciação
  isv_table_version VARCHAR(50),
  
  -- IVA
  iva_rate DECIMAL(5, 2),
  iva_base DECIMAL(12, 2),
  iva_amount DECIMAL(12, 2) DEFAULT 0,
  iva_notes TEXT,
  
  -- IUC (estimativa anual)
  iuc_estimated DECIMAL(10, 2) DEFAULT 0,
  
  -- Total
  total_estimated_cost DECIMAL(12, 2) NOT NULL,
  
  -- Detalhes do cálculo
  calculation_details JSONB DEFAULT '{}'::jsonb,
  
  -- Estado
  is_final BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tax_estimation_tenant ON "TaxEstimation"(tenant_id);
CREATE INDEX idx_tax_estimation_case ON "TaxEstimation"(case_id);
CREATE INDEX idx_tax_estimation_final ON "TaxEstimation"(is_final);
CREATE INDEX idx_tax_estimation_version ON "TaxEstimation"(case_id, calculation_version);

COMMENT ON TABLE "TaxEstimation" IS 'Cálculos de ISV, IVA e IUC';
COMMENT ON COLUMN "TaxEstimation".calculation_version IS 'Permite múltiplas versões de cálculo';
COMMENT ON COLUMN "TaxEstimation".isv_reduction_percentage IS 'Redução por antiguidade';

-- ============================================================================
-- TABELA: Payment (Pagamentos)
-- ============================================================================

CREATE TABLE "Payment" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES "ImportCase"(id) ON DELETE CASCADE,
  
  type payment_type NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Referências de pagamento
  payment_reference VARCHAR(100),
  payment_method VARCHAR(50), -- 'BANK_TRANSFER', 'MBWAY', 'MULTIBANCO', 'CARD', 'CASH'
  
  -- Datas
  due_date DATE,
  paid_at TIMESTAMPTZ,
  
  -- Entidade destinatária
  payee_name VARCHAR(255),
  payee_account VARCHAR(100),
  
  -- Comprovativo
  proof_document_id UUID REFERENCES "Document"(id) ON DELETE SET NULL,
  
  -- Reconciliação
  reconciled BOOLEAN DEFAULT false,
  reconciled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reconciled_at TIMESTAMPTZ,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_tenant ON "Payment"(tenant_id);
CREATE INDEX idx_payment_case ON "Payment"(case_id);
CREATE INDEX idx_payment_type ON "Payment"(type);
CREATE INDEX idx_payment_status ON "Payment"(status);
CREATE INDEX idx_payment_due_date ON "Payment"(due_date);
CREATE INDEX idx_payment_reference ON "Payment"(payment_reference);

COMMENT ON TABLE "Payment" IS 'Pagamentos (ISV, IVA, IUC, taxas)';
COMMENT ON COLUMN "Payment".payment_reference IS 'Referência MB, NIB, etc.';

-- ============================================================================
-- FUNÇÃO: Calcular ISV (simplificado)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_isv(
  p_engine_capacity INTEGER,
  p_co2_emissions INTEGER,
  p_vehicle_age_months INTEGER,
  p_vehicle_value DECIMAL
) RETURNS TABLE (
  isv_cilindrada DECIMAL,
  isv_co2 DECIMAL,
  isv_total DECIMAL,
  reduction_percentage DECIMAL,
  final_isv DECIMAL
) AS $$
DECLARE
  v_isv_cil DECIMAL := 0;
  v_isv_co2 DECIMAL := 0;
  v_reduction DECIMAL := 0;
  v_total DECIMAL := 0;
  v_final DECIMAL := 0;
BEGIN
  -- Componente Cilindrada (simplificado)
  CASE
    WHEN p_engine_capacity <= 1000 THEN v_isv_cil := p_engine_capacity * 0.60;
    WHEN p_engine_capacity <= 1250 THEN v_isv_cil := p_engine_capacity * 1.00;
    WHEN p_engine_capacity <= 1750 THEN v_isv_cil := p_engine_capacity * 1.69;
    WHEN p_engine_capacity <= 2500 THEN v_isv_cil := p_engine_capacity * 3.25;
    WHEN p_engine_capacity <= 3500 THEN v_isv_cil := p_engine_capacity * 6.25;
    ELSE v_isv_cil := p_engine_capacity * 28.15;
  END CASE;
  
  -- Componente CO2 (simplificado)
  CASE
    WHEN p_co2_emissions <= 50 THEN v_isv_co2 := 0;
    WHEN p_co2_emissions <= 120 THEN v_isv_co2 := p_co2_emissions * 11.17;
    WHEN p_co2_emissions <= 160 THEN v_isv_co2 := p_co2_emissions * 44.61;
    WHEN p_co2_emissions <= 200 THEN v_isv_co2 := p_co2_emissions * 84.24;
    ELSE v_isv_co2 := p_co2_emissions * 181.01;
  END CASE;
  
  v_total := v_isv_cil + v_isv_co2;
  
  -- Redução por antiguidade (1% por mês até 50%)
  v_reduction := LEAST(p_vehicle_age_months * 1.0, 50.0);
  v_final := v_total * (1 - v_reduction / 100.0);
  
  RETURN QUERY SELECT v_isv_cil, v_isv_co2, v_total, v_reduction, v_final;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_isv IS 'Cálculo simplificado de ISV (usar Edge Function para lógica completa)';

-- ============================================================================
-- TRIGGER: updated_at
-- ============================================================================

CREATE TRIGGER set_tax_table_updated_at
BEFORE UPDATE ON "TaxTable"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_tax_estimation_updated_at
BEFORE UPDATE ON "TaxEstimation"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_payment_updated_at
BEFORE UPDATE ON "Payment"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();



