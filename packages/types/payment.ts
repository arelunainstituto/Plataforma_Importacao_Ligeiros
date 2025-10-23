import { z } from "zod";
import { PaymentTypeSchema, PaymentStatusSchema } from "./enums";

// ============================================================================
// PAYMENT
// ============================================================================

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_id: z.string().uuid(),

  type: PaymentTypeSchema,
  status: PaymentStatusSchema,

  amount: z.number().positive(),
  currency: z.string().length(3).default("EUR"),

  // Referências
  payment_reference: z.string().optional().nullable(),
  payment_method: z.string().optional().nullable(),

  // Datas
  due_date: z.string().optional().nullable(),
  paid_at: z.string().datetime().optional().nullable(),

  // Entidade destinatária
  payee_name: z.string().optional().nullable(),
  payee_account: z.string().optional().nullable(),

  // Comprovativo
  proof_document_id: z.string().uuid().optional().nullable(),

  // Reconciliação
  reconciled: z.boolean().default(false),
  reconciled_by: z.string().uuid().optional().nullable(),
  reconciled_at: z.string().datetime().optional().nullable(),

  notes: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const CreatePaymentSchema = z.object({
  case_id: z.string().uuid(),
  type: PaymentTypeSchema,
  amount: z.number().positive(),
  currency: z.string().length(3).default("EUR"),
  payment_reference: z.string().optional(),
  payment_method: z.string().optional(),
  due_date: z.string().optional(),
  payee_name: z.string().optional(),
  payee_account: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePayment = z.infer<typeof CreatePaymentSchema>;

export const UpdatePaymentSchema = CreatePaymentSchema.partial().extend({
  status: PaymentStatusSchema.optional(),
  paid_at: z.string().datetime().optional(),
  proof_document_id: z.string().uuid().optional(),
  reconciled: z.boolean().optional(),
  reconciled_by: z.string().uuid().optional(),
  reconciled_at: z.string().datetime().optional(),
});

export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>;

// ============================================================================
// PAYMENT SUMMARY (por processo)
// ============================================================================

export const PaymentSummarySchema = z.object({
  case_id: z.string().uuid(),
  total_amount: z.number(),
  paid_amount: z.number(),
  pending_amount: z.number(),
  overdue_amount: z.number(),
  payments: z.array(PaymentSchema),
});

export type PaymentSummary = z.infer<typeof PaymentSummarySchema>;



