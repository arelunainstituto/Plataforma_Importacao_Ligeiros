import { z } from "zod";
import { TaskTypeSchema, TaskStatusSchema } from "./enums";

// ============================================================================
// CASE TASK
// ============================================================================

export const CaseTaskSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_id: z.string().uuid(),

  type: TaskTypeSchema,
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional().nullable(),
  status: TaskStatusSchema,
  priority: z.number().int().min(1).max(5).default(3),

  assigned_to: z.string().uuid().optional().nullable(),

  due_date: z.string().optional().nullable(),
  started_at: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),

  depends_on: z.string().uuid().optional().nullable(),

  metadata: z.record(z.any()).optional(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type CaseTask = z.infer<typeof CaseTaskSchema>;

export const CreateCaseTaskSchema = z.object({
  case_id: z.string().uuid(),
  type: TaskTypeSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  status: TaskStatusSchema.default("PENDING"),
  priority: z.number().int().min(1).max(5).default(3),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().optional(),
  depends_on: z.string().uuid().optional(),
});

export type CreateCaseTask = z.infer<typeof CreateCaseTaskSchema>;

export const UpdateCaseTaskSchema = CreateCaseTaskSchema.partial().extend({
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
});

export type UpdateCaseTask = z.infer<typeof UpdateCaseTaskSchema>;

// ============================================================================
// APPOINTMENT
// ============================================================================

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_id: z.string().uuid(),

  type: z.string(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),

  location: z.string().optional().nullable(),
  address: z.string().optional().nullable(),

  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().int().positive().default(60),

  assigned_to: z.string().uuid().optional().nullable(),
  customer_notified: z.boolean().default(false),

  status: z.string().default("SCHEDULED"),
  completed_at: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),

  metadata: z.record(z.any()).optional(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

export const CreateAppointmentSchema = z.object({
  case_id: z.string().uuid(),
  type: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().int().positive().default(60),
  assigned_to: z.string().uuid().optional(),
});

export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial().extend({
  status: z.string().optional(),
  completed_at: z.string().datetime().optional(),
  customer_notified: z.boolean().optional(),
  notes: z.string().optional(),
});

export type UpdateAppointment = z.infer<typeof UpdateAppointmentSchema>;



