import { z } from "zod";

// ============================================================================
// ENUMS - Correspondem aos ENUMS do PostgreSQL
// ============================================================================

export const UserRoleSchema = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "OPERATOR",
  "VIEWER",
  "CLIENT",
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const CaseStatusSchema = z.enum([
  "INTAKE",
  "DOCS_PENDING",
  "DOCS_VERIFICATION",
  "CUSTOMS_DECLARATION",
  "ISV_CALCULATION",
  "INSPECTION_B",
  "IMT_REGISTRATION",
  "REGISTRY",
  "PLATES_ISSUED",
  "COMPLETED",
  "ON_HOLD",
  "REJECTED",
]);

export type CaseStatus = z.infer<typeof CaseStatusSchema>;

export const TaskStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "OVERDUE",
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskTypeSchema = z.enum([
  "DOCUMENT_COLLECTION",
  "DOCUMENT_VERIFICATION",
  "CUSTOMS_DECLARATION",
  "ISV_PAYMENT",
  "INSPECTION_B_BOOKING",
  "INSPECTION_B_COMPLETION",
  "IMT_SUBMISSION",
  "IMT_APPROVAL",
  "REGISTRY_SUBMISSION",
  "PLATES_REQUEST",
  "CUSTOMER_CONTACT",
  "OTHER",
]);

export type TaskType = z.infer<typeof TaskTypeSchema>;

export const DocumentTypeSchema = z.enum([
  "INVOICE",
  "COC",
  "REGISTRATION_CERT",
  "ID_DOCUMENT",
  "NIF_DOCUMENT",
  "ADDRESS_PROOF",
  "DUA",
  "INSPECTION_CERT",
  "IMT_FORM",
  "PAYMENT_PROOF",
  "OTHER",
]);

export type DocumentType = z.infer<typeof DocumentTypeSchema>;

export const DocumentStatusSchema = z.enum([
  "PENDING_UPLOAD",
  "UPLOADED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
]);

export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

export const PaymentStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentTypeSchema = z.enum([
  "ISV",
  "IVA",
  "IUC",
  "IMT_FEE",
  "INSPECTION_FEE",
  "SERVICE_FEE",
  "OTHER",
]);

export type PaymentType = z.infer<typeof PaymentTypeSchema>;

export const NotificationTypeSchema = z.enum(["EMAIL", "SMS", "IN_APP", "PUSH"]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

export const FuelTypeSchema = z.enum([
  "GASOLINE",
  "DIESEL",
  "ELECTRIC",
  "HYBRID",
  "PLUGIN_HYBRID",
  "LPG",
  "CNG",
  "HYDROGEN",
  "OTHER",
]);

export type FuelType = z.infer<typeof FuelTypeSchema>;

export const VehicleCategorySchema = z.enum(["M1", "N1", "M2", "N2", "L", "OTHER"]);

export type VehicleCategory = z.infer<typeof VehicleCategorySchema>;

export const PersonTypeSchema = z.enum(["INDIVIDUAL", "COMPANY"]);

export type PersonType = z.infer<typeof PersonTypeSchema>;

export const TaxTableTypeSchema = z.enum([
  "ISV_CILINDRADA",
  "ISV_CO2",
  "IVA_RATES",
  "IUC_TABLE",
]);

export type TaxTableType = z.infer<typeof TaxTableTypeSchema>;

// ============================================================================
// LABELS/TRADUÇÕES
// ============================================================================

export const CaseStatusLabels: Record<CaseStatus, string> = {
  INTAKE: "Receção",
  DOCS_PENDING: "Documentos Pendentes",
  DOCS_VERIFICATION: "Verificação de Documentos",
  CUSTOMS_DECLARATION: "Declaração Alfandegária",
  ISV_CALCULATION: "Cálculo ISV",
  INSPECTION_B: "Inspeção B",
  IMT_REGISTRATION: "Registo IMT",
  REGISTRY: "Conservatória",
  PLATES_ISSUED: "Matrículas Emitidas",
  COMPLETED: "Concluído",
  ON_HOLD: "Em Espera",
  REJECTED: "Rejeitado",
};

export const TaskTypeLabels: Record<TaskType, string> = {
  DOCUMENT_COLLECTION: "Recolha de Documentos",
  DOCUMENT_VERIFICATION: "Verificação de Documentos",
  CUSTOMS_DECLARATION: "Declaração Alfandegária",
  ISV_PAYMENT: "Pagamento ISV",
  INSPECTION_B_BOOKING: "Marcação Inspeção B",
  INSPECTION_B_COMPLETION: "Conclusão Inspeção B",
  IMT_SUBMISSION: "Submissão IMT",
  IMT_APPROVAL: "Aprovação IMT",
  REGISTRY_SUBMISSION: "Submissão Conservatória",
  PLATES_REQUEST: "Pedido de Matrículas",
  CUSTOMER_CONTACT: "Contacto Cliente",
  OTHER: "Outro",
};

export const DocumentTypeLabels: Record<DocumentType, string> = {
  INVOICE: "Fatura",
  COC: "Certificado de Conformidade",
  REGISTRATION_CERT: "Certificado de Registo",
  ID_DOCUMENT: "Documento de Identificação",
  NIF_DOCUMENT: "Documento NIF",
  ADDRESS_PROOF: "Comprovativo de Morada",
  DUA: "DUA (Declaração Única Aduaneira)",
  INSPECTION_CERT: "Certificado de Inspeção",
  IMT_FORM: "Formulário IMT",
  PAYMENT_PROOF: "Comprovativo de Pagamento",
  OTHER: "Outro",
};

export const FuelTypeLabels: Record<FuelType, string> = {
  GASOLINE: "Gasolina",
  DIESEL: "Gasóleo",
  ELECTRIC: "Elétrico",
  HYBRID: "Híbrido",
  PLUGIN_HYBRID: "Híbrido Plug-in",
  LPG: "GPL",
  CNG: "GNV",
  HYDROGEN: "Hidrogénio",
  OTHER: "Outro",
};



