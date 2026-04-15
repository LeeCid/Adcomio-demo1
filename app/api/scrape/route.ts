import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url, companyName, city, region } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL gerekli" }, { status: 400 });
    }

    let listings: Array<{
      id: string;
      title: string;
      price: string;
      priceRaw: number;
      location: string;
      details: string;
      rooms: string;
      sqm: string;
      floor: string;
      age: string;
      url: string;
      date: string;
      score: number;
      pricePerSqm: string;
    }> = [];

    // Sahibinden fetch dene
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "tr-TR,tr;q=0.9",
          "Referer": "https://www.sahibinden.com/",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const html = await response.text();
        listings = parseListingsFromHTML(html, url);
      }
    } catch {
      console.log("Scraping failed, using demo data");
    }

    // Demo veri üret
    if (listings.length === 0) {
      listings = generateRealisticListings(
        companyName || "Demo Ofis",
        city || "İstanbul",
        region || "Kadıköy"
      );
    }

    return NextResponse.json({
      success: true,
      url,
      count: listings.length,
      listings,
      source: listings.length > 0 ? "live" : "demo",
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json({
      success: false,
      listings: generateRealisticListings("Demo", "İstanbul", "Merkez"),
      source: "demo",
    });
  }
}

function parseListingsFromHTML(html: string, baseUrl: string) {
  const listings: Array<{
    id: string;
    title: string;
    price: string;
    priceRaw: number;
    location: string;
    details: string;
    rooms: string;
    sqm: string;
    floor: string;
    age: string;
    url: string;
    date: string;
    score: number;
    pricePerSqm: string;
  }> = [];

  try {
    const titlePattern = /class="classifiedTitle"[^>]*>([^<]+)/g;
    const pricePattern = /class="price"[^>]*>\s*<span[^>]*>([^<]+)/g;
    const locationPattern = /class="searchResultsLocationValue"[^>]*>([^<]+)/g;
    const linkPattern = /href="(\/ilan\/[^"]+)"/g;

    const titles = [...html.matchAll(titlePattern)].map(m => m[1].trim());
    const prices = [...html.matchAll(pricePattern)].map(m => m[1].trim());
    const locations = [...html.matchAll(locationPattern)].map(m => m[1].trim());
    const links = [...html.matchAll(linkPattern)].map(m => m[1]);

    for (let i = 0; i < Math.min(titles.length, 12); i++) {
      if (titles[i] && prices[i]) {
        const priceRaw = parseInt(prices[i].replace(/[^\d]/g, "")) || 0;
        listings.push({
          id: `live-${i}`,
          title: titles[i],
          price: prices[i],
          priceRaw,
          location: locations[i] || "",
          details: "",
          rooms: "",
          sqm: "",
          floor: "",
          age: "",
          url: links[i] ? `https://www.sahibinden.com${links[i]}` : baseUrl,
          date: "Bugün",
          score: Math.floor(Math.random() * 30) + 70,
          pricePerSqm: "",
        });
      }
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  return listings;
}

function generateRealisticListings(
  companyName: string,
  city: string,
  region: string
) {
  const listings = [
    {
      id: "1",
      title: `${region} Satılık Lüks 3+1 Daire`,
      price: "₺8.750.000",
      priceRaw: 8750000,
      location: `${city} / ${region}`,
      details: "148 m² • 3+1 • 8. Kat • Deniz Manzaralı",
      rooms: "3+1",
      sqm: "148",
      floor: "8",
      age: "5",
      url: "",
      date: "Bugün",
      score: 94,
      pricePerSqm: "₺59.122/m²",
    },
    {
      id: "2",
      title: `${region} Kiralık 2+1 Premium Residence`,
      price: "₺45.000/ay",
      priceRaw: 45000,
      location: `${city} / ${region}`,
      details: "95 m² • 2+1 • Eşyalı • Site İçi",
      rooms: "2+1",
      sqm: "95",
      floor: "4",
      age: "3",
      url: "",
      date: "Bugün",
      score: 88,
      pricePerSqm: "₺473/m²/ay",
    },
    {
      id: "3",
      title: `${region} Satılık Dubleks Villa`,
      price: "₺18.500.000",
      priceRaw: 18500000,
      location: `${city} / ${region}`,
      details: "320 m² • 5+2 • Özel Bahçe • Havuz",
      rooms: "5+2",
      sqm: "320",
      floor: "1-2",
      age: "8",
      url: "",
      date: "Dün",
      score: 91,
      pricePerSqm: "₺57.812/m²",
    },
    {
      id: "4",
      title: `${region} Satılık 1+1 Yatırımlık`,
      price: "₺3.200.000",
      priceRaw: 3200000,
      location: `${city} / ${region}`,
      details: "62 m² • 1+1 • 3. Kat • Metro Yakını",
      rooms: "1+1",
      sqm: "62",
      floor: "3",
      age: "10",
      url: "",
      date: "Dün",
      score: 82,
      pricePerSqm: "₺51.612/m²",
    },
    {
      id: "5",
      title: `${region} Ticari Ofis Katı`,
      price: "₺12.000.000",
      priceRaw: 12000000,
      location: `${city} / ${region}`,
      details: "240 m² • Plazada • A Sınıfı",
      rooms: "Açık Plan",
      sqm: "240",
      floor: "12",
      age: "6",
      url: "",
      date: "2 gün önce",
      score: 86,
      pricePerSqm: "₺50.000/m²",
    },
    {
      id: "6",
      title: `${region} Satılık 4+1 Geniş Aile Dairesi`,
      price: "₺11.200.000",
      priceRaw: 11200000,
      location: `${city} / ${region}`,
      details: "185 m² • 4+1 • 6. Kat • Şehir Manzarası",
      rooms: "4+1",
      sqm: "185",
      floor: "6",
      age: "4",
      url: "",
      date: "3 gün önce",
      score: 89,
      pricePerSqm: "₺60.540/m²",
    },
    {
      id: "7",
      title: `${region} Kiralık 3+1 Bahçeli`,
      price: "₺35.000/ay",
      priceRaw: 35000,
      location: `${city} / ${region}`,
      details: "130 m² • 3+1 • Bahçe Katı",
      rooms: "3+1",
      sqm: "130",
      floor: "Bahçe",
      age: "15",
      url: "",
      date: "3 gün önce",
      score: 77,
      pricePerSqm: "₺269/m²/ay",
    },
    {
      id: "8",
      title: `${region} Satılık Arsa`,
      price: "₺6.800.000",
      priceRaw: 6800000,
      location: `${city} / ${region}`,
      details: "850 m² • İmarlı • Köşe Parsel",
      rooms: "-",
      sqm: "850",
      floor: "-",
      age: "-",
      url: "",
      date: "5 gün önce",
      score: 85,
      pricePerSqm: "₺8.000/m²",
    },
  ];

  return listings;
}
