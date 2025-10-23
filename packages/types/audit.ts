import { z } from "zod";
import { UserRoleSchema } from "./enums";

// ============================================================================
// AUDIT LOG
// ============================================================================

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid().optional().nullable(),

  // Actor
  user_id: z.string().uuid().optional().nullable(),
  user_email: z.string().email().optional().nullable(),
  user_role: UserRoleSchema.optional().nullable(),

  // Ação
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string().uuid().optional().nullable(),

  // Contexto
  case_id: z.string().uuid().optional().nullable(),

  // Alterações
  old_values: z.record(z.any()).optional().nullable(),
  new_values: z.record(z.any()).optional().nullable(),
  diff: z.record(z.any()).optional().nullable(),

  // Metadados da requisição
  ip_address: z.string().optional().nullable(),
  user_agent: z.string().optional().nullable(),
  request_path: z.string().optional().nullable(),
  request_method: z.string().optional().nullable(),

  notes: z.string().optional().nullable(),

  created_at: z.string().datetime(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const CreateAuditLogSchema = z.object({
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string().uuid().optional(),
  case_id: z.string().uuid().optional(),
  old_values: z.record(z.any()).optional(),
  new_values: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>;

// ============================================================================
// INTEGRATION EVENT
// ============================================================================

export const IntegrationEventSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_id: z.string().uuid().optional().nullable(),

  // Integração
  service_name: z.string(),
  event_type: z.string(),

  // Request
  request_method: z.string().optional().nullable(),
  request_url: z.string().optional().nullable(),
  request_headers: z.record(z.any()).optional().nullable(),
  request_body: z.record(z.any()).optional().nullable(),

  // Response
  response_status: z.number().int().optional().nullable(),
  response_headers: z.record(z.any()).optional().nullable(),
  response_body: z.record(z.any()).optional().nullable(),

  // Timing
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional().nullable(),
  duration_ms: z.number().int().optional().nullable(),

  // Estado
  success: z.boolean().optional().nullable(),
  error_message: z.string().optional().nullable(),
  retry_count: z.number().int().default(0),

  // Metadados
  metadata: z.record(z.any()).optional(),

  created_at: z.string().datetime(),
});

export type IntegrationEvent = z.infer<typeof IntegrationEventSchema>;

export const CreateIntegrationEventSchema = z.object({
  case_id: z.string().uuid().optional(),
  service_name: z.string(),
  event_type: z.string(),
  request_method: z.string().optional(),
  request_url: z.string().optional(),
  request_body: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateIntegrationEvent = z.infer<typeof CreateIntegrationEventSchema>;

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export const DashboardStatsSchema = z.object({
  tenant_id: z.string().uuid(),
  total_cases: z.number().int(),
  cases_in_intake: z.number().int(),
  cases_completed: z.number().int(),
  cases_on_hold: z.number().int(),
  total_tasks: z.number().int(),
  tasks_overdue: z.number().int(),
  tasks_pending: z.number().int(),
  total_customers: z.number().int(),
  total_vehicles: z.number().int(),
  total_estimated_revenue: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;



