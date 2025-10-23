import { z } from "zod";
import { DocumentTypeSchema, DocumentStatusSchema } from "./enums";

// ============================================================================
// DOCUMENT
// ============================================================================

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_id: z.string().uuid(),

  type: DocumentTypeSchema,
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().nullable(),
  status: DocumentStatusSchema,

  // Storage
  storage_bucket: z.string().default("documents"),
  storage_key: z.string().optional().nullable(),
  file_size: z.number().int().positive().optional().nullable(),
  mime_type: z.string().optional().nullable(),

  // Metadados do ficheiro
  original_filename: z.string().optional().nullable(),
  uploaded_by: z.string().uuid().optional().nullable(),
  uploaded_at: z.string().datetime().optional().nullable(),

  // Verificação
  verified_by: z.string().uuid().optional().nullable(),
  verified_at: z.string().datetime().optional().nullable(),
  rejection_reason: z.string().optional().nullable(),

  // Expiração
  expires_at: z.string().datetime().optional().nullable(),

  // OCR / Extração
  ocr_text: z.string().optional().nullable(),
  extracted_data: z.record(z.any()).optional(),

  // Metadados
  metadata: z.record(z.any()).optional(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Document = z.infer<typeof DocumentSchema>;

export const CreateDocumentSchema = z.object({
  case_id: z.string().uuid(),
  type: DocumentTypeSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  status: DocumentStatusSchema.default("PENDING_UPLOAD"),
  expires_at: z.string().datetime().optional(),
});

export type CreateDocument = z.infer<typeof CreateDocumentSchema>;

export const UpdateDocumentSchema = CreateDocumentSchema.partial().extend({
  storage_key: z.string().optional(),
  file_size: z.number().optional(),
  mime_type: z.string().optional(),
  original_filename: z.string().optional(),
  uploaded_by: z.string().uuid().optional(),
  uploaded_at: z.string().datetime().optional(),
  verified_by: z.string().uuid().optional(),
  verified_at: z.string().datetime().optional(),
  rejection_reason: z.string().optional(),
  ocr_text: z.string().optional(),
  extracted_data: z.record(z.any()).optional(),
});

export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>;

// ============================================================================
// DOCUMENT UPLOAD
// ============================================================================

export const DocumentUploadSchema = z.object({
  case_id: z.string().uuid(),
  document_id: z.string().uuid().optional(), // Se já existe o registo
  type: DocumentTypeSchema,
  name: z.string(),
  file: z.instanceof(File).or(z.instanceof(Blob)),
});

export type DocumentUpload = z.infer<typeof DocumentUploadSchema>;

// ============================================================================
// DOCUMENT VERIFICATION
// ============================================================================

export const DocumentVerificationSchema = z.object({
  document_id: z.string().uuid(),
  approved: z.boolean(),
  rejection_reason: z.string().optional(),
  notes: z.string().optional(),
});

export type DocumentVerification = z.infer<typeof DocumentVerificationSchema>;



