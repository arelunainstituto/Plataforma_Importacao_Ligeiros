import { z } from "zod";
import { VehicleCategorySchema, FuelTypeSchema } from "./enums";

// ============================================================================
// VEHICLE
// ============================================================================

export const VehicleSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),

  // Identificação
  vin: z.string().length(17, "VIN deve ter 17 caracteres"),
  make: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  variant: z.string().optional(),
  version: z.string().optional(),

  // Características técnicas
  first_registration_date: z.string().optional(), // ISO date
  manufacture_year: z.number().int().min(1900).max(2100).optional(),
  category: VehicleCategorySchema.default("M1"),
  fuel_type: FuelTypeSchema,
  engine_capacity: z.number().int().positive("Cilindrada deve ser positiva").optional(),
  power_kw: z.number().positive().optional(),
  power_hp: z.number().positive().optional(),
  co2_emissions: z.number().int().min(0, "CO₂ não pode ser negativo").optional(),
  euro_emission_standard: z.string().optional(),

  // Dimensões e peso
  weight_empty: z.number().int().positive().optional(),
  weight_gross: z.number().int().positive().optional(),
  seats: z.number().int().positive().optional(),
  doors: z.number().int().positive().optional(),

  // Cor
  color: z.string().optional(),
  color_code: z.string().optional(),

  // Dados de origem
  origin_country: z.string().length(2).optional(),
  origin_registration: z.string().optional(),

  // Metadados
  metadata: z.record(z.any()).optional(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;

export const CreateVehicleSchema = VehicleSchema.omit({
  id: true,
  tenant_id: true,
  created_at: true,
  updated_at: true,
});

export type CreateVehicle = z.infer<typeof CreateVehicleSchema>;

export const UpdateVehicleSchema = CreateVehicleSchema.partial().extend({
  vin: z.string().length(17).optional(),
});

export type UpdateVehicle = z.infer<typeof UpdateVehicleSchema>;

// ============================================================================
// VIN DECODE RESPONSE
// ============================================================================

export const VINDecodeResponseSchema = z.object({
  vin: z.string(),
  make: z.string(),
  model: z.string(),
  variant: z.string().optional(),
  manufacturerYear: z.number().optional(),
  firstRegistrationDate: z.string().optional(),
  category: VehicleCategorySchema.optional(),
  fuelType: FuelTypeSchema,
  engineCapacity: z.number().optional(),
  powerKw: z.number().optional(),
  powerHp: z.number().optional(),
  co2Emissions: z.number().optional(),
  euroEmissionStandard: z.string().optional(),
  weightEmpty: z.number().optional(),
  weightGross: z.number().optional(),
  seats: z.number().optional(),
  doors: z.number().optional(),
  color: z.string().optional(),
  originCountry: z.string().optional(),
});

export type VINDecodeResponse = z.infer<typeof VINDecodeResponseSchema>;

// ============================================================================
// HELPERS
// ============================================================================

export function getVehicleDisplayName(vehicle: Vehicle): string {
  const parts = [vehicle.make, vehicle.model, vehicle.variant, vehicle.version].filter(Boolean);
  return parts.join(" ");
}

export function calculateVehicleAge(firstRegistrationDate?: string): number {
  if (!firstRegistrationDate) return 0;

  const registrationDate = new Date(firstRegistrationDate);
  const now = new Date();

  const months =
    (now.getFullYear() - registrationDate.getFullYear()) * 12 +
    (now.getMonth() - registrationDate.getMonth());

  return Math.max(0, months);
}



