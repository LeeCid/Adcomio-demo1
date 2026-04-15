"use client";

import { useState, useRef } from "react";

// ============================================================
// TYPES
// ============================================================
type CompanyType = "dental" | "veterinary" | "realestate";
type ToneOfVoice = "kurumsal" | "samimi" | "premium" | "ulasilabilir";
type MarketingGoal =
  | "lead"
  | "awareness"
  | "appointment"
  | "sales"
  | "portfolio";

interface ServicePrice {
  name: string;
  price: string;
  isTopService: boolean;
  isPriority: boolean;
}

interface CompanyContext {
  companyType: CompanyType;
  companyName: string;
  city: string;
  region: string;
  website: string;
  instagram: string;
  toneOfVoice: ToneOfVoice;
  services: string[];
  servicePrices: ServicePrice[];
  mostProfitableService: string;
  topPriorityService: string;
  targetClientProfile: string;
  competitors: string;
  monthlyBudget: string;
  marketingGoals: MarketingGoal[];
  targetAgeRange: string;
  incomeLevel: string;
  interests: string;
  decisionMotivations: string;
  trustBarriers: string;
  regionalFocus: string;
  platforms: string[];
  hasInstagram: boolean;
  hasGoogleAds: boolean;
  hasMetaAds: boolean;
  hasLinkedIn: boolean;
  contentFrequency: string;
  teamSize: string;
  biggestSalesProblem: string;
  packages: { name: string; price: string; description: string }[];
}

interface ModuleResult {
  result: string;
  reasoning_summary: string;
  assumptions: string[];
  confidence: number;
  next_actions: string[];
}

type ActivePage =
  | "dashboard"
  | "market-analysis"
  | "sales-proposal"
  | "content-planning"
  | "copywriting"
  | "ad-media"
  | "lead-tracking"
  | "data-analytics"
  | "operations"
  | "visual-design";

// ============================================================
// CONSTANTS
// ============================================================
const COMPANY_TYPE_CONFIG = {
  dental: {
    label: "Diş Kliniği",
    icon: "🦷",
    description: "İmplant, ortodonti, estetik diş hizmetleri",
    color: "from-blue-500 to-cyan-500",
    services: [
      "İmplant",
      "Ortodonti",
      "Zirkonyum",
      "Diş Beyazlatma",
      "Estetik Gülüş Tasarımı",
      "Kanal Tedavisi",
      "Diş Eti Tedavisi",
      "Çocuk Diş Hekimliği",
    ],
  },
  veterinary: {
    label: "Veteriner Kliniği",
    icon: "🐾",
    description: "Muayene, cerrahi, bakım hizmetleri",
    color: "from-emerald-500 to-teal-500",
    services: [
      "Muayene",
      "Aşı",
      "Cerrahi",
      "Pet Check-up",
      "Kuaför / Bakım",
      "Diş Temizliği",
      "Röntgen & Görüntüleme",
      "Acil Servis",
    ],
  },
  realestate: {
    label: "Emlak Ofisi",
    icon: "🏢",
    description: "Satış, kiralama, lüks konut portföyü",
    color: "from-violet-500 to-purple-500",
    services: [
      "Satılık Daire",
      "Kiralık Daire",
      "Arsa",
      "Lüks Konut",
      "Ticari Gayrimenkul",
      "Yatırım Danışmanlığı",
      "Proje Satışı",
      "Değerleme",
    ],
  },
};

const MODULE_CONFIG = [
  {
    id: "market-analysis",
    title: "Pazar & Rakip Analizi",
    icon: "📊",
    description: "Rekabet haritası, pazar fırsatları ve konumlandırma analizi",
    color: "from-blue-600 to-indigo-600",
    usesData: ["Şirket tipi", "Rakipler", "Bölge", "Hedef kitle"],
  },
  {
    id: "sales-proposal",
    title: "Satış & Teklif Hazırlama",
    icon: "📝",
    description: "Kişiselleştirilmiş teklif şablonları ve satış dokümanları",
    color: "from-emerald-600 to-teal-600",
    usesData: ["Fiyat listesi", "Hizmetler", "Müşteri profili"],
  },
  {
    id: "content-planning",
    title: "Stratejik İçerik Planı",
    icon: "📅",
    description: "Aylık içerik takvimi ve platform bazlı yayın stratejisi",
    color: "from-orange-600 to-amber-600",
    usesData: ["Pazarlama hedefleri", "Platformlar", "Marka tonu"],
  },
  {
    id: "copywriting",
    title: "Metin Yazarı & Kreatif",
    icon: "✍️",
    description:
      "Reklam metinleri, sosyal medya içerikleri ve e-posta şablonları",
    color: "from-pink-600 to-rose-600",
    usesData: ["Marka tonu", "Hedef kitle", "Hizmetler"],
  },
  {
    id: "ad-media",
    title: "Reklam & Medya Satın Alma",
    icon: "📢",
    description: "Bütçe optimizasyonu, platform seçimi ve kampanya planı",
    color: "from-violet-600 to-purple-600",
    usesData: ["Aylık bütçe", "Platformlar", "Pazarlama hedefleri"],
  },
  {
    id: "lead-tracking",
    title: "Lead Takip Ajanı",
    icon: "🎯",
    description: "Lead skorlama, önceliklendirme ve dönüşüm önerileri",
    color: "from-cyan-600 to-sky-600",
    usesData: ["Müşteri profili", "Güven bariyerleri", "Satış sorunu"],
  },
  {
    id: "data-analytics",
    title: "Veri Analiz & Raporlama",
    icon: "📈",
    description: "Performans analizi, KPI yorumlama ve büyüme önerileri",
    color: "from-teal-600 to-green-600",
    usesData: ["Bütçe", "Hedefler", "Platformlar"],
  },
  {
    id: "operations",
    title: "Operasyon & Koordinasyon",
    icon: "⚙️",
    description: "İş akışı optimizasyonu, önceliklendirme ve kaynak planı",
    color: "from-slate-600 to-gray-600",
    usesData: ["Ekip büyüklüğü", "İş modeli", "Hedefler"],
  },
  {
    id: "visual-design",
    title: "Görsel Tasarım & Üretim",
    icon: "🎨",
    description: "AI ile gerçek görsel üretimi ve tasarım direktifleri",
    color: "from-fuchsia-600 to-pink-600",
    usesData: ["Marka tonu", "Platformlar", "Brief"],
  },
];

const LOADING_MESSAGES: Record<string, string[]> = {
  "market-analysis": [
    "Bölgesel pazar sinyalleri yorumlanıyor...",
    "Rakip yoğunluğu analiz ediliyor...",
    "Rekabet konumlandırması değerlendiriliyor...",
    "Pazar fırsatları haritalanıyor...",
    "Stratejik pozisyon raporu hazırlanıyor...",
  ],
  "sales-proposal": [
    "Teklif çerçevesi fiyat verilerine göre oluşturuluyor...",
    "Hizmet paketleri optimize ediliyor...",
    "Müşteri profili satış diline dönüştürülüyor...",
    "Değer önerisi hazırlanıyor...",
    "Teklif dokümanı son haline getiriliyor...",
  ],
  "content-planning": [
    "İçerik temaları hedef kitleye göre şekillendiriliyor...",
    "Platform bazlı yayın takvimi oluşturuluyor...",
    "Mevsimsel fırsatlar analiz ediliyor...",
    "İçerik mix optimize ediliyor...",
    "Yayın takvimi senkronize ediliyor...",
  ],
  copywriting: [
    "Marka tonu ve ses karakteri kalibre ediliyor...",
    "Hedef kitle dil profili analiz ediliyor...",
    "İkna edici mesaj yapısı kuruluyor...",
    "Reklam metinleri varyasyonlarıyla oluşturuluyor...",
    "Son düzenleme ve ton uyumu kontrol ediliyor...",
  ],
  "ad-media": [
    "Bütçe dağılımı optimize ediliyor...",
    "Platform ROI karşılaştırması yapılıyor...",
    "Hedef kitle erişim potansiyeli hesaplanıyor...",
    "Kampanya takvimi ve frekans planlanıyor...",
    "Medya planı finalize ediliyor...",
  ],
  "lead-tracking": [
    "Lead profilleri analiz ediliyor...",
    "Dönüşüm olasılıkları hesaplanıyor...",
    "Önceliklendirme matrisi oluşturuluyor...",
    "Takip aksiyonları kişiselleştiriliyor...",
    "Lead skoru güncelleniyor...",
  ],
  "data-analytics": [
    "Performans verileri normalize ediliyor...",
    "KPI trendleri modelleniyor...",
    "Anomaliler tespit ediliyor...",
    "Büyüme fırsatları hesaplanıyor...",
    "Raporlama çerçevesi hazırlanıyor...",
  ],
  operations: [
    "İş akışı darboğazları tespit ediliyor...",
    "Kaynak dağılımı optimize ediliyor...",
    "Öncelik matrisi oluşturuluyor...",
    "Otomasyon fırsatları haritalanıyor...",
    "Operasyonel plan finalize ediliyor...",
  ],
  "visual-design": [
    "Marka kimliği analiz ediliyor...",
    "Görsel direktifler oluşturuluyor...",
    "Platform kompozisyonu ayarlanıyor...",
    "AI görsel üretiliyor...",
    "Son düzenlemeler yapılıyor...",
  ],
};

