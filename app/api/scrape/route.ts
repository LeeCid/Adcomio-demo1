
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL gerekli" }, { status: 400 });
    }

    // Sahibinden URL'ini normalize et
    const targetUrl = url.includes("sahibinden.com") ? url : null;

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Geçerli bir sahibinden.com linki girin" },
        { status: 400 }
      );
    }

    // Fetch dene
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Referer": "https://www.sahibinden.com/",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // HTML'den ilan verilerini parse et
    const listings = parseListings(html, targetUrl);

    return NextResponse.json({
      success: true,
      url: targetUrl,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Scrape error:", error);

    // Hata durumunda boş döndür, frontend mock gösterir
    return NextResponse.json({
      success: false,
      error: "Sayfa yüklenemedi",
      listings: [],
    });
  }
}

function parseListings(html: string, url: string) {
  const listings: Array<{
    id: string;
    title: string;
    price: string;
    location: string;
    details: string;
    url: string;
    date: string;
    imageUrl: string;
  }> = [];

  try {
    // İlan başlıklarını çek
    const titleMatches = html.matchAll(
      /class="classifiedTitle"[^>]*>\s*([^<]+)/g
    );
    const priceMatches = html.matchAll(
      /class="price"[^>]*>\s*<span[^>]*>\s*([^<]+)/g
    );
    const locationMatches = html.matchAll(
      /class="searchResultsLocationValue"[^>]*>\s*([^<]+)/g
    );
    const dateMatches = html.matchAll(
      /class="searchResultsDateValue"[^>]*>\s*([^<]+)/g
    );
    const linkMatches = html.matchAll(
      /href="(\/ilan\/[^"]+)"/g
    );
    const detailMatches = html.matchAll(
      /class="searchResultsAttributeValue"[^>]*>\s*([^<]+)/g
    );

    const titles = [...titleMatches].map((m) => m[1].trim());
    const prices = [...priceMatches].map((m) => m[1].trim());
    const locations = [...locationMatches].map((m) => m[1].trim());
    const dates = [...dateMatches].map((m) => m[1].trim());
    const links = [...linkMatches].map((m) => m[1]);
    const details = [...detailMatches].map((m) => m[1].trim());

    // İlanları birleştir
    const count = Math.min(titles.length, 20);

    for (let i = 0; i < count; i++) {
      if (titles[i] && prices[i]) {
        listings.push({
          id: `listing-${i}`,
          title: titles[i] || "İlan",
          price: prices[i] || "Fiyat belirtilmemiş",
          location: locations[i] || "Konum belirtilmemiş",
          details: [
            details[i * 3] || "",
            details[i * 3 + 1] || "",
            details[i * 3 + 2] || "",
          ]
            .filter(Boolean)
            .join(" • "),
          url: links[i]
            ? `https://www.sahibinden.com${links[i]}`
            : url,
          date: dates[i] || "",
          imageUrl: "",
        });
      }
    }
  } catch (parseError) {
    console.error("Parse error:", parseError);
  }

  return listings;
}
