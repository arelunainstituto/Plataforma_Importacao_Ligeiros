-- Migration: Row-Level Security (RLS) Policies
-- Data: 2024-01-01
-- Descrição: Políticas de segurança baseadas em tenant_id e user_role

-- ============================================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================================

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vehicle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ImportCase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CaseTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TaxTable" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TaxEstimation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CaseNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrationEvent" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FUNÇÃO AUXILIAR: Obter tenant_ids do utilizador
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT tenant_id
  FROM "TenantUser"
  WHERE user_id = auth.uid() AND is_active = true;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO AUXILIAR: Verificar role do utilizador
-- ============================================================================

CREATE OR REPLACE FUNCTION has_role(p_tenant_id UUID, p_roles user_role[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM "TenantUser"
    WHERE user_id = auth.uid()
      AND tenant_id = p_tenant_id
      AND role = ANY(p_roles)
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO AUXILIAR: É super admin?
-- ============================================================================

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM "TenantUser"
    WHERE user_id = auth.uid()
      AND role = 'SUPER_ADMIN'
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- POLICIES: Tenant
-- ============================================================================

CREATE POLICY "Users can view their tenants"
ON "Tenant" FOR SELECT
USING (id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "Admins can update their tenant"
ON "Tenant" FOR UPDATE
USING (
  id IN (SELECT get_user_tenant_ids()) AND
  has_role(id, ARRAY['SUPER_ADMIN', 'ADMIN']::user_role[])
);

-- ============================================================================
-- POLICIES: TenantUser
-- ============================================================================

CREATE POLICY "Users can view tenant users of their tenants"
ON "TenantUser" FOR SELECT
USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "Admins can insert tenant users"
ON "TenantUser" FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN']::user_role[])
);

CREATE POLICY "Admins can update tenant users"
ON "TenantUser" FOR UPDATE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN']::user_role[])
);

CREATE POLICY "Admins can delete tenant users"
ON "TenantUser" FOR DELETE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN']::user_role[])
);

-- ============================================================================
-- POLICIES: Customer
-- ============================================================================

CREATE POLICY "Users can view customers of their tenant"
ON "Customer" FOR SELECT
USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "Operators can insert customers"
ON "Customer" FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Operators can update customers"
ON "Customer" FOR UPDATE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Admins can delete customers"
ON "Customer" FOR DELETE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN']::user_role[])
);

-- ============================================================================
-- POLICIES: Vehicle
-- ============================================================================

CREATE POLICY "Users can view vehicles of their tenant"
ON "Vehicle" FOR SELECT
USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "Operators can insert vehicles"
ON "Vehicle" FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Operators can update vehicles"
ON "Vehicle" FOR UPDATE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Admins can delete vehicles"
ON "Vehicle" FOR DELETE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN']::user_role[])
);

-- ============================================================================
-- POLICIES: ImportCase
-- ============================================================================

CREATE POLICY "Users can view cases of their tenant"
ON "ImportCase" FOR SELECT
USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "Operators can insert cases"
ON "ImportCase" FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Operators can update cases"
ON "ImportCase" FOR UPDATE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Admins can delete cases"
ON "ImportCase" FOR DELETE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN']::user_role[])
);

-- ============================================================================
-- POLICIES: CaseTask
-- ============================================================================

CREATE POLICY "Users can view tasks of their tenant"
ON "CaseTask" FOR SELECT
USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "Operators can insert tasks"
ON "CaseTask" FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Operators can update tasks"
ON "CaseTask" FOR UPDATE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Admins can delete tasks"
ON "CaseTask" FOR DELETE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN']::user_role[])
);

-- ============================================================================
-- POLICIES: Document
-- ============================================================================

CREATE POLICY "Users can view documents of their tenant"
ON "Document" FOR SELECT
USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "Operators can insert documents"
ON "Document" FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Operators can update documents"
ON "Document" FOR UPDATE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Admins can delete documents"
ON "Document" FOR DELETE
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN']::user_role[])
);

-- ============================================================================
-- POLICIES: TaxTable (leitura pública, escrita admin)
-- ============================================================================

CREATE POLICY "Everyone can view active tax tables"
ON "TaxTable" FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage tax tables"
ON "TaxTable" FOR ALL
USING (is_super_admin());

-- ============================================================================
-- POLICIES: Payment, TaxEstimation, Appointment
-- ============================================================================

CREATE POLICY "Users can view their tenant data"
ON "Payment" FOR SELECT
USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "Operators can manage payments"
ON "Payment" FOR ALL
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Users can view tax estimations"
ON "TaxEstimation" FOR SELECT
USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "Operators can manage tax estimations"
ON "TaxEstimation" FOR ALL
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

CREATE POLICY "Users can view appointments"
ON "Appointment" FOR SELECT
USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "Operators can manage appointments"
ON "Appointment" FOR ALL
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR']::user_role[])
);

-- ============================================================================
-- POLICIES: AuditLog (apenas leitura)
-- ============================================================================

CREATE POLICY "Admins can view audit logs"
ON "AuditLog" FOR SELECT
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER']::user_role[])
);

-- ============================================================================
-- POLICIES: Notification
-- ============================================================================

CREATE POLICY "Users can view their own notifications"
ON "Notification" FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON "Notification" FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
ON "Notification" FOR INSERT
WITH CHECK (true); -- Controlado por service_role

-- ============================================================================
-- POLICIES: CaseNote
-- ============================================================================

CREATE POLICY "Users can view case notes of their tenant"
ON "CaseNote" FOR SELECT
USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "Users can insert case notes"
ON "CaseNote" FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  author_id = auth.uid()
);

CREATE POLICY "Authors can update their notes"
ON "CaseNote" FOR UPDATE
USING (author_id = auth.uid());

CREATE POLICY "Authors or admins can delete notes"
ON "CaseNote" FOR DELETE
USING (
  author_id = auth.uid() OR
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN']::user_role[])
);

-- ============================================================================
-- POLICIES: IntegrationEvent
-- ============================================================================

CREATE POLICY "Managers can view integration events"
ON "IntegrationEvent" FOR SELECT
USING (
  tenant_id IN (SELECT get_user_tenant_ids()) AND
  has_role(tenant_id, ARRAY['SUPER_ADMIN', 'ADMIN', 'MANAGER']::user_role[])
);

-- Service role pode inserir
CREATE POLICY "Service can insert integration events"
ON "IntegrationEvent" FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- STORAGE POLICIES (Buckets)
-- ============================================================================

-- Nota: Estas policies devem ser configuradas via Supabase Dashboard ou CLI
-- para os buckets 'documents' e 'exports'

-- Exemplo de policy para bucket 'documents':
-- Nome: "Tenant members can upload documents"
-- Definition: 
-- bucket_id = 'documents' AND 
-- (storage.foldername(name))[1] IN (SELECT get_user_tenant_ids()::text)

COMMENT ON FUNCTION get_user_tenant_ids IS 'Retorna tenant_ids do utilizador autenticado';
COMMENT ON FUNCTION has_role IS 'Verifica se utilizador tem role específico no tenant';
COMMENT ON FUNCTION is_super_admin IS 'Verifica se utilizador é super admin';



