import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, listings, companyContext, marketAnalysis } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const listingSummary = listings?.length > 0
      ? listings.slice(0, 15).map((l: {
          title: string;
          price: string;
          location: string;
          details: string;
          url: string;
        }, i: number) => `${i + 1}. ${l.title} | ${l.price} | ${l.location} | ${l.details}`).join("\n")
      : "İlan yüklenmedi";

    const marketContext = marketAnalysis
      ? `\nPIYASA ANALİZİ: ${marketAnalysis.reasoning_summary || ""}`
      : "";

    const systemPrompt = `Sen ${companyContext?.companyName || "Emlak Ofisi"}'nin kıdemli AI Emlak Danışmanısın.

OFİS BİLGİLERİ:
- Firma: ${companyContext?.companyName}
- Bölge: ${companyContext?.city} / ${companyContext?.region}
- Uzmanlık: ${companyContext?.servicePrices?.map((s: { name: string }) => s.name).join(", ")}
- Hedef Kitle: ${companyContext?.targetClientProfile}
${marketContext}

AKTİF PORTFÖY (${listings?.length || 0} ilan):
${listingSummary}

DAVRANIŞ KURALLARI:
- Gerçek bir kıdemli emlak danışmanı gibi davran
- Her yanıtta spesifik ilan öner (fiyat, konum, özellik belirt)
- Yatırım getirisi hesapla (kira/satış oranı)
- Bölge dinamiklerini açıkla
- Randevu ve görüşme için aktif yönlendir
- Müşterinin bütçesini ve ihtiyacını anla
- Alternatif seçenekler sun
- Kısa, net, ikna edici konuş
- Emoji kullan ama profesyonel kal
- Her mesajı bir sonraki adıma yönlendir`;

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
          temperature: 0.85,
          max_tokens: 600,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-10),
          ],
        }),
      }
    );

    if (!response.ok) throw new Error("Groq error");
    const data = await response.json();

    return NextResponse.json({
      message: data.choices?.[0]?.message?.content || "Yanıt alınamadı.",
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat service error" }, { status: 500 });
  }
}
