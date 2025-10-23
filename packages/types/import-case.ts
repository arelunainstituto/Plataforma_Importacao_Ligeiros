import { z } from "zod";
import { CaseStatusSchema } from "./enums";
import { CustomerSchema } from "./customer";
import { VehicleSchema } from "./vehicle";

// ============================================================================
// IMPORT CASE
// ============================================================================

export const ImportCaseSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_number: z.string(),

  customer_id: z.string().uuid(),
  vehicle_id: z.string().uuid(),

  status: CaseStatusSchema,
  assigned_to: z.string().uuid().optional().nullable(),

  // Datas
  intake_date: z.string().datetime(),
  target_completion_date: z.string().optional().nullable(),
  actual_completion_date: z.string().datetime().optional().nullable(),

  // Valores financeiros
  purchase_price: z.number().positive().optional().nullable(),
  purchase_currency: z.string().length(3).default("EUR"),
  estimated_total_cost: z.number().positive().optional().nullable(),

  // Origem
  dealer_name: z.string().optional().nullable(),
  dealer_country: z.string().length(2).optional().nullable(),
  purchase_date: z.string().optional().nullable(),

  // Observações
  notes: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),

  // Metadados
  metadata: z.record(z.any()).optional(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ImportCase = z.infer<typeof ImportCaseSchema>;

// Com relações expandidas
export const ImportCaseWithRelationsSchema = ImportCaseSchema.extend({
  customer: CustomerSchema.optional(),
  vehicle: VehicleSchema.optional(),
  assigned_user: z
    .object({
      id: z.string().uuid(),
      email: z.string().email(),
      full_name: z.string().optional(),
    })
    .optional(),
});

export type ImportCaseWithRelations = z.infer<typeof ImportCaseWithRelationsSchema>;

export const CreateImportCaseSchema = z.object({
  customer_id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  status: CaseStatusSchema.default("INTAKE"),
  assigned_to: z.string().uuid().optional(),
  target_completion_date: z.string().optional(),
  purchase_price: z.number().positive().optional(),
  purchase_currency: z.string().length(3).default("EUR"),
  dealer_name: z.string().optional(),
  dealer_country: z.string().length(2).optional(),
  purchase_date: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateImportCase = z.infer<typeof CreateImportCaseSchema>;

export const UpdateImportCaseSchema = CreateImportCaseSchema.partial().extend({
  status: CaseStatusSchema.optional(),
  actual_completion_date: z.string().datetime().optional(),
  estimated_total_cost: z.number().positive().optional(),
  internal_notes: z.string().optional(),
});

export type UpdateImportCase = z.infer<typeof UpdateImportCaseSchema>;

// ============================================================================
// CASE FILTERS
// ============================================================================

export const ImportCaseFiltersSchema = z.object({
  status: CaseStatusSchema.array().optional(),
  assigned_to: z.string().uuid().array().optional(),
  customer_id: z.string().uuid().optional(),
  search: z.string().optional(), // Pesquisa em case_number, cliente, veículo
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  dealer_country: z.string().length(2).array().optional(),
});

export type ImportCaseFilters = z.infer<typeof ImportCaseFiltersSchema>;

// ============================================================================
// CASE NOTE
// ============================================================================

export const CaseNoteSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_id: z.string().uuid(),
  author_id: z.string().uuid(),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  is_internal: z.boolean().default(false),
  is_pinned: z.boolean().default(false),
  attachments: z.array(z.string().uuid()).optional(),
  mentions: z.array(z.string().uuid()).optional(),
  edited_at: z.string().datetime().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type CaseNote = z.infer<typeof CaseNoteSchema>;

export const CreateCaseNoteSchema = z.object({
  case_id: z.string().uuid(),
  content: z.string().min(1),
  is_internal: z.boolean().default(false),
  is_pinned: z.boolean().default(false),
  attachments: z.array(z.string().uuid()).optional(),
  mentions: z.array(z.string().uuid()).optional(),
});

export type CreateCaseNote = z.infer<typeof CreateCaseNoteSchema>;



