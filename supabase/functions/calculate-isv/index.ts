// Edge Function: calculate-isv
// Calcula ISV baseado em cilindrada, CO2 e idade do veículo

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ISVCalculationRequest {
  caseId: string;
  engineCapacity: number; // cc
  co2Emissions: number; // g/km
  vehicleAgeMonths: number;
  vehicleValue: number; // EUR
  fuelType: string;
}

interface ISVBracket {
  min: number;
  max: number;
  rate: number;
}

interface TaxTableData {
  brackets: ISVBracket[];
}

serve(async (req) => {
  // Handle CORS
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

    // Parse request
    const requestData: ISVCalculationRequest = await req.json();
    const {
      caseId,
      engineCapacity,
      co2Emissions,
      vehicleAgeMonths,
      vehicleValue,
      fuelType,
    } = requestData;

    console.log("Calculating ISV for case:", caseId);

    // Buscar tabelas fiscais ativas
    const { data: cilindradaTable, error: cilError } = await supabaseClient
      .from("TaxTable")
      .select("data")
      .eq("type", "ISV_CILINDRADA")
      .eq("is_active", true)
      .order("effective_date", { ascending: false })
      .limit(1)
      .single();

    if (cilError) throw cilError;

    const { data: co2Table, error: co2Error } = await supabaseClient
      .from("TaxTable")
      .select("data")
      .eq("type", "ISV_CO2")
      .eq("is_active", true)
      .order("effective_date", { ascending: false })
      .limit(1)
      .single();

    if (co2Error) throw co2Error;

    // Calcular componente cilindrada
    let isvCilindrada = 0;
    const cilData = cilindradaTable.data as TaxTableData;
    for (const bracket of cilData.brackets) {
      if (engineCapacity >= bracket.min && engineCapacity <= bracket.max) {
        isvCilindrada = engineCapacity * bracket.rate;
        break;
      }
    }

    // Calcular componente CO2
    let isvCo2 = 0;
    const co2Data = co2Table.data as TaxTableData;
    
    // Veículos elétricos: isentos de componente ambiental
    if (fuelType === "ELECTRIC") {
      isvCo2 = 0;
    } else {
      for (const bracket of co2Data.brackets) {
        if (co2Emissions >= bracket.min && co2Emissions <= bracket.max) {
          isvCo2 = co2Emissions * bracket.rate;
          break;
        }
      }
    }

    // ISV total antes de reduções
    const isvTotal = isvCilindrada + isvCo2;

    // Redução por antiguidade: 1% por mês, até 50%
    const reductionPercentage = Math.min(vehicleAgeMonths * 1.0, 50.0);
    const isvFinal = isvTotal * (1 - reductionPercentage / 100);

    // Valor depreciado do veículo
    const depreciationRate = reductionPercentage;
    const depreciatedValue = vehicleValue * (1 - depreciationRate / 100);

    // IVA (23% sobre valor + ISV para empresas, 0% para particulares)
    // Aqui assumimos empresa para exemplo
    const ivaRate = 23.0;
    const ivaBase = depreciatedValue + isvFinal;
    const ivaAmount = ivaBase * (ivaRate / 100);

    // IUC estimado (simplificado - baseado em CO2)
    let iucEstimated = 0;
    if (co2Emissions <= 120) {
      iucEstimated = 20.78;
    } else if (co2Emissions <= 180) {
      iucEstimated = 69.72;
    } else if (co2Emissions <= 250) {
      iucEstimated = 181.01;
    } else {
      iucEstimated = 450.00;
    }

    // Total estimado
    const totalEstimatedCost = depreciatedValue + isvFinal + ivaAmount + iucEstimated;

    // Buscar case para obter tenant_id
    const { data: importCase, error: caseError } = await supabaseClient
      .from("ImportCase")
      .select("tenant_id")
      .eq("id", caseId)
      .single();

    if (caseError) throw caseError;

    // Salvar estimativa na base de dados
    const { data: estimation, error: saveError } = await supabaseClient
      .from("TaxEstimation")
      .insert({
        tenant_id: importCase.tenant_id,
        case_id: caseId,
        vehicle_value: vehicleValue,
        vehicle_age_months: vehicleAgeMonths,
        depreciation_rate: depreciationRate,
        depreciated_value: depreciatedValue,
        isv_cilindrada: isvCilindrada,
        isv_co2: isvCo2,
        isv_total: isvTotal,
        isv_reduction_percentage: reductionPercentage,
        isv_table_version: "2024",
        iva_rate: ivaRate,
        iva_base: ivaBase,
        iva_amount: ivaAmount,
        iuc_estimated: iucEstimated,
        total_estimated_cost: totalEstimatedCost,
        calculation_details: {
          engineCapacity,
          co2Emissions,
          fuelType,
          isvCilindradaDetails: { rate: isvCilindrada / engineCapacity },
          isvCo2Details: { rate: co2Emissions > 0 ? isvCo2 / co2Emissions : 0 },
        },
        is_final: false,
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // Criar auditoria
    await supabaseClient.rpc("create_audit_log", {
      p_action: "CALCULATE",
      p_entity_type: "TaxEstimation",
      p_entity_id: estimation.id,
      p_new_values: estimation,
    });

    // Retornar resultado
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          estimationId: estimation.id,
          isvCilindrada: Math.round(isvCilindrada * 100) / 100,
          isvCo2: Math.round(isvCo2 * 100) / 100,
          isvTotal: Math.round(isvTotal * 100) / 100,
          reductionPercentage,
          isvFinal: Math.round(isvFinal * 100) / 100,
          ivaAmount: Math.round(ivaAmount * 100) / 100,
          iucEstimated: Math.round(iucEstimated * 100) / 100,
          totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error calculating ISV:", error);
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



