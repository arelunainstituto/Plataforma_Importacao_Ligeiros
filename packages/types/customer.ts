import { z } from "zod";
import { PersonTypeSchema } from "./enums";

// ============================================================================
// CUSTOMER
// ============================================================================

export const CustomerSchema = z
  .object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    type: PersonTypeSchema,

    // Pessoa singular
    first_name: z.string().optional(),
    last_name: z.string().optional(),

    // Pessoa coletiva
    company_name: z.string().optional(),

    nif: z.string().regex(/^\d{9}$/, "NIF deve ter 9 dígitos"),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),

    address: z.string().optional(),
    postal_code: z.string().optional(),
    city: z.string().optional(),
    country: z.string().length(2).default("PT"),

    notes: z.string().optional(),
    metadata: z.record(z.any()).optional(),

    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  .refine(
    (data) => {
      if (data.type === "INDIVIDUAL") {
        return data.first_name && data.last_name;
      }
      if (data.type === "COMPANY") {
        return data.company_name;
      }
      return true;
    },
    {
      message: "Nome completo obrigatório para pessoas singulares, ou nome da empresa para pessoas coletivas",
    }
  );

export type Customer = z.infer<typeof CustomerSchema>;

export const CreateCustomerSchema = CustomerSchema.omit({
  id: true,
  tenant_id: true,
  created_at: true,
  updated_at: true,
});

export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = CreateCustomerSchema.partial().extend({
  nif: z.string().regex(/^\d{9}$/).optional(),
});

export type UpdateCustomer = z.infer<typeof UpdateCustomerSchema>;

// ============================================================================
// HELPERS
// ============================================================================

export function getCustomerDisplayName(customer: Customer): string {
  if (customer.type === "COMPANY") {
    return customer.company_name || "Empresa sem nome";
  }
  return `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Cliente sem nome";
}



