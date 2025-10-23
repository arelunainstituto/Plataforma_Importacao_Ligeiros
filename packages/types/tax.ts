import { z } from "zod";
import { TaxTableTypeSchema } from "./enums";

// ============================================================================
// TAX TABLE
// ============================================================================

export const TaxTableBracketSchema = z.object({
  min: z.number(),
  max: z.number(),
  rate: z.number(),
});

export type TaxTableBracket = z.infer<typeof TaxTableBracketSchema>;

export const TaxTableDataSchema = z.object({
  brackets: z.array(TaxTableBracketSchema),
});

export type TaxTableData = z.infer<typeof TaxTableDataSchema>;

export const TaxTableSchema = z.object({
  id: z.string(),
  type: TaxTableTypeSchema,
  version: z.string(),
  effective_date: z.string(),
  end_date: z.string().optional().nullable(),
  data: TaxTableDataSchema,
  is_active: z.boolean().default(true),
  notes: z.string().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TaxTable = z.infer<typeof TaxTableSchema>;

// ============================================================================
// TAX ESTIMATION
// ============================================================================

export const TaxEstimationSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_id: z.string().uuid(),

  // Versão de cálculo
  calculation_version: z.number().int().default(1),
  calculated_at: z.string().datetime(),
  calculated_by: z.string().uuid().optional().nullable(),

  // Base de cálculo
  vehicle_value: z.number().positive(),
  vehicle_age_months: z.number().int().min(0).optional().nullable(),
  depreciation_rate: z.number().min(0).max(100).optional().nullable(),
  depreciated_value: z.number().positive().optional().nullable(),

  // ISV
  isv_cilindrada: z.number().min(0).default(0),
  isv_co2: z.number().min(0).default(0),
  isv_total: z.number().min(0),
  isv_reduction_percentage: z.number().min(0).max(100).default(0),
  isv_table_version: z.string().optional().nullable(),

  // IVA
  iva_rate: z.number().min(0).max(100).optional().nullable(),
  iva_base: z.number().min(0).optional().nullable(),
  iva_amount: z.number().min(0).default(0),
  iva_notes: z.string().optional().nullable(),

  // IUC
  iuc_estimated: z.number().min(0).default(0),

  // Total
  total_estimated_cost: z.number().positive(),

  // Detalhes do cálculo
  calculation_details: z.record(z.any()).optional(),

  // Estado
  is_final: z.boolean().default(false),
  approved_by: z.string().uuid().optional().nullable(),
  approved_at: z.string().datetime().optional().nullable(),

  notes: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TaxEstimation = z.infer<typeof TaxEstimationSchema>;

export const CreateTaxEstimationSchema = z.object({
  case_id: z.string().uuid(),
  vehicle_value: z.number().positive(),
  vehicle_age_months: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export type CreateTaxEstimation = z.infer<typeof CreateTaxEstimationSchema>;

// ============================================================================
// ISV CALCULATION REQUEST
// ============================================================================

export const ISVCalculationRequestSchema = z.object({
  caseId: z.string().uuid(),
  engineCapacity: z.number().int().positive(),
  co2Emissions: z.number().int().min(0),
  vehicleAgeMonths: z.number().int().min(0),
  vehicleValue: z.number().positive(),
  fuelType: z.string(),
});

export type ISVCalculationRequest = z.infer<typeof ISVCalculationRequestSchema>;

export const ISVCalculationResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      estimationId: z.string().uuid(),
      isvCilindrada: z.number(),
      isvCo2: z.number(),
      isvTotal: z.number(),
      reductionPercentage: z.number(),
      isvFinal: z.number(),
      ivaAmount: z.number(),
      iucEstimated: z.number(),
      totalEstimatedCost: z.number(),
    })
    .optional(),
  error: z.string().optional(),
});

export type ISVCalculationResponse = z.infer<typeof ISVCalculationResponseSchema>;