// ============================================================
// AI SERVICES
// ============================================================
const buildSystemPrompt = (company: CompanyContext): string => {
  const typeConfig = COMPANY_TYPE_CONFIG[company.companyType];
  return `Sen Adcomio'nun gelişmiş AI analiz sisteminin uzman ajanısın.
Aşağıdaki şirket için çalışıyorsun ve tüm analizlerini bu şirkete özel yapıyorsun:

ŞİRKET PROFİLİ:
- Şirket Adı: ${company.companyName}
- Sektör: ${typeConfig.label}
- Şehir/Bölge: ${company.city} - ${company.region}
- Marka Tonu: ${company.toneOfVoice}
- Aylık Reklam Bütçesi: ${company.monthlyBudget} TL

HİZMETLER VE FİYATLAR:
${company.servicePrices?.map((s) => `- ${s.name}: ${s.price} TL${s.isTopService ? " [EN KARLI]" : ""}${s.isPriority ? " [ÖNCELİKLİ]" : ""}`).join("\n") || "Belirtilmedi"}

HEDEF KİTLE:
- Profil: ${company.targetClientProfile}
- Yaş Aralığı: ${company.targetAgeRange}
- Gelir Seviyesi: ${company.incomeLevel}
- İlgi Alanları: ${company.interests}
- Güven Bariyerleri: ${company.trustBarriers}

PAZARLAMA:
- Hedefler: ${company.marketingGoals?.join(", ")}
- Aktif Platformlar: ${[company.hasInstagram && "Instagram", company.hasGoogleAds && "Google Ads", company.hasMetaAds && "Meta Ads", company.hasLinkedIn && "LinkedIn"].filter(Boolean).join(", ")}
- Rakipler: ${company.competitors}
- En Büyük Satış Sorunu: ${company.biggestSalesProblem}

ÖNEMLİ KURALLAR:
- Tüm analizlerin bu şirkete özgün olsun
- Sektörel dinamikleri dikkate al
- Fiyat ve bütçe verilerini analiz et
- Türkçe ve profesyonel bir dilde yanıt ver`;
};

const callAI = async (
  systemPrompt: string,
  userPrompt: string,
  moduleId: string
): Promise<ModuleResult> => {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: systemPrompt,
        user: userPrompt,
        module: moduleId,
      }),
    });
    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    return data;
  } catch {
    return generateMockResult(moduleId);
  }
};

