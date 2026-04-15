import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, style, platform, companyName, tone, companyType } =
      await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    let imagePrompt = `${style}, ${prompt}, professional commercial photography, high quality, ${
      companyType === "dental"
        ? "dental clinic aesthetic"
        : companyType === "veterinary"
          ? "veterinary clinic warm atmosphere"
          : "real estate luxury photography"
    }`;

    if (apiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Sen profesyonel bir görsel yönetmenisin.
Aşağıdaki brief için Stable Diffusion / Flux image generation prompt'u oluştur.

Şirket: ${companyName}
Ton: ${tone}
Platform: ${platform}
Style: ${style}
Brief: ${prompt}

KURALLAR:
- İngilizce prompt yaz
- Maksimum 80 kelime
- Sadece prompt yaz, başka hiçbir şey ekleme, açıklama yapma
- professional photography, commercial quality ifadelerini ekle
- Platform kompozisyonu: ${
                        platform === "instagram"
                          ? "square composition 1:1"
                          : platform === "story"
                            ? "vertical composition 9:16"
                            : platform === "facebook"
                              ? "landscape composition 16:9"
                              : "wide banner composition"
                      }`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 200,
              },
            }),
          }
        );

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const generatedPrompt =
            data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedPrompt) {
            imagePrompt = generatedPrompt
              .replace(/```/g, "")
              .trim();
          }
        }
      } catch (geminiError) {
        console.error("Gemini prompt generation failed:", geminiError);
        // fallback imagePrompt kullanılmaya devam eder
      }
    }

    const dimensions = {
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
      facebook: { width: 1200, height: 630 },
      google: { width: 728, height: 90 },
    };

    const dim =
      dimensions[platform as keyof typeof dimensions] ||
      dimensions.instagram;

    const cleanPrompt = imagePrompt
      .replace(/```/g, "")
      .trim()
      .substring(0, 400);

    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const seed = Math.floor(Math.random() * 999999);

    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dim.width}&height=${dim.height}&nologo=true&enhance=true&seed=${seed}`;

    return NextResponse.json({
      imageUrl,
      usedPrompt: cleanPrompt,
      dimensions: dim,
      platform,
    });
  } catch (error) {
    console.error("Visual route error:", error);
    return NextResponse.json(
      { error: "Visual service error" },
      { status: 500 }
    );
  }
}