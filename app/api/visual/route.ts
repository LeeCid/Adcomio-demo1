import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, style, platform, companyName, tone, companyType } =
      await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    let imagePrompt = `${style}, ${prompt}, professional commercial photography, high quality, ${
      companyType === "dental"
        ? "dental clinic aesthetic, clean white environment"
        : companyType === "veterinary"
          ? "veterinary clinic warm atmosphere, caring environment"
          : "real estate luxury photography, modern architecture"
    }`;

    if (apiKey) {
      try {
        const groqResponse = await fetch(
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
              max_tokens: 150,
              messages: [
                {
                  role: "user",
                  content: `Create a professional image generation prompt in English for:
Company: ${companyName}
Tone: ${tone}
Platform: ${platform}
Style: ${style}
Brief: ${prompt}
Sector: ${companyType}

Rules:
- English only
- Max 80 words
- Only the prompt, no explanation
- Include: professional photography, commercial quality
- Composition: ${
                    platform === "instagram"
                      ? "square 1:1"
                      : platform === "story"
                        ? "vertical 9:16"
                        : platform === "facebook"
                          ? "landscape 16:9"
                          : "wide banner"
                  }`,
                },
              ],
            }),
          }
        );

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const generatedPrompt = data.choices?.[0]?.message?.content;
          if (generatedPrompt) {
            imagePrompt = generatedPrompt.replace(/```/g, "").trim();
          }
        }
      } catch (groqError) {
        console.error("Groq prompt generation failed:", groqError);
      }
    }

    const dimensions = {
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
      facebook: { width: 1200, height: 630 },
      google: { width: 728, height: 90 },
    };

    const dim =
      dimensions[platform as keyof typeof dimensions] || dimensions.instagram;

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
