// Edge Function: generate-pdf
// Gera PDFs de relatórios, orçamentos, documentos oficiais

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PDFRequest {
  type: "ORCAMENTO" | "RESUMO_PROCESSO" | "DECLARACAO" | "RECIBO";
  caseId: string;
  locale?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { type, caseId, locale = "pt-PT" }: PDFRequest = await req.json();

    console.log(`Generating PDF ${type} for case ${caseId}`);

    // Buscar dados do processo
    const { data: importCase, error: caseError } = await supabaseClient
      .from("ImportCase")
      .select(`
        *,
        customer:Customer(*),
        vehicle:Vehicle(*),
        tax_estimations:TaxEstimation(*)
      `)
      .eq("id", caseId)
      .single();

    if (caseError) throw caseError;

    // TODO: Integração real com biblioteca de geração de PDF
    // Por agora, mock simples
    const htmlContent = generateHTMLContent(type, importCase, locale);

    // Converter HTML para PDF (mock)
    // Em produção, usar biblioteca como puppeteer, jsPDF, ou serviço externo
    const pdfBuffer = await mockConvertHTMLToPDF(htmlContent);

    // Upload para Storage
    const fileName = `${type.toLowerCase()}_${caseId}_${Date.now()}.pdf`;
    const filePath = `${importCase.tenant_id}/exports/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("exports")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Obter URL pública (signed)
    const { data: signedUrlData } = await supabaseClient.storage
      .from("exports")
      .createSignedUrl(filePath, 3600); // 1 hora

    // Log de integração
    await supabaseClient.from("IntegrationEvent").insert({
      tenant_id: importCase.tenant_id,
      case_id: caseId,
      service_name: "PDF_GENERATOR",
      event_type: "RESPONSE",
      success: true,
      completed_at: new Date().toISOString(),
      metadata: { type, fileName, filePath },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          fileName,
          filePath,
          downloadUrl: signedUrlData?.signedUrl,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

function generateHTMLContent(type: string, data: any, locale: string): string {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  });

  let html = `
    <!DOCTYPE html>
    <html lang="${locale}">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .section { margin: 20px 0; }
        .label { font-weight: bold; display: inline-block; width: 200px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #007bff; color: white; }
      </style>
    </head>
    <body>
      <h1>${type === "ORCAMENTO" ? "Orçamento" : "Resumo do Processo"}</h1>
      <div class="section">
        <p><span class="label">Processo Nº:</span> ${data.case_number}</p>
        <p><span class="label">Data:</span> ${dateFormatter.format(new Date(data.intake_date))}</p>
      </div>
  `;

  if (type === "ORCAMENTO") {
    const estimation = data.tax_estimations?.[0];
    if (estimation) {
      html += `
        <div class="section">
          <h2>Estimativa de Custos</h2>
          <table>
            <tr><th>Item</th><th>Valor</th></tr>
            <tr><td>Valor do Veículo</td><td>${currencyFormatter.format(estimation.vehicle_value)}</td></tr>
            <tr><td>ISV (Cilindrada)</td><td>${currencyFormatter.format(estimation.isv_cilindrada)}</td></tr>
            <tr><td>ISV (CO₂)</td><td>${currencyFormatter.format(estimation.isv_co2)}</td></tr>
            <tr><td>ISV Total</td><td>${currencyFormatter.format(estimation.isv_total)}</td></tr>
            <tr><td>Redução (${estimation.isv_reduction_percentage}%)</td><td>-${currencyFormatter.format(estimation.isv_total - estimation.isv_total * (1 - estimation.isv_reduction_percentage / 100))}</td></tr>
            <tr><td>IVA</td><td>${currencyFormatter.format(estimation.iva_amount)}</td></tr>
            <tr><td>IUC (anual)</td><td>${currencyFormatter.format(estimation.iuc_estimated)}</td></tr>
            <tr style="font-weight: bold;"><td>TOTAL ESTIMADO</td><td>${currencyFormatter.format(estimation.total_estimated_cost)}</td></tr>
          </table>
        </div>
      `;
    }
  }

  html += `
      <div class="section">
        <h2>Dados do Veículo</h2>
        <p><span class="label">Marca/Modelo:</span> ${data.vehicle.make} ${data.vehicle.model}</p>
        <p><span class="label">VIN:</span> ${data.vehicle.vin}</p>
        <p><span class="label">Cilindrada:</span> ${data.vehicle.engine_capacity} cc</p>
        <p><span class="label">CO₂:</span> ${data.vehicle.co2_emissions} g/km</p>
      </div>
      
      <div class="section">
        <h2>Cliente</h2>
        <p><span class="label">Nome:</span> ${data.customer.first_name || data.customer.company_name} ${data.customer.last_name || ""}</p>
        <p><span class="label">NIF:</span> ${data.customer.nif}</p>
        <p><span class="label">Email:</span> ${data.customer.email}</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

async function mockConvertHTMLToPDF(html: string): Promise<Uint8Array> {
  // Mock: retornar PDF vazio
  // Em produção, usar biblioteca real
  const encoder = new TextEncoder();
  return encoder.encode(html); // Temporário: apenas HTML
}



