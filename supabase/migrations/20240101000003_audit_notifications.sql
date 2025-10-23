-- Migration: Auditoria e Notificações
-- Data: 2024-01-01
-- Descrição: Sistema de auditoria completo e notificações

-- ============================================================================
-- TABELA: AuditLog (Auditoria)
-- ============================================================================

CREATE TABLE "AuditLog" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
  
  -- Actor
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  user_role user_role,
  
  -- Ação
  action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', etc.
  entity_type VARCHAR(100) NOT NULL, -- 'ImportCase', 'Document', 'Payment', etc.
  entity_id UUID,
  
  -- Contexto
  case_id UUID REFERENCES "ImportCase"(id) ON DELETE SET NULL,
  
  -- Alterações (para UPDATE)
  old_values JSONB,
  new_values JSONB,
  diff JSONB, -- Diferenças calculadas
  
  -- Metadados da requisição
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,
  request_method VARCHAR(10),
  
  -- Observações
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON "AuditLog"(tenant_id);
CREATE INDEX idx_audit_user ON "AuditLog"(user_id);
CREATE INDEX idx_audit_entity ON "AuditLog"(entity_type, entity_id);
CREATE INDEX idx_audit_case ON "AuditLog"(case_id);
CREATE INDEX idx_audit_action ON "AuditLog"(action);
CREATE INDEX idx_audit_created ON "AuditLog"(created_at DESC);

COMMENT ON TABLE "AuditLog" IS 'Registo completo de auditoria (imutável)';
COMMENT ON COLUMN "AuditLog".diff IS 'JSON com apenas os campos alterados';

-- ============================================================================
-- FUNÇÃO: Criar registo de auditoria
-- ============================================================================

