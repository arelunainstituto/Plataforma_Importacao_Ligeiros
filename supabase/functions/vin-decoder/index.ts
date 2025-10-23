// Edge Function: vin-decoder
// Decode VIN e enriquece dados do veículo (mock de API externa)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VINDecodeRequest {
  vin: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { vin }: VINDecodeRequest = await req.json();

    console.log("Decoding VIN:", vin);

    // Validação básica
    if (!vin || vin.length !== 17) {
      throw new Error("VIN inválido. Deve ter 17 caracteres.");
    }

    // Mock de dados (em produção, chamar API real como NHTSA, CarMD, etc.)
    const mockData = {
      vin,
      make: extractMake(vin),
      model: "Modelo Exemplo",
      variant: "Variant Exemplo",
      manufacturerYear: 2020,
      firstRegistrationDate: "2020-06-15",
      category: "M1",
      fuelType: detectFuelType(vin),
      engineCapacity: 1600,
      powerKw: 85,
      powerHp: 116,
      co2Emissions: 125,
      euroEmissionStandard: "EURO6",
      weightEmpty: 1350,
      weightGross: 1850,
      seats: 5,
      doors: 5,
      color: "Preto",
      originCountry: "DE", // Alemanha
    };

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 500));

    return new Response(
      JSON.stringify({
        success: true,
        data: mockData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error decoding VIN:", error);
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

function extractMake(vin: string): string {
  // WMI (World Manufacturer Identifier) - primeiros 3 caracteres
  const wmi = vin.substring(0, 3).toUpperCase();
  
  const makeMap: Record<string, string> = {
    WAU: "Audi",
    WBA: "BMW",
    WDB: "Mercedes-Benz",
    WF0: "Ford",
    WVW: "Volkswagen",
    WP0: "Porsche",
    VF1: "Renault",
    VF3: "Peugeot",
    VF7: "Citroën",
    VSS: "SEAT",
    TRU: "Audi (Hungria)",
    ZFA: "Fiat",
    ZAR: "Alfa Romeo",
    // ... adicionar mais conforme necessário
  };

  return makeMap[wmi] || "Marca Desconhecida";
}

function detectFuelType(vin: string): string {
  // Simplificado - em produção, usar tabela real
  const code = vin.charAt(7);
  
  const fuelMap: Record<string, string> = {
    "D": "DIESEL",
    "E": "ELECTRIC",
    "G": "GASOLINE",
    "H": "HYBRID",
    "P": "PLUGIN_HYBRID",
  };

  return fuelMap[code] || "GASOLINE";
}