const generateMockResult = (moduleId: string): ModuleResult => {
  const mocks: Record<string, ModuleResult> = {
    "market-analysis": {
      result: `## Pazar Konumlandırma Analizi\n\n**Rekabet Yoğunluğu: Orta-Yüksek**\n\nBölgenizdeki pazar analizi tamamlandı.\n\n### Pazar Fırsatları\n- **Premium segment boşluğu**: Lüks segment yeterince hizmet almıyor\n- **Dijital görünürlük açığı**: Rakiplerin %70'i sosyal medyada tutarsız\n- **Güven odaklı içerik**: Sosyal kanıt paylaşan rakip sayısı az\n\n### Stratejik Konumlandırma\nEn güçlü rekabet avantajınız **uzmanlık + güven + dijital görünürlük** üçgeninde oluşturulabilir.`,
      reasoning_summary:
        "Rakip bilgileri, bölge ve fiyat pozisyonu birlikte değerlendirilerek pazar boşlukları tespit edildi.",
      assumptions: [
        "Bölgede ortalama 5-8 aktif rakip olduğu varsayıldı",
        "Dijital reklam harcamasının sektör ortalaması dikkate alındı",
        "Premium segment hedeflemesinin mevcut fiyat yapısıyla uyumlu olduğu değerlendirildi",
      ],
      confidence: 84,
      next_actions: [
        "Rakip sosyal medya hesaplarını haftalık takip sistemine ekle",
        "Premium segment için ayrı mesajlaşma stratejisi geliştir",
        "Google Maps ve yerel SEO optimizasyonunu önceliklendir",
      ],
    },
    "sales-proposal": {
      result: `## Kişiselleştirilmiş Teklif Şablonu\n\n### Değer Önerisi\n\nSayın Müşterimiz,\n\nİhtiyaçlarınızı dinledikten sonra size özel çözüm paketini hazırladık.\n\n### Önerilen Paket\n\n| Hizmet | Standart | Paket |\n|--------|----------|-------|\n| Ana Hizmet | Liste fiyatı | %15 indirimli |\n| Destek | Ek ücret | Dahil |\n| Takip | Ek ücret | Ücretsiz |\n\n### Neden Bu Paket?\n1. ✅ Tam ihtiyaç karşılama\n2. ✅ Uzun vadeli değer\n3. ✅ Esnek ödeme seçenekleri`,
      reasoning_summary:
        "Hizmet fiyat listesi ve müşteri profili birlikte değerlendirilerek en uygun paket kombinasyonu belirlendi.",
      assumptions: [
        "Müşterinin orta-üst gelir segmentinde olduğu varsayıldı",
        "Paket indirimi müşteri çekme etkisiyle karşılanabilir",
        "48 saatlik onay süreci standart kapasiteye uygun",
      ],
      confidence: 79,
      next_actions: [
        "Teklifi PDF olarak hazırla ve WhatsApp üzerinden gönder",
        "3 gün sonra takip araması için takvime ekle",
        "Benzer müşteri vakalarını referans olarak hazırla",
      ],
    },
    "content-planning": {
      result: `## Aylık İçerik Planı\n\n### Hafta 1 - Güven & Uzmanlık\n- **Pazartesi**: Vaka çalışması / öncesi-sonrası\n- **Çarşamba**: Uzman ipuçları videosu\n- **Cuma**: Müşteri yorumu\n- **Pazar**: Bilgilendirici infografik\n\n### Hafta 2 - Hizmet Tanıtımı\n- **Salı**: Öne çıkan hizmet spotlight\n- **Perşembe**: SSS story formatı\n- **Cumartesi**: Ekip tanıtımı\n\n### Platform Dağılımı\n- Instagram Feed: %40\n- Instagram Story: %35\n- Reels: %25`,
      reasoning_summary:
        "Pazarlama hedefleri ve marka tonu baz alınarak dönüşüm odaklı içerik mix oluşturuldu.",
      assumptions: [
        "Instagram ana platform olarak değerlendirildi",
        "Haftada 4-5 içerik optimum sıklık",
        "Video içeriğin organik erişimi artırdığı öngörüldü",
      ],
      confidence: 87,
      next_actions: [
        "İçerik takvimini Google Calendar'a aktar",
        "İlk 2 haftalık içerikleri önceden hazırla",
        "Her içerik için fotoğraf/video ihtiyaç listesi oluştur",
      ],
    },
    copywriting: {
      result: `## Reklam Metinleri\n\n### 🎯 Versiyon A - Duygusal\n"Yıllardır güven veren hizmetimizle ilk adımı bugün at.\nUzman ekibimiz senin için hazır.\n🔗 Hemen randevu al → Link biyografide"\n\n### 🎯 Versiyon B - Faydacı\n"❌ Artık beklemene gerek yok.\n✅ Uzman kadro, modern ekipman\n✅ Kolay ulaşım\n👉 DM'den yazın"\n\n### 🎯 Versiyon C - Sosyal Kanıt\n"500+ mutlu müşteri bizi tercih etti.\nSen de bu ailenin parçası ol 🙏"`,
      reasoning_summary:
        "Marka tonu ve hedef kitle profili analiz edilerek 3 farklı ikna yaklaşımı geliştirildi.",
      assumptions: [
        "A/B test için en az 3 varyasyon gerekli",
        "Hedef kitlenin duygusal ve faydacı mesajlara duyarlı olduğu varsayıldı",
        "Instagram ana dağıtım kanalı",
      ],
      confidence: 91,
      next_actions: [
        "3 versiyonu ayrı reklam setlerinde test et",
        "İlk 3 günde CTR karşılaştır",
        "En iyi performanslı versiyonu ölçeklendir",
      ],
    },
    "ad-media": {
      result: `## Medya Planı\n\n### Bütçe Dağılımı\n\n| Platform | Bütçe % | Tahmini Erişim |\n|----------|---------|----------------|\n| Meta (Instagram/FB) | %50 | 15.000-25.000 kişi |\n| Google Search | %30 | Aktif arayan kitle |\n| Google Display | %15 | 30.000+ kişi |\n| Test | %5 | Keşfetme |\n\n### Kampanya Yapısı\n- **Hafta 1-2**: Farkındalık (%30 bütçe)\n- **Hafta 2-3**: Düşünme (%40 bütçe)\n- **Hafta 3-4**: Dönüşüm (%30 bütçe)\n\n### Tahmini KPI\n- CPL: ₺85-120\n- ROAS: 3.5x\n- Aylık lead: 40-65`,
      reasoning_summary:
        "Aylık bütçe ve aktif platformlar baz alınarak funnel mantığına göre dağılım oluşturuldu.",
      assumptions: [
        "Meta'nın bölgede en yüksek kitle yoğunluğuna sahip olduğu varsayıldı",
        "Google Search'te rakip reklamların orta yoğunlukta olduğu öngörüldü",
        "İlk ay verilerine göre bütçe yeniden dağıtılacak",
      ],
      confidence: 82,
      next_actions: [
        "Meta Business Manager'da kampanya yapısını kur",
        "Google Search için anahtar kelime listesi hazırla",
        "İlk hafta sonunda CPL'i kontrol et",
      ],
    },
    "lead-tracking": {
      result: `## Lead Analiz Raporu\n\n### Lead Skor Matrisi\n\n**A Tier - Hemen İletişim (80-100)**\n- Birden fazla iletişim kurmuş\n- Fiyat sorusu sormuş\n- **Aksiyon**: 24 saat içinde ara\n\n**B Tier - Aktif Takip (50-79)**\n- Tek iletişim, bilgi almış\n- **Aksiyon**: 48 saat içinde mesaj\n\n**C Tier - Nurturing (20-49)**\n- Sosyal medya etkileşimi\n- **Aksiyon**: Haftalık içerik\n\n### Önemli Not\nLead'e 5 dakika içinde dönmek dönüşümü **%400 artırıyor**.`,
      reasoning_summary:
        "Müşteri güven bariyerleri ve satış sorunu analiz edilerek önceliklendirme matrisi oluşturuldu.",
      assumptions: [
        "Mevcut lead yanıt süresinin 24 saatten uzun olduğu varsayıldı",
        "Güven bariyerinin fiyat ve referans eksikliğinden kaynaklandığı değerlendirildi",
        "WhatsApp birincil iletişim kanalı",
      ],
      confidence: 88,
      next_actions: [
        "WhatsApp Business otomatik yanıtı güncelle",
        "CRM sistemine lead skor alanı ekle",
        "Haftalık lead review toplantısı başlat",
      ],
    },
    "data-analytics": {
      result: `## Performans Analizi\n\n### Temel Metrikler\n\n| Metrik | Mevcut | Hedef |\n|--------|--------|-------|\n| Aylık Yeni Müşteri | Baseline | +30% |\n| Lead Dönüşüm | ~%8 | %15 |\n| Müşteri Başı Gelir | Mevcut | +%20 |\n| Tekrar Ziyaret | ~%25 | %45 |\n\n### Öncelikli Aksiyonlar\n- 🔴 Lead yanıt hızı: **KRİTİK**\n- 🟡 İçerik tutarlılığı: **ÖNEMLİ**\n- 🟢 Bütçe kullanımı: **İYİ**`,
      reasoning_summary:
        "Girilen iş verileri ve sektör benchmarkları karşılaştırılarak boşluklar tespit edildi.",
      assumptions: [
        "Sektör ortalaması benchmarkları kullanıldı",
        "Mevcut dönüşüm oranının ortalamanın altında olduğu varsayıldı",
        "Büyüme potansiyelinin operasyonel iyileştirmeden geleceği değerlendirildi",
      ],
      confidence: 76,
      next_actions: [
        "Aylık KPI dashboard kur ve haftalık takip et",
        "Lead kaynaklarını UTM ile izle",
        "İlk 30 günde dönüşüm oranını baseline olarak kaydet",
      ],
    },
    operations: {
      result: `## Operasyonel Optimizasyon\n\n### Tespit Edilen Darboğazlar\n1. **Lead yanıt süresi**: Manuel takip yavaşlatıyor\n2. **İçerik üretimi**: Planlanmamış, reaktif\n3. **Müşteri iletişimi**: Standart şablonlar eksik\n\n### Öncelik Matrisi\n\n**Bu Hafta:**\n- [ ] WhatsApp Business otomatik yanıt\n- [ ] Lead takip spreadsheet\n- [ ] İçerik takvimi\n\n**Bu Ay:**\n- [ ] Teklif şablonları\n- [ ] Onboarding checklist\n- [ ] Haftalık operasyon toplantısı`,
      reasoning_summary:
        "Ekip büyüklüğü ve iş modeli analiz edilerek kritik operasyonel boşluklar tespit edildi.",
      assumptions: [
        "Manuel süreçlerin verimliliği düşürdüğü varsayıldı",
        "Önce şablon altyapısı kurulması gerektiği değerlendirildi",
        "CRM olmadan lead takibinin yetersiz kaldığı öngörüldü",
      ],
      confidence: 85,
      next_actions: [
        "Bu haftaki aksiyonları sorumlu kişilere ata",
        "30 günlük iyileştirme sprint'i başlat",
        "Aylık operasyon review takvime ekle",
      ],
    },
    "visual-design": {
      result: `## Görsel Strateji\n\n### Platform Formatları\n\n| Format | Boyut | Kullanım |\n|--------|-------|----------|\n| Instagram Feed | 1080x1080 | Ana içerik |\n| Story | 1080x1920 | Günlük |\n| Facebook | 1200x630 | Paylaşım |\n| Google Display | 728x90 | Retargeting |\n\n### İçerik Brief'leri\n\n**Güven İçerikleri:**\n- Gerçek fotoğraf ağırlıklı\n- Sıcak renk tonu\n\n**Hizmet Tanıtımı:**\n- Temiz arka plan\n- Net fiyat gösterimi`,
      reasoning_summary:
        "Marka tonu ve aktif platformlar analiz edilerek tasarım gereksinimleri belirlendi.",
      assumptions: [
        "Instagram birincil görsel platform",
        "Profesyonel fotoğraf için bütçe ayrılabilir",
        "Tutarlılığın marka güvenini artırdığı öngörüldü",
      ],
      confidence: 83,
      next_actions: [
        "Tasarımcıya brief ilet",
        "Marka renkleri için brand kit oluştur",
        "İlk ay şablon seti hazırlat",
      ],
    },
  };

  return (
    mocks[moduleId] || {
      result: "Analiz tamamlandı.",
      reasoning_summary: "Veri analiz edildi.",
      assumptions: [],
      confidence: 80,
      next_actions: [],
    }
  );
};

// ============================================================
// UI COMPONENTS
// ============================================================
const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <div
      className={`${sizes[size]} border-2 border-white/30 border-t-white rounded-full animate-spin`}
    />
  );
};

