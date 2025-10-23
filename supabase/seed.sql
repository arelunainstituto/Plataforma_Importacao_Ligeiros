-- Seed data para desenvolvimento
-- Este ficheiro é executado após as migrations

-- Inserir tenant exemplo
INSERT INTO public."Tenant" (id, name, nif, address, email, phone, settings, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'TRAe Projects', '123456789', 'Lisboa, Portugal', 'info@traeprojects.com', '+351912345678', '{"fiscalSettings": {"isvVersion": "2024", "ivaRate": 23}}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Nota: Users são criados via Supabase Auth
-- Após criar user via auth, executar:
-- INSERT INTO public."TenantUser" para associar ao tenant

-- Inserir tabelas fiscais de exemplo (ISV 2024)
INSERT INTO public."TaxTable" (id, type, version, effective_date, data, created_at)
VALUES
  ('tax-isv-2024', 'ISV_CILINDRADA', '2024', '2024-01-01', 
   '{"brackets": [
     {"min": 0, "max": 1000, "rate": 0.60},
     {"min": 1001, "max": 1250, "rate": 1.00},
     {"min": 1251, "max": 1750, "rate": 1.69},
     {"min": 1751, "max": 2500, "rate": 3.25},
     {"min": 2501, "max": 3500, "rate": 6.25},
     {"min": 3501, "max": 999999, "rate": 28.15}
   ]}', NOW()),
  ('tax-isv-co2-2024', 'ISV_CO2', '2024', '2024-01-01',
   '{"brackets": [
     {"min": 0, "max": 50, "rate": 0.00},
     {"min": 51, "max": 120, "rate": 11.17},
     {"min": 121, "max": 160, "rate": 44.61},
     {"min": 161, "max": 200, "rate": 84.24},
     {"min": 201, "max": 999, "rate": 181.01}
   ]}', NOW())
ON CONFLICT (id) DO NOTHING;

-- Estados de processo
-- Já definidos via ENUM no schema

COMMENT ON TABLE public."Tenant" IS 'Seed data carregado com sucesso';



