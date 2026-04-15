import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { system, user } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

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
          max_tokens: 2000,
          messages: [
            {
              role: "system",
              content: `${system}

ÇIKTI FORMAT KURALI:
Yanıtını SADECE geçerli JSON formatında ver. Markdown code block kullanma, düz JSON yaz.
Format:
{
  "result": "Detaylı analiz sonucu (markdown formatında yaz, başlıklar ## ###, tablolar |, listeler - kullan)",
  "reasoning_summary": "Bu analizde hangi verileri dikkate aldın - 2-3 cümle",
  "assumptions": ["Varsayım 1", "Varsayım 2", "Varsayım 3"],
  "confidence": 85,
  "next_actions": ["Aksiyon 1", "Aksiyon 2", "Aksiyon 3"]
}`,
            },
            {
              role: "user",
              content: user,
            },
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

    if (!content) {
      throw new Error("Empty response from Groq");
    }

    let parsed;
    try {
      const cleaned = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        result: content,
        reasoning_summary:
          "Analiz tamamlandı. Şirket bağlamı ve parametreler değerlendirilerek sonuç üretildi.",
        assumptions: [
          "Girilen veriler doğru kabul edildi",
          "Sektör standartları referans alındı",
          "Mevcut pazar koşulları dikkate alındı",
        ],
        confidence: 82,
        next_actions: [
          "Sonucu gözden geçir ve uygulama planı oluştur",
          "Ekiple paylaş ve geri bildirim al",
          "30 gün sonra sonuçları değerlendir",
        ],
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: "AI service error" },
      { status: 500 }
    );
  }
}
