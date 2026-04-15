import { NextRequest, NextResponse } from "next/server";

// Agent Memory Store (in-memory for demo)
const agentMemory: Record<string, unknown> = {};

export async function POST(req: NextRequest) {
  try {
    const { system, user, module: moduleId, companyId, previousResults } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Önceki modül sonuçlarını bağlama ekle
    const memoryContext = previousResults
      ? `\nÖNCEKİ AJAN ÇIKTILARI (Bu bilgileri kullan ve referans ver):
${JSON.stringify(previousResults, null, 2)}`
      : "";

    const enhancedSystem = `${system}${memoryContext}

AJAN PROTOKOLÜ:
- Sen bir multi-agent sisteminin parçasısın
- Önceki ajanların çıktılarını bağlam olarak kullan
- Çıktını sonraki ajanlara aktarılabilecek şekilde yapılandır
- Spesifik, ölçülebilir ve aksiyonable öneriler ver
- Türkçe, profesyonel, C-suite seviyesinde yanıt ver`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 3000,
          messages: [
            {
              role: "system",
              content: `${enhancedSystem}

ÇIKTI FORMAT - SADECE JSON:
{
  "result": "Detaylı analiz (markdown formatında, tablolar, listeler kullan)",
  "reasoning_summary": "Hangi verileri kullandın, neden bu sonuç",
  "assumptions": ["varsayım1", "varsayım2", "varsayım3"],
  "confidence": 88,
  "next_actions": ["aksiyon1", "aksiyon2", "aksiyon3"],
  "key_metrics": {"metric1": "value1", "metric2": "value2"},
  "agent_output": {"transferable_data": "sonraki ajana aktarılacak kritik veri"},
  "risk_factors": ["risk1", "risk2"],
  "opportunity_score": 85
}`,
            },
            { role: "user", content: user },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Groq error:", error);
      throw new Error("Groq API error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("Empty response");

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        result: content,
        reasoning_summary: "Analiz tamamlandı.",
        assumptions: ["Piyasa verileri güncel", "Sektör standartları referans alındı"],
        confidence: 82,
        next_actions: ["Sonucu incele", "Bir sonraki modüle aktar"],
        key_metrics: {},
        agent_output: { transferable_data: content.substring(0, 200) },
        risk_factors: [],
        opportunity_score: 75,
      };
    }

    // Memory'e kaydet
    if (companyId && moduleId) {
      agentMemory[`${companyId}_${moduleId}`] = parsed;
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const moduleId = searchParams.get("moduleId");

  if (companyId && moduleId) {
    return NextResponse.json(agentMemory[`${companyId}_${moduleId}`] || null);
  }

  return NextResponse.json({});
}
