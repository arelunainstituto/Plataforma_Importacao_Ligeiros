import { z } from "zod";
import { NotificationTypeSchema, NotificationPrioritySchema } from "./enums";

// ============================================================================
// NOTIFICATION
// ============================================================================

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),

  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,

  title: z.string().min(1),
  message: z.string().min(1),

  // Contexto
  case_id: z.string().uuid().optional().nullable(),
  entity_type: z.string().optional().nullable(),
  entity_id: z.string().uuid().optional().nullable(),

  // Link de ação
  action_url: z.string().optional().nullable(),
  action_label: z.string().optional().nullable(),

  // Estado
  is_read: z.boolean().default(false),
  read_at: z.string().datetime().optional().nullable(),

  // Envio
  sent: z.boolean().default(false),
  sent_at: z.string().datetime().optional().nullable(),
  delivery_status: z.string().optional().nullable(),
  delivery_error: z.string().optional().nullable(),

  // Agendamento
  scheduled_for: z.string().datetime().optional().nullable(),

  // Metadados
  metadata: z.record(z.any()).optional(),

  created_at: z.string().datetime(),
  expires_at: z.string().datetime().optional().nullable(),
});

export type Notification = z.infer<typeof NotificationSchema>;

export const CreateNotificationSchema = z.object({
  user_id: z.string().uuid(),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema.default("MEDIUM"),
  title: z.string().min(1),
  message: z.string().min(1),
  case_id: z.string().uuid().optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  action_url: z.string().optional(),
  action_label: z.string().optional(),
  scheduled_for: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
});

export type CreateNotification = z.infer<typeof CreateNotificationSchema>;

export const UpdateNotificationSchema = z.object({
  is_read: z.boolean().optional(),
  read_at: z.string().datetime().optional(),
  sent: z.boolean().optional(),
  sent_at: z.string().datetime().optional(),
  delivery_status: z.string().optional(),
  delivery_error: z.string().optional(),
});

export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>;

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export const NotificationPreferencesSchema = z.object({
  user_id: z.string().uuid(),
  email_enabled: z.boolean().default(true),
  sms_enabled: z.boolean().default(false),
  push_enabled: z.boolean().default(true),
  in_app_enabled: z.boolean().default(true),
  
  // Por tipo de evento
  case_status_change: z.boolean().default(true),
  task_assigned: z.boolean().default(true),
  task_due_soon: z.boolean().default(true),
  task_overdue: z.boolean().default(true),
  document_uploaded: z.boolean().default(true),
  document_verified: z.boolean().default(true),
  payment_due: z.boolean().default(true),
  payment_completed: z.boolean().default(true),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;



