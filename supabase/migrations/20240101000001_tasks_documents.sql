-- Migration: Tarefas e Documentos
-- Data: 2024-01-01
-- Descrição: Gestão de tarefas operacionais e documentos

-- ============================================================================
-- TABELA: CaseTask (Tarefas)
-- ============================================================================

CREATE TABLE "CaseTask" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES "ImportCase"(id) ON DELETE CASCADE,
  
  type task_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'PENDING',
  priority INTEGER DEFAULT 3, -- 1=highest, 5=lowest
  
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  due_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Dependências
  depends_on UUID REFERENCES "CaseTask"(id) ON DELETE SET NULL,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_tenant ON "CaseTask"(tenant_id);
CREATE INDEX idx_task_case ON "CaseTask"(case_id);
CREATE INDEX idx_task_status ON "CaseTask"(status);
CREATE INDEX idx_task_assigned ON "CaseTask"(assigned_to);
CREATE INDEX idx_task_due_date ON "CaseTask"(due_date);
CREATE INDEX idx_task_type ON "CaseTask"(type);

COMMENT ON TABLE "CaseTask" IS 'Tarefas operacionais por processo';

-- ============================================================================
-- TRIGGER: Auto-atualizar status para OVERDUE
-- ============================================================================

CREATE OR REPLACE FUNCTION check_task_overdue()
RETURNS void AS $$
BEGIN
  UPDATE "CaseTask"
  SET status = 'OVERDUE'
  WHERE status IN ('PENDING', 'IN_PROGRESS')
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Este pode ser executado via cron job ou Edge Function

-- ============================================================================
-- TABELA: Document (Documentos)
-- ============================================================================

CREATE TABLE "Document" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES "ImportCase"(id) ON DELETE CASCADE,
  
  type document_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status document_status NOT NULL DEFAULT 'PENDING_UPLOAD',
  
  -- Storage
  storage_bucket VARCHAR(100) DEFAULT 'documents',
  storage_key TEXT, -- Path no bucket Supabase Storage
  file_size INTEGER, -- bytes
  mime_type VARCHAR(100),
  
  -- Metadados do ficheiro
  original_filename VARCHAR(255),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ,
  
  -- Verificação
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Expiração (e.g., inspecção válida por 30 dias)
  expires_at TIMESTAMPTZ,
  
  -- OCR / Extração de dados
  ocr_text TEXT,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_tenant ON "Document"(tenant_id);
CREATE INDEX idx_document_case ON "Document"(case_id);
CREATE INDEX idx_document_type ON "Document"(type);
CREATE INDEX idx_document_status ON "Document"(status);
CREATE INDEX idx_document_expires ON "Document"(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_document_storage ON "Document"(storage_bucket, storage_key);

COMMENT ON TABLE "Document" IS 'Documentos associados aos processos';
COMMENT ON COLUMN "Document".storage_key IS 'Chave no Supabase Storage (e.g., tenant_id/case_id/filename)';
COMMENT ON COLUMN "Document".ocr_text IS 'Texto extraído por OCR para pesquisa';

-- ============================================================================
-- TABELA: Appointment (Agendamentos)
-- ============================================================================

CREATE TABLE "Appointment" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES "ImportCase"(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL, -- 'INSPECTION_B', 'IMT', 'CUSTOMS', 'CLIENT_MEETING'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  location VARCHAR(255),
  address TEXT,
  
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  
  -- Participantes
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_notified BOOLEAN DEFAULT false,
  
  -- Estado
  status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
  completed_at TIMESTAMPTZ,
  notes TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointment_tenant ON "Appointment"(tenant_id);
CREATE INDEX idx_appointment_case ON "Appointment"(case_id);
CREATE INDEX idx_appointment_scheduled ON "Appointment"(scheduled_at);
CREATE INDEX idx_appointment_assigned ON "Appointment"(assigned_to);
CREATE INDEX idx_appointment_status ON "Appointment"(status);

COMMENT ON TABLE "Appointment" IS 'Agendamentos (inspeções, IMT, alfândega)';

-- ============================================================================
-- TRIGGER: updated_at
-- ============================================================================

CREATE TRIGGER set_case_task_updated_at
BEFORE UPDATE ON "CaseTask"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_document_updated_at
BEFORE UPDATE ON "Document"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_appointment_updated_at
BEFORE UPDATE ON "Appointment"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();



