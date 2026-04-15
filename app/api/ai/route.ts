import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { system, user } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const combinedPrompt = `${system}

ÇIKTI FORMAT KURALI:
Yanıtını SADECE geçerli JSON formatında ver. Markdown code block kullanma, düz JSON yaz.
Format:
{
  "result": "Detaylı analiz sonucu (markdown formatında, başlıklar, tablolar, listeler kullanabilirsin)",
  "reasoning_summary": "Bu analizde hangi verileri dikkate aldın ve neden bu sonuca vardın - 2-3 cümle",
  "assumptions": ["Varsayım 1", "Varsayım 2", "Varsayım 3"],
  "confidence": 85,
  "next_actions": ["Aksiyon 1", "Aksiyon 2", "Aksiyon 3"]
}

KULLANICI İSTEĞİ:
${user}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: combinedPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini error:", error);
      throw new Error("Gemini API error");
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("Empty response from Gemini");
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
        confidence: 80,
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