CREATE OR REPLACE FUNCTION create_audit_log(
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
  v_audit_id UUID;
BEGIN
  -- Obter user_id do contexto Supabase
  v_user_id := auth.uid();
  
  -- Obter tenant_id do utilizador (primeira associação)
  SELECT tenant_id INTO v_tenant_id
  FROM "TenantUser"
  WHERE user_id = v_user_id
  LIMIT 1;
  
  INSERT INTO "AuditLog" (
    tenant_id, user_id, action, entity_type, entity_id,
    old_values, new_values
  ) VALUES (
    v_tenant_id, v_user_id, p_action, p_entity_type, p_entity_id,
    p_old_values, p_new_values
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TABELA: Notification (Notificações)
-- ============================================================================

CREATE TABLE "Notification" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  
  -- Destinatário
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo e canal
  type notification_type NOT NULL,
  priority notification_priority DEFAULT 'MEDIUM',
  
  -- Conteúdo
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Contexto
  case_id UUID REFERENCES "ImportCase"(id) ON DELETE CASCADE,
  entity_type VARCHAR(100),
  entity_id UUID,
  
  -- Link de ação
  action_url TEXT,
  action_label VARCHAR(100),
  
  -- Estado
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Envio (para EMAIL/SMS)
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  delivery_status VARCHAR(50),
  delivery_error TEXT,
  
  -- Agendamento
  scheduled_for TIMESTAMPTZ,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_notification_tenant ON "Notification"(tenant_id);
CREATE INDEX idx_notification_user ON "Notification"(user_id);
CREATE INDEX idx_notification_case ON "Notification"(case_id);
CREATE INDEX idx_notification_read ON "Notification"(is_read);
CREATE INDEX idx_notification_type ON "Notification"(type);
CREATE INDEX idx_notification_priority ON "Notification"(priority);
CREATE INDEX idx_notification_created ON "Notification"(created_at DESC);
CREATE INDEX idx_notification_scheduled ON "Notification"(scheduled_for) WHERE scheduled_for IS NOT NULL;

COMMENT ON TABLE "Notification" IS 'Notificações multi-canal (in-app, email, SMS)';

-- ============================================================================
-- TABELA: CaseNote (Notas/Comentários)
-- ============================================================================

CREATE TABLE "CaseNote" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES "ImportCase"(id) ON DELETE CASCADE,
  
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Visível apenas para equipa
  is_pinned BOOLEAN DEFAULT false,
  
  -- Anexos
  attachments JSONB DEFAULT '[]'::jsonb, -- Array de document_ids
  
  -- Menções (@user)
  mentions UUID[], -- Array de user_ids mencionados
  
  edited_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_note_tenant ON "CaseNote"(tenant_id);
CREATE INDEX idx_case_note_case ON "CaseNote"(case_id);
CREATE INDEX idx_case_note_author ON "CaseNote"(author_id);
CREATE INDEX idx_case_note_created ON "CaseNote"(created_at DESC);
CREATE INDEX idx_case_note_pinned ON "CaseNote"(is_pinned) WHERE is_pinned = true;

COMMENT ON TABLE "CaseNote" IS 'Notas e comentários sobre processos';

-- ============================================================================
-- TABELA: IntegrationEvent (Eventos de Integração)
-- ============================================================================

CREATE TABLE "IntegrationEvent" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  case_id UUID REFERENCES "ImportCase"(id) ON DELETE CASCADE,
  
  -- Integração
  service_name VARCHAR(100) NOT NULL, -- 'IMT', 'CUSTOMS', 'VIN_DECODER', 'EMAIL', 'SMS'
  event_type VARCHAR(100) NOT NULL, -- 'REQUEST', 'RESPONSE', 'ERROR', 'WEBHOOK'
  
  -- Request
  request_method VARCHAR(10),
  request_url TEXT,
  request_headers JSONB,
  request_body JSONB,
  
  -- Response
  response_status INTEGER,
  response_headers JSONB,
  response_body JSONB,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Estado
  success BOOLEAN,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_integration_tenant ON "IntegrationEvent"(tenant_id);
CREATE INDEX idx_integration_case ON "IntegrationEvent"(case_id);
CREATE INDEX idx_integration_service ON "IntegrationEvent"(service_name);
CREATE INDEX idx_integration_type ON "IntegrationEvent"(event_type);
CREATE INDEX idx_integration_success ON "IntegrationEvent"(success);
CREATE INDEX idx_integration_created ON "IntegrationEvent"(created_at DESC);

COMMENT ON TABLE "IntegrationEvent" IS 'Log de integrações externas (IMT, Alfândega, APIs)';

-- ============================================================================
-- TRIGGER: updated_at
-- ============================================================================

CREATE TRIGGER set_case_note_updated_at
BEFORE UPDATE ON "CaseNote"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEW: Dashboard Stats
-- ============================================================================

CREATE OR REPLACE VIEW "DashboardStats" AS
SELECT
  t.id AS tenant_id,
  COUNT(DISTINCT c.id) AS total_cases,
  COUNT(DISTINCT CASE WHEN c.status IN ('INTAKE', 'DOCS_PENDING') THEN c.id END) AS cases_in_intake,
  COUNT(DISTINCT CASE WHEN c.status = 'COMPLETED' THEN c.id END) AS cases_completed,
  COUNT(DISTINCT CASE WHEN c.status = 'ON_HOLD' THEN c.id END) AS cases_on_hold,
  COUNT(DISTINCT ct.id) AS total_tasks,
  COUNT(DISTINCT CASE WHEN ct.status = 'OVERDUE' THEN ct.id END) AS tasks_overdue,
  COUNT(DISTINCT CASE WHEN ct.status = 'PENDING' THEN ct.id END) AS tasks_pending,
  COUNT(DISTINCT cu.id) AS total_customers,
  COUNT(DISTINCT v.id) AS total_vehicles,
  COALESCE(SUM(te.total_estimated_cost), 0) AS total_estimated_revenue
FROM "Tenant" t
LEFT JOIN "ImportCase" c ON c.tenant_id = t.id
LEFT JOIN "CaseTask" ct ON ct.tenant_id = t.id
LEFT JOIN "Customer" cu ON cu.tenant_id = t.id
LEFT JOIN "Vehicle" v ON v.tenant_id = t.id
LEFT JOIN "TaxEstimation" te ON te.tenant_id = t.id AND te.is_final = true
GROUP BY t.id;

COMMENT ON VIEW "DashboardStats" IS 'Estatísticas agregadas para dashboard';