const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info";
}) => {
  const variants = {
    default: "bg-white/10 text-white/80",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    info: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

const ConfidenceBar = ({ value }: { value: number }) => {
  const color =
    value >= 85
      ? "from-emerald-500 to-teal-500"
      : value >= 70
        ? "from-amber-500 to-yellow-500"
        : "from-red-500 to-rose-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/50">Güven Seviyesi</span>
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

const GlassCard = ({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl ${className} ${onClick ? "cursor-pointer hover:border-white/20 transition-all" : ""}`}
  >
    {children}
  </div>
);

const ProgressStep = ({
  step,
  total,
}: {
  step: number;
  current: number;
  total: number;
}) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            i + 1 < step
              ? "bg-emerald-500 text-white"
              : i + 1 === step
                ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white ring-2 ring-indigo-400/50"
                : "bg-white/10 text-white/30"
          }`}
        >
          {i + 1 < step ? "✓" : i + 1}
        </div>
        {i < total - 1 && (
          <div
            className={`w-6 h-0.5 mx-1 transition-all ${
              i + 1 < step ? "bg-emerald-500" : "bg-white/10"
            }`}
          />
        )}
      </div>
    ))}
    <span className="ml-2 text-sm text-white/50">
      {step}/{total}
    </span>
  </div>
);

