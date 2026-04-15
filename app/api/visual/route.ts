import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, style, platform, companyName, tone } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    let imagePrompt = `${style}, ${prompt}, luxury real estate photography, professional commercial, high quality, 4K`;

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
              max_tokens: 120,
              messages: [
                {
                  role: "user",
                  content: `Create a Flux/Stable Diffusion image prompt in English for:
Company: ${companyName}, Tone: ${tone}, Style: ${style}, Brief: ${prompt}
Rules: English only, max 70 words, only the prompt, professional real estate photography, commercial quality
Platform composition: ${platform === "instagram" ? "square 1:1" : platform === "story" ? "vertical 9:16" : "landscape 16:9"}`,
                },
              ],
            }),
          }
        );

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const generated = data.choices?.[0]?.message?.content;
          if (generated) imagePrompt = generated.replace(/```/g, "").trim();
        }
      } catch (e) {
        console.error("Groq visual error:", e);
      }
    }

    const dimensions = {
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
      facebook: { width: 1200, height: 630 },
      google: { width: 728, height: 90 },
    };

    const dim = dimensions[platform as keyof typeof dimensions] || dimensions.instagram;
    const cleanPrompt = imagePrompt.replace(/```/g, "").trim().substring(0, 400);
    const seed = Math.floor(Math.random() * 999999);

    return NextResponse.json({
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${dim.width}&height=${dim.height}&nologo=true&enhance=true&seed=${seed}`,
      usedPrompt: cleanPrompt,
      dimensions: dim,
      platform,
    });
  } catch (error) {
    console.error("Visual route error:", error);
    return NextResponse.json({ error: "Visual service error" }, { status: 500 });
  }
}
