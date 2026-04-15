
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, listings, companyContext } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // İlan özetini oluştur
    const listingSummary =
      listings && listings.length > 0
        ? listings
            .slice(0, 10)
            .map(
              (l: {
                title: string;
                price: string;
                location: string;
                details: string;
                url: string;
              }, i: number) =>
                `${i + 1}. ${l.title}
   Fiyat: ${l.price}
   Konum: ${l.location}
   Detay: ${l.details}
   Link: ${l.url}`
            )
            .join("\n\n")
        : "Henüz ilan yüklenmedi.";

    const systemPrompt = `Sen ${companyContext?.companyName || "bir emlak ofisi"} adına çalışan uzman bir AI emlak danışmanısın.

ŞİRKET BİLGİLERİ:
- Firma: ${companyContext?.companyName || "Emlak Ofisi"}
- Bölge: ${companyContext?.city || ""}  ${companyContext?.region || ""}
- Hedef Kitle: ${companyContext?.targetClientProfile || ""}
- Uzmanlık: ${companyContext?.services?.join(", ") || "Satılık ve kiralık konut"}

MEVCUT İLANLAR:
${listingSummary}

GÖREVIN:
- Müşterilere bu ilanlar hakkında profesyonel danışmanlık yap
- Bütçe ve ihtiyaca göre en uygun ilanı öner
- Fiyat, konum, özellik karşılaştırması yap
- Randevu ve görüşme için yönlendir
- Samimi, güvenilir ve uzman bir emlakçı gibi konuş
- Türkçe konuş
- Kısa ve net cevaplar ver
- Emoji kullanabilirsin ama abartma

ÖNEMLİ:
- Sadece mevcut ilanlar hakkında konuş
- Eğer sorulan ilan listede yoksa kibarca belirt
- Her zaman bir sonraki adımı öner (görüşme, ziyaret, teklif)`;

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
          temperature: 0.8,
          max_tokens: 500,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Groq API error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return NextResponse.json({ message: content });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Chat service error" },
      { status: 500 }
    );
  }
}
