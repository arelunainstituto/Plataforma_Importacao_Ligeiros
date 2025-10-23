import { z } from "zod";
import { UserRoleSchema } from "./enums";

// ============================================================================
// TENANT
// ============================================================================

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  nif: z.string().regex(/^\d{9}$/, "NIF deve ter 9 dígitos"),
  address: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  logo_url: z.string().url().optional(),
  settings: z.record(z.any()).optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export const CreateTenantSchema = TenantSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateTenant = z.infer<typeof CreateTenantSchema>;

export const UpdateTenantSchema = CreateTenantSchema.partial();

export type UpdateTenant = z.infer<typeof UpdateTenantSchema>;

// ============================================================================
// TENANT USER (associação User ↔ Tenant)
// ============================================================================

export const TenantUserSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: UserRoleSchema,
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TenantUser = z.infer<typeof TenantUserSchema>;

export const CreateTenantUserSchema = z.object({
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: UserRoleSchema,
});

export type CreateTenantUser = z.infer<typeof CreateTenantUserSchema>;

// ============================================================================
// USER PROFILE (dados estendidos do auth.users)
// ============================================================================

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  phone: z.string().optional(),
  // Dados do TenantUser
  tenants: z
    .array(
      z.object({
        tenant_id: z.string().uuid(),
        tenant_name: z.string(),
        role: UserRoleSchema,
      })
    )
    .optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;