// ============================================================
// FORMAT MARKDOWN
// ============================================================
const formatMarkdown = (text: string): string => {
  return text
    .replace(
      /## (.*?)(\n|$)/g,
      '<h2 class="text-white font-bold text-base mt-4 mb-2">$1</h2>'
    )
    .replace(
      /### (.*?)(\n|$)/g,
      '<h3 class="text-white/90 font-semibold text-sm mt-3 mb-1.5">$1</h3>'
    )
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-white font-semibold">$1</strong>'
    )
    .replace(/\*(.*?)\*/g, '<em class="text-white/70">$1</em>')
    .replace(
      /`(.*?)`/g,
      '<code class="bg-white/10 px-1 rounded text-indigo-300 text-xs">$1</code>'
    )
    .replace(/^\| (.*) \|$/gm, (match) => {
      if (match.includes("---")) return "";
      const cells = match
        .slice(2, -2)
        .split(" | ")
        .map(
          (cell) =>
            `<td class="px-3 py-1.5 text-white/60 text-xs border-b border-white/5">${cell}</td>`
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .replace(
      /(<tr>[\s\S]*?<\/tr>\n?)+/g,
      (match) =>
        `<div class="overflow-x-auto my-3"><table class="w-full border-collapse"><tbody>${match}</tbody></table></div>`
    )
    .replace(
      /^- (.*?)$/gm,
      '<li class="text-white/60 text-sm ml-4 list-disc">$1</li>'
    )
    .replace(
      /(<li[\s\S]*?<\/li>\n?)+/g,
      (match) => `<ul class="space-y-1 my-2">${match}</ul>`
    )
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
};

// ============================================================
// LOGIN PAGE
// ============================================================
const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#080B14] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-indigo-500/30">
              A
            </div>
            <span className="text-3xl font-black text-white tracking-tight">
              adcomio
            </span>
          </div>
          <p className="text-white/40 text-sm">
            AI-Powered Marketing Intelligence Platform
          </p>
        </div>
        <GlassCard className="p-8">
          <h2 className="text-xl font-bold text-white mb-6">Demo Girişi</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@sirket.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                "Demo'ya Başla →"
              )}
            </button>
          </form>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-white/30 text-center">
              Demo hesabı: herhangi bir bilgi girin
            </p>
          </div>
        </GlassCard>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: "🤖", label: "9 AI Ajanı" },
            { icon: "⚡", label: "Canlı Analiz" },
            { icon: "🎯", label: "Sektörel Odak" },
          ].map((f) => (
            <GlassCard key={f.label} className="p-3 text-center">
              <div className="text-xl mb-1">{f.icon}</div>
              <div className="text-xs text-white/50">{f.label}</div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ONBOARDING WIZARD
// ============================================================
const OnboardingWizard = ({
  onComplete,
}: {
  onComplete: (company: CompanyContext) => void;
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const [company, setCompany] = useState<Partial<CompanyContext>>({
    services: [],
    marketingGoals: [],
    platforms: [],
    servicePrices: [],
    packages: [],
    hasInstagram: false,
    hasGoogleAds: false,
    hasMetaAds: false,
    hasLinkedIn: false,
  });

  const update = (key: keyof CompanyContext, value: unknown) => {
    setCompany((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!company.companyType;
      case 2: return !!(company.companyName && company.city);
      case 3: return !!(company.servicePrices && company.servicePrices.length > 0);
      case 4: return !!(company.marketingGoals && company.marketingGoals.length > 0);
      case 5: return !!company.targetAgeRange;
      case 6: return !!company.teamSize;
      default: return true;
    }
  };

  const typeConfig = company.companyType
    ? COMPANY_TYPE_CONFIG[company.companyType]
    : null;

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-white">
              A
            </div>
            <span className="text-xl font-black text-white">adcomio</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Şirketini Tanımla
          </h1>
          <p className="text-white/40 text-sm">
            AI ajanların senin şirketine özel çalışması için birkaç bilgiye
            ihtiyacımız var
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <ProgressStep step={step} current={step} total={totalSteps} />
        </div>

        <GlassCard className="p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Şirket Tipini Seç
                </h2>
                <p className="text-white/40 text-sm">
                  Bu seçim tüm AI analizlerinin sektörel doğrulukta çalışmasını
                  sağlar
                </p>
              </div>
              <div className="grid gap-4">
                {(
                  Object.entries(COMPANY_TYPE_CONFIG) as [
                    CompanyType,
                    (typeof COMPANY_TYPE_CONFIG)[CompanyType],
                  ][]
                ).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => update("companyType", type)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      company.companyType === type
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl`}
                      >
                        {config.icon}
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {config.label}
                        </div>
                        <div className="text-white/40 text-sm mt-0.5">
                          {config.description}
                        </div>
                      </div>
                      {company.companyType === type && (
                        <div className="ml-auto w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Temel Şirket Bilgileri
                </h2>
                <p className="text-white/40 text-sm">
                  Marka kimliği ve lokasyon bilgileri
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">
                    Şirket / Marka Adı *
                  </label>
                  <input
                    value={company.companyName || ""}
                    onChange={(e) => update("companyName", e.target.value)}
                    placeholder={
                      typeConfig?.label === "Diş Kliniği"
                        ? "Dr. Ahmet Yılmaz Kliniği"
                        : typeConfig?.label === "Veteriner Kliniği"
                          ? "PetCare Veteriner Kliniği"
                          : "Güven Emlak"
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">
                    Şehir *
                  </label>
                  <input
                    value={company.city || ""}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="İstanbul"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">
                    İlçe / Bölge
                  </label>
                  <input
                    value={company.region || ""}
                    onChange={(e) => update("region", e.target.value)}
                    placeholder="Kadıköy"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">
                    Website (opsiyonel)
                  </label>
                  <input
                    value={company.website || ""}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="www.sirket.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">
                    Instagram (opsiyonel)
                  </label>
                  <input
                    value={company.instagram || ""}
                    onChange={(e) => update("instagram", e.target.value)}
                    placeholder="@sirket"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">
                    Marka Tonu
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      ["kurumsal", "samimi", "premium", "ulasilabilir"] as ToneOfVoice[]
                    ).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => update("toneOfVoice", tone)}
                        className={`py-2 px-3 rounded-lg text-sm capitalize transition-all ${
                          company.toneOfVoice === tone
                            ? "bg-indigo-500 text-white"
                            : "bg-white/5 text-white/50 hover:bg-white/10"
                        }`}
                      >
                        {tone === "ulasilabilir" ? "ulaşılabilir" : tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && typeConfig && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Hizmetler ve Fiyatlar
                </h2>
                <p className="text-white/40 text-sm">
                  AI tüm modüllerde bu fiyatları kullanacak
                </p>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {typeConfig.services.map((service) => {
                  const existing = company.servicePrices?.find(
                    (s) => s.name === service
                  );
                  const isSelected = !!existing;
                  return (
                    <div
                      key={service}
                      className={`p-3 rounded-xl border transition-all ${
                        isSelected
                          ? "border-indigo-500/50 bg-indigo-500/5"
                          : "border-white/10 bg-white/3"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            const prices = company.servicePrices || [];
                            if (isSelected) {
                              update("servicePrices", prices.filter((s) => s.name !== service));
                            } else {
                              update("servicePrices", [...prices, { name: service, price: "", isTopService: false, isPriority: false }]);
                            }
                          }}
                          className={`w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 transition-all ${
                            isSelected ? "bg-indigo-500 text-white" : "bg-white/10 text-transparent"
                          }`}
                        >
                          ✓
                        </button>
                        <span className="text-white text-sm flex-1 min-w-0">{service}</span>
                        {isSelected && (
                          <>
                            <input
                              value={existing?.price || ""}
                              onChange={(e) => {
                                const prices = (company.servicePrices || []).map((s) =>
                                  s.name === service ? { ...s, price: e.target.value } : s
                                );
                                update("servicePrices", prices);
                              }}
                              placeholder="₺ Fiyat"
                              className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs placeholder-white/20 focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const prices = (company.servicePrices || []).map((s) =>
                                  s.name === service ? { ...s, isTopService: !s.isTopService } : s
                                );
                                update("servicePrices", prices);
                              }}
                              className={`text-xs px-2 py-1 rounded ${existing?.isTopService ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-white/30"}`}
                            >
                              Kârlı
                            </button>
                            <button
                              onClick={() => {
                                const prices = (company.servicePrices || []).map((s) =>
                                  s.name === service ? { ...s, isPriority: !s.isPriority } : s
                                );
                                update("servicePrices", prices);
                              }}
                              className={`text-xs px-2 py-1 rounded ${existing?.isPriority ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/30"}`}
                            >
                              Öncelikli
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Hedef Müşteri Profili</label>
                  <input
                    value={company.targetClientProfile || ""}
                    onChange={(e) => update("targetClientProfile", e.target.value)}
                    placeholder="Estetik bilinçli, 30-50 yaş..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Aylık Reklam Bütçesi (₺)</label>
                  <input
                    value={company.monthlyBudget || ""}
                    onChange={(e) => update("monthlyBudget", e.target.value)}
                    placeholder="15000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Rakip İsimler (virgülle ayır)</label>
                  <input
                    value={company.competitors || ""}
                    onChange={(e) => update("competitors", e.target.value)}
                    placeholder="Rakip 1, Rakip 2, Rakip 3"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Pazarlama Hedefleri</h2>
                <p className="text-white/40 text-sm">Birden fazla seçebilirsiniz</p>
              </div>
              <div className="grid gap-3">
                {[
                  { id: "lead", label: "Lead Toplamak", desc: "Potansiyel müşteri bilgilerini topla", icon: "🎯" },
                  { id: "awareness", label: "Marka Bilinirliği", desc: "Daha fazla kişiye ulaş", icon: "📢" },
                  { id: "appointment", label: "Randevu Almak", desc: "Direkt rezervasyon ve randevu", icon: "📅" },
                  { id: "sales", label: "Satış Kapatmak", desc: "Dönüşüm ve gelir artışı", icon: "💰" },
                  { id: "portfolio", label: "Portföy / Hizmet Talebi", desc: "Belirli hizmetlere talep yaratmak", icon: "📋" },
                ].map((goal) => {
                  const isSelected = (company.marketingGoals || []).includes(goal.id as MarketingGoal);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => {
                        const goals = company.marketingGoals || [];
                        if (isSelected) {
                          update("marketingGoals", goals.filter((g) => g !== goal.id));
                        } else {
                          update("marketingGoals", [...goals, goal.id as MarketingGoal]);
                        }
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{goal.icon}</span>
                        <div>
                          <div className="text-white font-medium">{goal.label}</div>
                          <div className="text-white/40 text-xs">{goal.desc}</div>
                        </div>
                        {isSelected && (
                          <div className="ml-auto w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">✓</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Hedef Kitle Detayları</h2>
                <p className="text-white/40 text-sm">AI bu verilerle mesaj tonunu şekillendirecek</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Yaş Aralığı *</label>
                  <select
                    value={company.targetAgeRange || ""}
                    onChange={(e) => update("targetAgeRange", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="" className="bg-gray-900">Seç</option>
                    <option value="18-25" className="bg-gray-900">18-25</option>
                    <option value="25-35" className="bg-gray-900">25-35</option>
                    <option value="35-50" className="bg-gray-900">35-50</option>
                    <option value="50+" className="bg-gray-900">50+</option>
                    <option value="Tüm yaşlar" className="bg-gray-900">Tüm yaşlar</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Gelir Seviyesi</label>
                  <select
                    value={company.incomeLevel || ""}
                    onChange={(e) => update("incomeLevel", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="" className="bg-gray-900">Seç</option>
                    <option value="Alt gelir" className="bg-gray-900">Alt gelir</option>
                    <option value="Orta gelir" className="bg-gray-900">Orta gelir</option>
                    <option value="Üst-orta gelir" className="bg-gray-900">Üst-orta gelir</option>
                    <option value="Yüksek gelir" className="bg-gray-900">Yüksek gelir</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">İlgi Alanları</label>
                  <input
                    value={company.interests || ""}
                    onChange={(e) => update("interests", e.target.value)}
                    placeholder="sağlık, estetik, yaşam kalitesi..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Karar Verme Motivasyonları</label>
                  <input
                    value={company.decisionMotivations || ""}
                    onChange={(e) => update("decisionMotivations", e.target.value)}
                    placeholder="güven, fiyat, hız, referans..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Güven Bariyerleri</label>
                  <input
                    value={company.trustBarriers || ""}
                    onChange={(e) => update("trustBarriers", e.target.value)}
                    placeholder="fiyat şeffaflığı, referans eksikliği..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Bölgesel Odak</label>
                  <input
                    value={company.regionalFocus || ""}
                    onChange={(e) => update("regionalFocus", e.target.value)}
                    placeholder="Kadıköy ve çevre ilçeler..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Platformlar ve Ekip</h2>
                <p className="text-white/40 text-sm">Mevcut dijital varlık ve ekip bilgileri</p>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-2 block">Aktif Dijital Platformlar</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "hasInstagram", label: "Instagram", icon: "📸" },
                    { key: "hasGoogleAds", label: "Google Ads", icon: "🔍" },
                    { key: "hasMetaAds", label: "Meta Ads", icon: "📘" },
                    { key: "hasLinkedIn", label: "LinkedIn", icon: "💼" },
                  ].map((p) => {
                    const isOn = company[p.key as keyof CompanyContext] as boolean;
                    return (
                      <button
                        key={p.key}
                        onClick={() => update(p.key as keyof CompanyContext, !isOn)}
                        className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${
                          isOn ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span>{p.icon}</span>
                        <span className="text-white text-sm">{p.label}</span>
                        {isOn && <span className="ml-auto text-indigo-400 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">İçerik Sıklığı</label>
                  <select
                    value={company.contentFrequency || ""}
                    onChange={(e) => update("contentFrequency", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="" className="bg-gray-900">Seç</option>
                    <option value="Hiç yok" className="bg-gray-900">Hiç yok</option>
                    <option value="Ayda 1-2" className="bg-gray-900">Ayda 1-2</option>
                    <option value="Haftada 1" className="bg-gray-900">Haftada 1</option>
                    <option value="Haftada 3+" className="bg-gray-900">Haftada 3+</option>
                    <option value="Her gün" className="bg-gray-900">Her gün</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Ekip Büyüklüğü *</label>
                  <select
                    value={company.teamSize || ""}
                    onChange={(e) => update("teamSize", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="" className="bg-gray-900">Seç</option>
                    <option value="Solo / 1 kişi" className="bg-gray-900">Solo / 1 kişi</option>
                    <option value="2-5 kişi" className="bg-gray-900">2-5 kişi</option>
                    <option value="6-15 kişi" className="bg-gray-900">6-15 kişi</option>
                    <option value="15+ kişi" className="bg-gray-900">15+ kişi</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Satışta En Büyük Sorun</label>
                  <input
                    value={company.biggestSalesProblem || ""}
                    onChange={(e) => update("biggestSalesProblem", e.target.value)}
                    placeholder="Lead gelmiyor, dönüşüm düşük..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7 */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Fiyat ve Paket Mantığı</h2>
                <p className="text-white/40 text-sm">Opsiyonel: Paket tanımları teklif modülünü güçlendirir</p>
              </div>
              <div className="space-y-3">
                {(company.packages || []).map((pkg, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-xs">Paket {i + 1}</span>
                      <button
                        onClick={() => {
                          const pkgs = [...(company.packages || [])];
                          pkgs.splice(i, 1);
                          update("packages", pkgs);
                        }}
                        className="text-red-400/60 hover:text-red-400 text-xs"
                      >
                        Sil
                      </button>
                    </div>
                    <input
                      value={pkg.name}
                      onChange={(e) => {
                        const pkgs = [...(company.packages || [])];
                        pkgs[i] = { ...pkgs[i], name: e.target.value };
                        update("packages", pkgs);
                      }}
                      placeholder="Paket adı (Starter, Pro, Premium)"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        value={pkg.price}
                        onChange={(e) => {
                          const pkgs = [...(company.packages || [])];
                          pkgs[i] = { ...pkgs[i], price: e.target.value };
                          update("packages", pkgs);
                        }}
                        placeholder="Fiyat (₺)"
                        className="w-1/3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none"
                      />
                      <input
                        value={pkg.description}
                        onChange={(e) => {
                          const pkgs = [...(company.packages || [])];
                          pkgs[i] = { ...pkgs[i], description: e.target.value };
                          update("packages", pkgs);
                        }}
                        placeholder="Kısa açıklama"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => update("packages", [...(company.packages || []), { name: "", price: "", description: "" }])}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-white/40 hover:border-indigo-500/50 hover:text-indigo-400 transition-all text-sm"
                >
                  + Paket Ekle
                </button>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-indigo-400">✨</span>
                  <span className="text-white font-medium text-sm">Profil Özeti</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-white/50">Şirket: <span className="text-white">{company.companyName}</span></div>
                  <div className="text-white/50">Tip: <span className="text-white">{typeConfig?.label || "-"}</span></div>
                  <div className="text-white/50">Şehir: <span className="text-white">{company.city || "-"}</span></div>
                  <div className="text-white/50">Bütçe: <span className="text-white">₺{company.monthlyBudget || "-"}</span></div>
                  <div className="text-white/50">Hizmet: <span className="text-white">{company.servicePrices?.length || 0} adet</span></div>
                  <div className="text-white/50">Ekip: <span className="text-white">{company.teamSize || "-"}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* NAV BUTTONS */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-5 py-2.5 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              ← Geri
            </button>
            {step < totalSteps ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:from-indigo-400 hover:to-violet-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm shadow-lg shadow-indigo-500/25"
              >
                Devam Et →
              </button>
            ) : (
              <button
                onClick={() => onComplete(company as CompanyContext)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-all text-sm shadow-lg shadow-emerald-500/25"
              >
                Dashboard'a Geç →
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// ============================================================
// SIDEBAR
// ============================================================
const Sidebar = ({
  activePage,
  onNavigate,
  company,
}: {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  company: CompanyContext;
}) => {
  const typeConfig = COMPANY_TYPE_CONFIG[company.companyType];
  const navItems = [
    { id: "dashboard" as ActivePage, icon: "🏠", label: "Dashboard" },
    ...MODULE_CONFIG.map((m) => ({ id: m.id as ActivePage, icon: m.icon, label: m.title })),
  ];

  return (
    <div className="w-64 h-screen bg-[#080B14] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-white">A</div>
          <div>
            <div className="text-white font-bold text-sm">adcomio</div>
            <div className="text-white/30 text-xs">AI Platform</div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-b border-white/5">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${typeConfig.color} bg-opacity-10`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{typeConfig.icon}</span>
            <div>
              <div className="text-white text-xs font-semibold truncate">{company.companyName}</div>
              <div className="text-white/60 text-xs">{typeConfig.label}</div>
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
              activePage === item.id
                ? "bg-indigo-500/20 text-white border border-indigo-500/30"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="truncate text-xs font-medium">{item.label}</span>
            {activePage === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="text-xs text-white/20 text-center">Demo v1.0 · {company.city}</div>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================
const Dashboard = ({
  company,
  onNavigate,
}: {
  company: CompanyContext;
  onNavigate: (page: ActivePage) => void;
}) => {
  const typeConfig = COMPANY_TYPE_CONFIG[company.companyType];
  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl bg-gradient-to-br ${typeConfig.color} bg-opacity-10 border border-white/10 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{typeConfig.icon}</span>
                <Badge variant="success">AI Aktif</Badge>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{company.companyName}</h1>
              <p className="text-white/50 text-sm">
                {typeConfig.label} · {company.city}{company.region ? ` / ${company.region}` : ""} · {company.teamSize || "Ekip"} · <span className="capitalize">{company.toneOfVoice} ton</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/30 mb-1">Aylık Bütçe</div>
              <div className="text-2xl font-bold text-white">₺{company.monthlyBudget || "—"}</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: "Aktif Hizmet", value: company.servicePrices?.length || 0, icon: "🔧" },
              { label: "Hedef Platform", value: [company.hasInstagram, company.hasGoogleAds, company.hasMetaAds, company.hasLinkedIn].filter(Boolean).length, icon: "📱" },
              { label: "Pazar Hedefi", value: company.marketingGoals?.length || 0, icon: "🎯" },
              { label: "AI Modülü", value: 9, icon: "🤖" },
            ].map((kpi) => (
              <GlassCard key={kpi.label} className="p-3 text-center">
                <div className="text-xl mb-1">{kpi.icon}</div>
                <div className="text-xl font-bold text-white">{kpi.value}</div>
                <div className="text-xs text-white/40">{kpi.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      <GlassCard className="p-5">
        <h2 className="text-sm font-semibold text-white/50 mb-4 uppercase tracking-wider">
          Şirket Bağlamı — Tüm AI Modülleri Bu Datayı Kullanıyor
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-white/30 mb-2">Öne Çıkan Hizmetler</div>
            <div className="space-y-1">
              {company.servicePrices?.slice(0, 4).map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-white/70 text-xs">{s.name}</span>
                  <div className="flex items-center gap-1">
                    {s.isTopService && <Badge variant="warning">Kârlı</Badge>}
                    {s.isPriority && <Badge variant="success">Öncelikli</Badge>}
                    {s.price && <span className="text-white text-xs font-mono">₺{s.price}</span>}
                  </div>
                </div>
              ))}
              {!company.servicePrices?.length && <div className="text-white/20 text-xs">Henüz eklenmedi</div>}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/30 mb-2">Hedef Kitle</div>
            <div className="space-y-1 text-xs text-white/60">
              <div>Yaş: {company.targetAgeRange || "—"}</div>
              <div>Gelir: {company.incomeLevel || "—"}</div>
              <div>Profil: {company.targetClientProfile || "—"}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-white/30 mb-2">Pazarlama Durumu</div>
            <div className="space-y-1 text-xs text-white/60">
              <div>Hedefler: {company.marketingGoals?.join(", ") || "—"}</div>
              <div>İçerik: {company.contentFrequency || "—"}</div>
              <div>Rakipler: {company.competitors?.split(",")[0] || "—"}{company.competitors?.split(",").length > 1 ? ` +${company.competitors.split(",").length - 1}` : ""}</div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div>
        <h2 className="text-sm font-semibold text-white/50 mb-4 uppercase tracking-wider">AI Modülleri</h2>
        <div className="grid grid-cols-3 gap-4">
          {MODULE_CONFIG.map((module) => (
            <GlassCard
              key={module.id}
              className="p-4 group"
              onClick={() => onNavigate(module.id as ActivePage)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-lg`}>
                  {module.icon}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="info">Test Et →</Badge>
                </div>
              </div>
              <h3 className="text-white font-medium text-sm mb-1">{module.title}</h3>
              <p className="text-white/30 text-xs mb-3 leading-relaxed">{module.description}</p>
              <div className="flex flex-wrap gap-1">
                {module.usesData.slice(0, 2).map((d) => (
                  <span key={d} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/30">{d}</span>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <GlassCard className="p-5">
        <h2 className="text-sm font-semibold text-white/50 mb-4 uppercase tracking-wider">Önerilen İlk Aksiyonlar</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { step: "1", module: "Pazar Analizi", desc: "Rakip haritanı çıkar", id: "market-analysis" as ActivePage },
            { step: "2", module: "İçerik Planı", desc: "Aylık içerik takvimini oluştur", id: "content-planning" as ActivePage },
            { step: "3", module: "Reklam Planı", desc: "Bütçeni optimize et", id: "ad-media" as ActivePage },
          ].map((action) => (
            <button
              key={action.step}
              onClick={() => onNavigate(action.id)}
              className="p-4 rounded-xl bg-white/3 border border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">{action.step}</div>
                <span className="text-white/70 text-xs font-medium">{action.module}</span>
              </div>
              <p className="text-white/40 text-xs">{action.desc}</p>
              <div className="mt-2 text-indigo-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Başla →</div>
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

// ============================================================
// VISUAL DESIGN MODULE
// ============================================================
const VisualDesignModule = ({ company }: { company: CompanyContext }) => {
  const [brief, setBrief] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [style, setStyle] = useState("professional photography");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<{
    imageUrl: string;
    usedPrompt: string;
    dimensions: { width: number; height: number };
  } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const typeConfig = COMPANY_TYPE_CONFIG[company.companyType];

  const loadingMessages = [
    "Marka kimliği analiz ediliyor...",
    "Görsel direktifler oluşturuluyor...",
    "Platform kompozisyonu ayarlanıyor...",
    "AI görsel üretiliyor...",
    "Son düzenlemeler yapılıyor...",
  ];

  const platforms = [
    { id: "instagram", label: "Instagram Feed", icon: "📸", size: "1080×1080" },
    { id: "story", label: "Story / Reels", icon: "📱", size: "1080×1920" },
    { id: "facebook", label: "Facebook Post", icon: "📘", size: "1200×630" },
    { id: "google", label: "Google Display", icon: "🔍", size: "728×90" },
  ];

  const styles = [
    "professional photography",
    "minimalist design",
    "luxury lifestyle",
    "warm and friendly",
    "clinical and clean",
    "bold and modern",
  ];

  const getPlaceholderBrief = () => {
    const briefs = {
      dental: "Gülüş tasarımı hizmetimiz için öncesi-sonrası dönüşümü vurgulayan, güven veren ve premium hissettiren bir Instagram görseli",
      veterinary: "Sevimli bir köpek ve veteriner hekim arasındaki güven anını gösteren, sıcak ve samimi bir muayene sahnesi",
      realestate: "Modern bir rezidansın gün batımında çekilen lüks ve çarpıcı dış cephe fotoğrafı, premium atmosfer",
    };
    return briefs[company.companyType];
  };

  const handleGenerate = async () => {
    if (!brief.trim()) return;
    setLoading(true);
    setResult(null);
    setImageLoaded(false);
    setLoadingStep(0);
    setLoadingMsg(loadingMessages[0]);

    let step = 0;
    intervalRef.current = setInterval(() => {
      step = Math.min(step + 1, loadingMessages.length - 1);
      setLoadingStep(step);
      setLoadingMsg(loadingMessages[step]);
    }, 1000);

    try {
      const response = await fetch("/api/visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: brief,
          style,
          platform,
          companyName: company.companyName,
          tone: company.toneOfVoice,
          companyType: company.companyType,
        }),
      });

      if (!response.ok) throw new Error("Visual API error");
      const data = await response.json();
      setResult(data);
      setGenerationCount((c) => c + 1);
    } catch {
      const fallbackPrompt = encodeURIComponent(
        `${style}, ${brief}, professional commercial, ${
          company.companyType === "dental" ? "dental clinic" :
          company.companyType === "veterinary" ? "veterinary clinic" : "real estate"
        }, high quality`
      );
      setResult({
        imageUrl: `https://image.pollinations.ai/prompt/${fallbackPrompt}?width=1080&height=1080&nologo=true&seed=${Date.now()}`,
        usedPrompt: brief,
        dimensions: { width: 1080, height: 1080 },
      });
      setGenerationCount((c) => c + 1);
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-600 flex items-center justify-center text-2xl">🎨</div>
        <div>
          <h1 className="text-xl font-bold text-white">Görsel Tasarım & Üretim Ajanı</h1>
          <p className="text-white/40 text-sm mt-0.5">Brief'ini yaz, AI gerçek görsel üretsin</p>
        </div>
      </div>

      <GlassCard className="p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50">Şirket Bağlamı Aktif</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-xs text-white font-medium">{company.companyName}</span>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-xs text-white/40">{typeConfig.label}</span>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-xs text-white/40 capitalize">{company.toneOfVoice} ton</span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-2 space-y-4">
          <GlassCard className="p-4">
            <label className="text-xs text-white/50 mb-3 block uppercase tracking-wider">Platform & Format</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`p-2.5 rounded-xl border transition-all text-left ${
                    platform === p.id ? "border-fuchsia-500 bg-fuchsia-500/10" : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="text-lg mb-1">{p.icon}</div>
                  <div className="text-white text-xs font-medium">{p.label}</div>
                  <div className="text-white/30 text-xs">{p.size}</div>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <label className="text-xs text-white/50 mb-3 block uppercase tracking-wider">Görsel Stili</label>
            <div className="space-y-1.5">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-all ${
                    style === s ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30" : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="col-span-3 space-y-4">
          <GlassCard className="p-4">
            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Görsel Brief</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={getPlaceholderBrief()}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-fuchsia-500/50 transition-all resize-none text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !brief.trim()}
              className={`mt-3 w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                loading || !brief.trim()
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-fuchsia-500/20"
              }`}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>{loadingMsg}</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Görsel Üret</span>
                </>
              )}
            </button>
          </GlassCard>

          {loading && (
            <GlassCard className="p-5">
              <div className="space-y-3">
                {loadingMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs transition-all duration-500 ${
                      i < loadingStep ? "text-emerald-400" : i === loadingStep ? "text-white" : "text-white/20"
                    }`}
                  >
                    <span>{i < loadingStep ? "✓" : i === loadingStep ? "►" : "○"}</span>
                    {msg}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {result && !loading && (
            <GlassCard className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-sm">Üretilen Görsel</span>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{result.dimensions.width}×{result.dimensions.height}</Badge>
                  <Badge variant="info">#{generationCount}</Badge>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 min-h-48">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Spinner size="lg" />
                      <p className="text-white/30 text-xs mt-3">Görsel yükleniyor...</p>
                    </div>
                  </div>
                )}
                <img
                  src={result.imageUrl}
                  alt="AI Generated Visual"
                  className={`w-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  style={{ maxHeight: platform === "story" ? "500px" : "400px", objectFit: "cover" }}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
              </div>
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="text-xs text-white/30 mb-1">Kullanılan Görsel Direktif</div>
                <p className="text-white/50 text-xs leading-relaxed">{result.usedPrompt}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm flex items-center justify-center gap-1"
                >
                  🔄 Yeniden Üret
                </button>
                <a
                  href={result.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/20 transition-all text-sm flex items-center justify-center gap-1"
                >
                  ↗ Tam Boyut Aç
                </a>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MODULE PAGE (diğer 8 modül)
// ============================================================
const ModulePage = ({
  moduleId,
  company,
}: {
  moduleId: string;
  company: CompanyContext;
}) => {
  if (moduleId === "visual-design") {
    return <VisualDesignModule company={company} />;
  }

  const moduleConfig = MODULE_CONFIG.find((m) => m.id === moduleId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ModuleResult | null>(null);
  const [activeTab, setActiveTab] = useState<"result" | "reasoning" | "actions">("result");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const messages = LOADING_MESSAGES[moduleId] || [];

  const getModulePrompt = () => {
    const typeConfig = COMPANY_TYPE_CONFIG[company.companyType];
    const prompts: Record<string, string> = {
      "market-analysis": `${company.companyName} adlı ${typeConfig.label} için kapsamlı pazar ve rakip analizi yap. Şehir: ${company.city}, Rakipler: ${company.competitors}, Hedef kitle: ${company.targetClientProfile}. ${input ? `Ek bilgi: ${input}` : ""}`,
      "sales-proposal": `${company.companyName} için profesyonel satış teklifi hazırla. Hizmetler: ${company.servicePrices?.map((s) => `${s.name}: ₺${s.price}`).join(", ")}. Müşteri profili: ${company.targetClientProfile}. ${input ? `Müşteri talebi: ${input}` : ""}`,
      "content-planning": `${company.companyName} için aylık içerik planı oluştur. Platformlar: ${[company.hasInstagram && "Instagram", company.hasMetaAds && "Facebook"].filter(Boolean).join(", ")}. Hedefler: ${company.marketingGoals?.join(", ")}, Ton: ${company.toneOfVoice}. ${input ? `Özel istek: ${input}` : ""}`,
      copywriting: `${company.companyName} için reklam metinleri yaz. Ton: ${company.toneOfVoice}, Hedef kitle: ${company.targetClientProfile}. Hizmetler: ${company.servicePrices?.slice(0, 3).map((s) => s.name).join(", ")}. ${input ? `İçerik tipi: ${input}` : ""}`,
      "ad-media": `${company.companyName} için medya planı oluştur. Bütçe: ₺${company.monthlyBudget}/ay. Hedefler: ${company.marketingGoals?.join(", ")}. ${input ? `Kampanya odağı: ${input}` : ""}`,
      "lead-tracking": `${company.companyName} için lead takip stratejisi oluştur. Satış sorunu: ${company.biggestSalesProblem}. Güven bariyerleri: ${company.trustBarriers}. ${input ? `Lead bilgisi: ${input}` : ""}`,
      "data-analytics": `${company.companyName} için performans analizi yap. Bütçe: ₺${company.monthlyBudget}. Hedefler: ${company.marketingGoals?.join(", ")}. ${input ? `Analiz odağı: ${input}` : ""}`,
      operations: `${company.companyName} için operasyonel optimizasyon planı. Ekip: ${company.teamSize}. Sorunlar: ${company.biggestSalesProblem}. ${input ? `Operasyon odağı: ${input}` : ""}`,
    };
    return prompts[moduleId] || input;
  };

  const getPlaceholder = () => {
    const placeholders: Record<string, Record<CompanyType, string>> = {
      "market-analysis": { dental: "İmplant hizmetinde rakip analizi...", veterinary: "Pet bakım hizmetlerinde pazar analizi...", realestate: "Lüks konut segmentinde rekabet analizi..." },
      "sales-proposal": { dental: "İmplant + zirkonyum kombine teklif...", veterinary: "Yıllık bakım paketi teklifi...", realestate: "3+1 daire satışı için alıcı teklifi..." },
      copywriting: { dental: "İmplant kampanyası Meta reklam metni...", veterinary: "Aşı sezonu sosyal medya içeriği...", realestate: "Satılık daire reklam metni..." },
      "content-planning": { dental: "Estetik diş hizmetleri içerik planı...", veterinary: "Pet sağlığı içerik takvimi...", realestate: "Portföy tanıtım içerikleri..." },
      "ad-media": { dental: "İmplant kampanyası Meta + Google planı...", veterinary: "Aşı kampanyası medya planı...", realestate: "Yeni proje lansmanı medya planı..." },
      "lead-tracking": { dental: "15 implant lead geldi, önceliklendir...", veterinary: "8 cerrahi ilgilisi var, sırala...", realestate: "20 lead değerlendirmesi yap..." },
      "data-analytics": { dental: "Son 3 ay reklam performansı...", veterinary: "Aylık muayene trendi analizi...", realestate: "Portföy dönüşüm oranı analizi..." },
      operations: { dental: "Randevu yönetimi optimizasyonu...", veterinary: "Klinik iş akışı planlaması...", realestate: "Portföy yönetim sistemi planı..." },
    };
    return placeholders[moduleId]?.[company.companyType] || "Özel isteğinizi yazın...";
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setLoadingStep(0);
    setActiveTab("result");
    setLoadingMsg(messages[0]);

    let step = 0;
    intervalRef.current = setInterval(() => {
      step = Math.min(step + 1, messages.length - 1);
      setLoadingStep(step);
      setLoadingMsg(messages[step]);
    }, 900);

    try {
      const systemPrompt = buildSystemPrompt(company);
      const userPrompt = getModulePrompt();
      const response = await callAI(systemPrompt, userPrompt, moduleId);
      setResult(response);
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoading(false);
    }
  };

  if (!moduleConfig) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${moduleConfig.color} flex items-center justify-center text-2xl`}>
            {moduleConfig.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{moduleConfig.title}</h1>
            <p className="text-white/40 text-sm mt-0.5">{moduleConfig.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 max-w-xs">
          {moduleConfig.usesData.map((d) => <Badge key={d} variant="info">{d}</Badge>)}
        </div>
      </div>

      <GlassCard className="p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50">Şirket Bağlamı Aktif</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-xs text-white/70 font-medium">{company.companyName}</span>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-xs text-white/40">{COMPANY_TYPE_CONFIG[company.companyType].label}</span>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-xs text-white/40">{company.city}</span>
          {company.monthlyBudget && (
            <>
              <div className="h-3 w-px bg-white/10" />
              <span className="text-xs text-white/40">₺{company.monthlyBudget}/ay</span>
            </>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Analiz Parametresi</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all resize-none text-sm"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-white/30">Boş bırakırsan AI şirket profilini baz alarak analiz yapar</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              loading
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : `bg-gradient-to-r ${moduleConfig.color} text-white hover:opacity-90 shadow-lg`
            }`}
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Analiz ediliyor...</span>
              </>
            ) : (
              <>
                <span>🤖</span>
                <span>AI Analizi Başlat</span>
              </>
            )}
          </button>
        </div>
      </GlassCard>

      {loading && (
        <GlassCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${moduleConfig.color} flex items-center justify-center`}>
                <Spinner size="sm" />
              </div>
              <div>
                <div className="text-white font-medium text-sm">AI Analizi Çalışıyor</div>
                <div className="text-white/40 text-xs">{loadingMsg}</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                    i < loadingStep ? "text-emerald-400" : i === loadingStep ? "text-white" : "text-white/20"
                  }`}
                >
                  <span>{i < loadingStep ? "✓" : i === loadingStep ? "►" : "○"}</span>
                  {msg}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {result && !loading && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {([
              { id: "result", label: "Sonuç", icon: "📋" },
              { id: "reasoning", label: "Analiz Mantığı", icon: "🧠" },
              { id: "actions", label: "Sonraki Adımlar", icon: "🚀" },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "result" && (
            <GlassCard className="p-6">
              <div
                className="text-white/80 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(result.result) }}
              />
            </GlassCard>
          )}

          {activeTab === "reasoning" && (
            <div className="space-y-4">
              <GlassCard className="p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><span>🧠</span> Karar Özeti</h3>
                <p className="text-white/60 text-sm leading-relaxed">{result.reasoning_summary}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><span>📌</span> Yapılan Varsayımlar</h3>
                <div className="space-y-2">
                  {result.assumptions.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 text-xs mt-0.5">{i + 1}.</span>
                      <span className="text-white/60 text-sm">{a}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
              <GlassCard className="p-5">
                <ConfidenceBar value={result.confidence} />
              </GlassCard>
            </div>
          )}

          {activeTab === "actions" && (
            <GlassCard className="p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><span>🚀</span> Önerilen Sonraki Adımlar</h3>
              <div className="space-y-3">
                {result.next_actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                    <span className="text-white/70 text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm flex items-center gap-2"
            >
              🔄 Yeniden Üret
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [appState, setAppState] = useState<"login" | "onboarding" | "dashboard">("login");
  const [company, setCompany] = useState<CompanyContext | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");

  if (appState === "login") {
    return <LoginPage onLogin={() => setAppState("onboarding")} />;
  }

  if (appState === "onboarding") {
    return (
      <OnboardingWizard
        onComplete={(c) => {
          setCompany(c);
          setAppState("dashboard");
          setActivePage("dashboard");
        }}
      />
    );
  }

  if (!company) return null;

  return (
    <div className="min-h-screen bg-[#0A0D1A] flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} company={company} />
      <div className="ml-64 flex-1 min-h-screen">
        <div className="sticky top-0 z-40 bg-[#0A0D1A]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <h1 className="text-white font-semibold text-sm">
            {activePage === "dashboard"
              ? "Ana Dashboard"
              : MODULE_CONFIG.find((m) => m.id === activePage)?.title || activePage}
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">AI Aktif</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              {company.companyName?.charAt(0) || "A"}
            </div>
          </div>
        </div>
        <div className="p-8">
          {activePage === "dashboard" ? (
            <Dashboard company={company} onNavigate={setActivePage} />
          ) : (
            <ModulePage moduleId={activePage} company={company} />
          )}
        </div>
      </div>
      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}