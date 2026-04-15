"use client";

import { useState, useRef, useEffect } from "react";

// ============================================================
// TYPES
// ============================================================
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

interface Listing {
  id: string;
  title: string;
  price: string;
  location: string;
  details: string;
  url: string;
  date: string;
  imageUrl: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CompanyContext {
  companyName: string;
  city: string;
  region: string;
  website: string;
  instagram: string;
  toneOfVoice: ToneOfVoice;
  services: string[];
  servicePrices: ServicePrice[];
  targetClientProfile: string;
  competitors: string;
  monthlyBudget: string;
  sahibindenUrl: string;
  competitorUrls: string;
  marketingGoals: MarketingGoal[];
  targetAgeRange: string;
  incomeLevel: string;
  interests: string;
  decisionMotivations: string;
  trustBarriers: string;
  regionalFocus: string;
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
  | "visual-design"
  | "listing-scraper"
  | "ai-consultant";

// ============================================================
// CONSTANTS
// ============================================================
const REAL_ESTATE_SERVICES = [
  "Satılık Daire",
  "Kiralık Daire",
  "Satılık Villa",
  "Arsa",
  "Lüks Konut",
  "Ticari Gayrimenkul",
  "Yatırım Danışmanlığı",
  "Proje Satışı",
  "Değerleme",
  "Mortgage Danışmanlığı",
];

const MODULE_CONFIG = [
  {
    id: "listing-scraper",
    title: "İlan Analiz Ajanı",
    icon: "🏠",
    description: "Sahibinden ilanlarını çek, AI ile analiz et",
    color: "from-amber-600 to-orange-600",
    usesData: ["Sahibinden URL", "Rakip ilanlar", "Fiyat analizi"],
    isNew: true,
  },
  {
    id: "ai-consultant",
    title: "AI Emlak Danışmanı",
    icon: "💬",
    description: "İlanların hakkında müşterilerle sohbet et",
    color: "from-emerald-600 to-teal-600",
    usesData: ["Aktif ilanlar", "Müşteri profili", "Fiyat bilgisi"],
    isNew: true,
  },
  {
    id: "market-analysis",
    title: "Pazar & Rakip Analizi",
    icon: "📊",
    description: "Rekabet haritası ve konumlandırma analizi",
    color: "from-blue-600 to-indigo-600",
    usesData: ["Rakipler", "Bölge", "Fiyat aralıkları"],
    isNew: false,
  },
  {
    id: "sales-proposal",
    title: "Satış & Teklif Hazırlama",
    icon: "📝",
    description: "Alıcıya özel teklif ve portföy dokümanları",
    color: "from-violet-600 to-purple-600",
    usesData: ["Portföy", "Alıcı profili", "Fiyatlar"],
    isNew: false,
  },
  {
    id: "content-planning",
    title: "Stratejik İçerik Planı",
    icon: "📅",
    description: "Emlak odaklı aylık içerik takvimi",
    color: "from-orange-600 to-amber-600",
    usesData: ["Hedefler", "Platformlar", "Marka tonu"],
    isNew: false,
  },
  {
    id: "copywriting",
    title: "Metin Yazarı & Kreatif",
    icon: "✍️",
    description: "İlan metinleri, reklam kopyaları",
    color: "from-pink-600 to-rose-600",
    usesData: ["Marka tonu", "Hedef kitle", "Portföy"],
    isNew: false,
  },
  {
    id: "ad-media",
    title: "Reklam & Medya Planı",
    icon: "📢",
    description: "Bütçe optimizasyonu ve kampanya planı",
    color: "from-cyan-600 to-sky-600",
    usesData: ["Bütçe", "Platformlar", "Hedefler"],
    isNew: false,
  },
  {
    id: "lead-tracking",
    title: "Lead Takip Ajanı",
    icon: "🎯",
    description: "Alıcı skorlama ve dönüşüm önerileri",
    color: "from-teal-600 to-green-600",
    usesData: ["Alıcı profili", "Güven bariyerleri"],
    isNew: false,
  },
  {
    id: "visual-design",
    title: "Görsel Tasarım & Üretim",
    icon: "🎨",
    description: "AI ile emlak görselleri üret",
    color: "from-fuchsia-600 to-pink-600",
    usesData: ["Marka tonu", "Platformlar", "Brief"],
    isNew: false,
  },
];

const LOADING_MESSAGES: Record<string, string[]> = {
  "market-analysis": [
    "Bölgesel pazar sinyalleri yorumlanıyor...",
    "Rakip portföyler analiz ediliyor...",
    "Fiyat trendleri değerlendiriliyor...",
    "Pazar fırsatları haritalanıyor...",
    "Rapor hazırlanıyor...",
  ],
  "sales-proposal": [
    "Alıcı profili analiz ediliyor...",
    "Portföy eşleştirmesi yapılıyor...",
    "Değer önerisi oluşturuluyor...",
    "Teklif dokümanı hazırlanıyor...",
    "Son düzenlemeler yapılıyor...",
  ],
  "content-planning": [
    "Emlak trendleri analiz ediliyor...",
    "Platform bazlı takvim oluşturuluyor...",
    "Mevsimsel fırsatlar değerlendiriliyor...",
    "İçerik mix optimize ediliyor...",
    "Takvim finalize ediliyor...",
  ],
  copywriting: [
    "Marka tonu kalibre ediliyor...",
    "Alıcı dili profili analiz ediliyor...",
    "İlan metinleri oluşturuluyor...",
    "Reklam kopyaları yazılıyor...",
    "Ton uyumu kontrol ediliyor...",
  ],
  "ad-media": [
    "Bütçe dağılımı optimize ediliyor...",
    "Platform ROI karşılaştırması yapılıyor...",
    "Hedef kitle potansiyeli hesaplanıyor...",
    "Kampanya takvimi planlanıyor...",
    "Medya planı finalize ediliyor...",
  ],
  "lead-tracking": [
    "Alıcı profilleri analiz ediliyor...",
    "Dönüşüm olasılıkları hesaplanıyor...",
    "Önceliklendirme matrisi oluşturuluyor...",
    "Takip aksiyonları kişiselleştiriliyor...",
    "Lead skoru güncelleniyor...",
  ],
  "visual-design": [
    "Marka kimliği analiz ediliyor...",
    "Görsel direktifler oluşturuluyor...",
    "Platform kompozisyonu ayarlanıyor...",
    "AI görsel üretiliyor...",
    "Son düzenlemeler yapılıyor...",
  ],
  "listing-scraper": [
    "Sahibinden sayfası yükleniyor...",
    "İlanlar tespit ediliyor...",
    "Fiyatlar ve detaylar çekiliyor...",
    "AI analizi başlatılıyor...",
    "Rapor hazırlanıyor...",
  ],
};

// ============================================================
// AI SERVICE
// ============================================================
const buildSystemPrompt = (company: CompanyContext): string => {
  return `Sen Adcomio'nun gelişmiş AI analiz sisteminin uzman emlak ajanısın.
Aşağıdaki emlak ofisi için çalışıyorsun:

ŞİRKET PROFİLİ:
- Firma Adı: ${company.companyName}
- Şehir/Bölge: ${company.city} - ${company.region}
- Marka Tonu: ${company.toneOfVoice}
- Aylık Reklam Bütçesi: ${company.monthlyBudget} TL
- Sahibinden Profil: ${company.sahibindenUrl || "Belirtilmedi"}

PORTFÖY VE FİYATLAR:
${company.servicePrices?.map((s) => `- ${s.name}: ${s.price} TL${s.isTopService ? " [EN KARLI]" : ""}${s.isPriority ? " [ÖNCELİKLİ]" : ""}`).join("\n") || "Belirtilmedi"}

HEDEF KİTLE:
- Profil: ${company.targetClientProfile}
- Gelir Seviyesi: ${company.incomeLevel}
- Güven Bariyerleri: ${company.trustBarriers}

PAZARLAMA:
- Hedefler: ${company.marketingGoals?.join(", ")}
- Rakipler: ${company.competitors}
- En Büyük Satış Sorunu: ${company.biggestSalesProblem}

ÖNEMLİ: Tüm analizler emlak sektörüne özgün olsun. Türkçe, profesyonel yanıt ver.`;
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
    return await response.json();
  } catch {
    return generateMockResult(moduleId);
  }
};

const generateMockResult = (moduleId: string): ModuleResult => ({
  result: `## ${MODULE_CONFIG.find((m) => m.id === moduleId)?.title || "Analiz"} Sonucu\n\nAI analizi tamamlandı. Şirket verileriniz baz alınarak sonuç üretildi.`,
  reasoning_summary: "Şirket bağlamı ve sektörel veriler değerlendirilerek analiz tamamlandı.",
  assumptions: ["Piyasa verileri güncellendi", "Bölgesel trendler dikkate alındı", "Rakip konumlanması değerlendirildi"],
  confidence: 80,
  next_actions: ["Sonucu incele", "Ekiple paylaş", "Uygulama planı oluştur"],
});

// ============================================================
// UI COMPONENTS
// ============================================================
const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <div className={`${sizes[size]} border-2 border-white/30 border-t-white rounded-full animate-spin`} />
  );
};

const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "new";
}) => {
  const variants = {
    default: "bg-white/10 text-white/80",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    info: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    new: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const ConfidenceBar = ({ value }: { value: number }) => {
  const color = value >= 85 ? "from-emerald-500 to-teal-500" : value >= 70 ? "from-amber-500 to-yellow-500" : "from-red-500 to-rose-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/50">Güven Seviyesi</span>
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
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

const ProgressStep = ({ step, total }: { step: number; current: number; total: number }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="flex items-center">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 < step ? "bg-emerald-500 text-white" : i + 1 === step ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white ring-2 ring-indigo-400/50" : "bg-white/10 text-white/30"}`}>
          {i + 1 < step ? "✓" : i + 1}
        </div>
        {i < total - 1 && <div className={`w-4 h-0.5 mx-0.5 ${i + 1 < step ? "bg-emerald-500" : "bg-white/10"}`} />}
      </div>
    ))}
    <span className="ml-2 text-sm text-white/50">{step}/{total}</span>
  </div>
);

const formatMarkdown = (text: string): string => {
  return text
    .replace(/## (.*?)(\n|$)/g, '<h2 class="text-white font-bold text-base mt-4 mb-2">$1</h2>')
    .replace(/### (.*?)(\n|$)/g, '<h3 class="text-white/90 font-semibold text-sm mt-3 mb-1.5">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-white/70">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-indigo-300 text-xs">$1</code>')
    .replace(/^\| (.*) \|$/gm, (match) => {
      if (match.includes("---")) return "";
      const cells = match.slice(2, -2).split(" | ").map((cell) => `<td class="px-3 py-1.5 text-white/60 text-xs border-b border-white/5">${cell}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, (match) => `<div class="overflow-x-auto my-3"><table class="w-full border-collapse"><tbody>${match}</tbody></table></div>`)
    .replace(/^- (.*?)$/gm, '<li class="text-white/60 text-sm ml-4 list-disc">$1</li>')
    .replace(/(<li[\s\S]*?<\/li>\n?)+/g, (match) => `<ul class="space-y-1 my-2">${match}</ul>`)
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
};

// ============================================================
// LOGIN
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-violet-500/30">
              A
            </div>
            <span className="text-3xl font-black text-white tracking-tight">adcomio</span>
          </div>
          <p className="text-white/40 text-sm">AI-Powered Real Estate Intelligence</p>
        </div>
        <GlassCard className="p-8">
          <h2 className="text-xl font-bold text-white mb-6">Demo Girişi</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@emlakofisi.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 disabled:opacity-50"
            >
              {loading ? <><Spinner size="sm" /><span>Giriş yapılıyor...</span></> : "Demo'ya Başla →"}
            </button>
          </form>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-white/30 text-center">Demo hesabı: herhangi bir bilgi girin</p>
          </div>
        </GlassCard>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[{ icon: "🏢", label: "Emlak AI" }, { icon: "🏠", label: "İlan Analizi" }, { icon: "💬", label: "AI Danışman" }].map((f) => (
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
// ONBOARDING
// ============================================================
const OnboardingWizard = ({ onComplete }: { onComplete: (company: CompanyContext) => void }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [company, setCompany] = useState<Partial<CompanyContext>>({
    services: [],
    marketingGoals: [],
    servicePrices: [],
    packages: [],
    hasInstagram: false,
    hasGoogleAds: false,
    hasMetaAds: false,
    hasLinkedIn: false,
    sahibindenUrl: "",
    competitorUrls: "",
  });

  const update = (key: keyof CompanyContext, value: unknown) => {
    setCompany((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!(company.companyName && company.city);
      case 2: return !!(company.servicePrices && company.servicePrices.length > 0);
      case 3: return !!(company.marketingGoals && company.marketingGoals.length > 0);
      case 4: return !!company.targetAgeRange;
      case 5: return !!company.teamSize;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-black text-white">A</div>
            <span className="text-xl font-black text-white">adcomio</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Emlak Ofisinizi Tanımlayın</h1>
          <p className="text-white/40 text-sm">AI ajanlar ofisinize özel çalışsın</p>
        </div>

        <div className="flex justify-center mb-6">
          <ProgressStep step={step} current={step} total={totalSteps} />
        </div>

        <GlassCard className="p-8">
          {/* STEP 1: Temel Bilgiler */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Ofis Bilgileri</h2>
                <p className="text-white/40 text-sm">Temel kimlik ve lokasyon</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Firma / Marka Adı *</label>
                  <input value={company.companyName || ""} onChange={(e) => update("companyName", e.target.value)} placeholder="Güven Emlak" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Şehir *</label>
                  <input value={company.city || ""} onChange={(e) => update("city", e.target.value)} placeholder="İstanbul" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">İlçe / Bölge</label>
                  <input value={company.region || ""} onChange={(e) => update("region", e.target.value)} placeholder="Kadıköy" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Sahibinden Profil Linki</label>
                  <input value={company.sahibindenUrl || ""} onChange={(e) => update("sahibindenUrl", e.target.value)} placeholder="https://www.sahibinden.com/magaza/..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Rakip Firma Linkleri (virgülle ayır)</label>
                  <input value={company.competitorUrls || ""} onChange={(e) => update("competitorUrls", e.target.value)} placeholder="https://sahibinden.com/magaza/rakip1, ..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Marka Tonu</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["kurumsal", "samimi", "premium", "ulasilabilir"] as ToneOfVoice[]).map((tone) => (
                      <button key={tone} onClick={() => update("toneOfVoice", tone)} className={`py-2 px-2 rounded-lg text-xs capitalize transition-all ${company.toneOfVoice === tone ? "bg-violet-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                        {tone === "ulasilabilir" ? "ulaşılabilir" : tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Portföy ve Fiyatlar */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Portföy ve Fiyat Aralıkları</h2>
                <p className="text-white/40 text-sm">AI bu fiyatları tüm modüllerde kullanacak</p>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {REAL_ESTATE_SERVICES.map((service) => {
                  const existing = company.servicePrices?.find((s) => s.name === service);
                  const isSelected = !!existing;
                  return (
                    <div key={service} className={`p-3 rounded-xl border transition-all ${isSelected ? "border-violet-500/50 bg-violet-500/5" : "border-white/10"}`}>
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
                          className={`w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 ${isSelected ? "bg-violet-500 text-white" : "bg-white/10 text-transparent"}`}
                        >✓</button>
                        <span className="text-white text-sm flex-1">{service}</span>
                        {isSelected && (
                          <>
                            <input
                              value={existing?.price || ""}
                              onChange={(e) => {
                                const prices = (company.servicePrices || []).map((s) => s.name === service ? { ...s, price: e.target.value } : s);
                                update("servicePrices", prices);
                              }}
                              placeholder="Min ₺"
                              className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs placeholder-white/20 focus:outline-none"
                            />
                            <button onClick={() => { const prices = (company.servicePrices || []).map((s) => s.name === service ? { ...s, isTopService: !s.isTopService } : s); update("servicePrices", prices); }} className={`text-xs px-2 py-1 rounded ${existing?.isTopService ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-white/30"}`}>Kârlı</button>
                            <button onClick={() => { const prices = (company.servicePrices || []).map((s) => s.name === service ? { ...s, isPriority: !s.isPriority } : s); update("servicePrices", prices); }} className={`text-xs px-2 py-1 rounded ${existing?.isPriority ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/30"}`}>Öncelikli</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Hedef Alıcı Profili</label>
                  <input value={company.targetClientProfile || ""} onChange={(e) => update("targetClientProfile", e.target.value)} placeholder="Yatırımcı, aile, genç çift..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Aylık Reklam Bütçesi (₺)</label>
                  <input value={company.monthlyBudget || ""} onChange={(e) => update("monthlyBudget", e.target.value)} placeholder="20000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Rakip Firma İsimleri</label>
                  <input value={company.competitors || ""} onChange={(e) => update("competitors", e.target.value)} placeholder="ABC Emlak, XYZ Gayrimenkul..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Hedefler */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Pazarlama Hedefleri</h2>
                <p className="text-white/40 text-sm">Birden fazla seçebilirsiniz</p>
              </div>
              <div className="grid gap-3">
                {[
                  { id: "lead", label: "Lead Toplamak", desc: "Potansiyel alıcı bilgilerini topla", icon: "🎯" },
                  { id: "awareness", label: "Marka Bilinirliği", desc: "Bölgede tanınırlık artır", icon: "📢" },
                  { id: "appointment", label: "Görüşme Almak", desc: "Gayrimenkul gezisi ve randevu", icon: "📅" },
                  { id: "sales", label: "Satış Kapatmak", desc: "Portföyü hızlı sat", icon: "💰" },
                  { id: "portfolio", label: "Portföy Talebi Artırmak", desc: "Yeni mülk sahiplerini çek", icon: "🏢" },
                ].map((goal) => {
                  const isSelected = (company.marketingGoals || []).includes(goal.id as MarketingGoal);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => {
                        const goals = company.marketingGoals || [];
                        update("marketingGoals", isSelected ? goals.filter((g) => g !== goal.id) : [...goals, goal.id as MarketingGoal]);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-white/20"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{goal.icon}</span>
                        <div>
                          <div className="text-white font-medium">{goal.label}</div>
                          <div className="text-white/40 text-xs">{goal.desc}</div>
                        </div>
                        {isSelected && <div className="ml-auto w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs">✓</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Hedef Kitle */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Hedef Kitle</h2>
                <p className="text-white/40 text-sm">AI mesaj tonunu buna göre ayarlayacak</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Yaş Aralığı *</label>
                  <select value={company.targetAgeRange || ""} onChange={(e) => update("targetAgeRange", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50">
                    <option value="" className="bg-gray-900">Seç</option>
                    <option value="25-35" className="bg-gray-900">25-35</option>
                    <option value="35-50" className="bg-gray-900">35-50</option>
                    <option value="50+" className="bg-gray-900">50+</option>
                    <option value="Tüm yaşlar" className="bg-gray-900">Tüm yaşlar</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Gelir Seviyesi</label>
                  <select value={company.incomeLevel || ""} onChange={(e) => update("incomeLevel", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50">
                    <option value="" className="bg-gray-900">Seç</option>
                    <option value="Orta gelir" className="bg-gray-900">Orta gelir</option>
                    <option value="Üst-orta gelir" className="bg-gray-900">Üst-orta gelir</option>
                    <option value="Yüksek gelir" className="bg-gray-900">Yüksek gelir</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Güven Bariyerleri</label>
                  <input value={company.trustBarriers || ""} onChange={(e) => update("trustBarriers", e.target.value)} placeholder="Fiyat şeffaflığı, tapu güvencesi, referans..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">Karar Verme Motivasyonları</label>
                  <input value={company.decisionMotivations || ""} onChange={(e) => update("decisionMotivations", e.target.value)} placeholder="Yatırım getirisi, konum, okul yakınlığı..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Platformlar */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Dijital Varlık ve Ekip</h2>
                <p className="text-white/40 text-sm">Mevcut platformlar ve ekip bilgisi</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "hasInstagram", label: "Instagram", icon: "📸" },
                  { key: "hasGoogleAds", label: "Google Ads", icon: "🔍" },
                  { key: "hasMetaAds", label: "Meta Ads", icon: "📘" },
                  { key: "hasLinkedIn", label: "LinkedIn", icon: "💼" },
                ].map((p) => {
                  const isOn = company[p.key as keyof CompanyContext] as boolean;
                  return (
                    <button key={p.key} onClick={() => update(p.key as keyof CompanyContext, !isOn)} className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${isOn ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-white/20"}`}>
                      <span>{p.icon}</span>
                      <span className="text-white text-sm">{p.label}</span>
                      {isOn && <span className="ml-auto text-violet-400 text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Ekip Büyüklüğü *</label>
                  <select value={company.teamSize || ""} onChange={(e) => update("teamSize", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50">
                    <option value="" className="bg-gray-900">Seç</option>
                    <option value="Solo / 1 kişi" className="bg-gray-900">Solo / 1 kişi</option>
                    <option value="2-5 kişi" className="bg-gray-900">2-5 kişi</option>
                    <option value="6-15 kişi" className="bg-gray-900">6-15 kişi</option>
                    <option value="15+ kişi" className="bg-gray-900">15+ kişi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">İçerik Sıklığı</label>
                  <select value={company.contentFrequency || ""} onChange={(e) => update("contentFrequency", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50">
                    <option value="" className="bg-gray-900">Seç</option>
                    <option value="Hiç yok" className="bg-gray-900">Hiç yok</option>
                    <option value="Haftada 1" className="bg-gray-900">Haftada 1</option>
                    <option value="Haftada 3+" className="bg-gray-900">Haftada 3+</option>
                    <option value="Her gün" className="bg-gray-900">Her gün</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/50 mb-1.5 block">En Büyük Satış Sorunu</label>
                  <input value={company.biggestSalesProblem || ""} onChange={(e) => update("biggestSalesProblem", e.target.value)} placeholder="Lead gelmiyor, fiyat itirazı, portföy dönmüyor..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Özet */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Hazır! 🎉</h2>
                <p className="text-white/40 text-sm">AI ajanlar bu verilerle çalışmaya başlayacak</p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-white/50">Firma: <span className="text-white font-medium">{company.companyName}</span></div>
                  <div className="text-white/50">Şehir: <span className="text-white font-medium">{company.city}</span></div>
                  <div className="text-white/50">Portföy: <span className="text-white font-medium">{company.servicePrices?.length || 0} tip</span></div>
                  <div className="text-white/50">Bütçe: <span className="text-white font-medium">₺{company.monthlyBudget || "—"}</span></div>
                  <div className="text-white/50">Ekip: <span className="text-white font-medium">{company.teamSize || "—"}</span></div>
                  <div className="text-white/50">Hedef: <span className="text-white font-medium">{company.marketingGoals?.length || 0} adet</span></div>
                </div>
                {company.sahibindenUrl && (
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-white/50 text-xs">Sahibinden Profili:</div>
                    <div className="text-violet-400 text-xs truncate">{company.sahibindenUrl}</div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "🏠", label: "İlan Analizi", desc: "Sahibinden ilanlarını analiz et" },
                  { icon: "💬", label: "AI Danışman", desc: "İlanlar hakkında sohbet et" },
                  { icon: "📊", label: "9 Modül", desc: "Tüm pazarlama araçları" },
                ].map((f) => (
                  <div key={f.label} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <div className="text-white text-xs font-medium">{f.label}</div>
                    <div className="text-white/30 text-xs mt-0.5">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NAV */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
            <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="px-5 py-2.5 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 text-sm">
              ← Geri
            </button>
            {step < totalSteps ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-30 text-sm shadow-lg shadow-violet-500/25">
                Devam Et →
              </button>
            ) : (
              <button onClick={() => onComplete(company as CompanyContext)} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-all text-sm shadow-lg shadow-emerald-500/25">
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
const Sidebar = ({ activePage, onNavigate, company }: { activePage: ActivePage; onNavigate: (page: ActivePage) => void; company: CompanyContext }) => {
  const navItems = [
    { id: "dashboard" as ActivePage, icon: "🏠", label: "Dashboard" },
    ...MODULE_CONFIG.map((m) => ({ id: m.id as ActivePage, icon: m.icon, label: m.title, isNew: m.isNew })),
  ];

  return (
    <div className="w-64 h-screen bg-[#080B14] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-black text-white">A</div>
          <div>
            <div className="text-white font-bold text-sm">adcomio</div>
            <div className="text-white/30 text-xs">Emlak AI Platform</div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-b border-white/5">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏢</span>
            <div>
              <div className="text-white text-xs font-semibold truncate">{company.companyName}</div>
              <div className="text-white/50 text-xs">{company.city} · Emlak</div>
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${activePage === item.id ? "bg-violet-500/20 text-white border border-violet-500/30" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="truncate text-xs font-medium flex-1">{item.label}</span>
            {"isNew" in item && item.isNew && <Badge variant="new">Yeni</Badge>}
            {activePage === item.id && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="text-xs text-white/20 text-center">Demo v2.0 · {company.city}</div>
      </div>
    </div>
  );
};

// ============================================================
// LISTING SCRAPER MODULE
// ============================================================
const ListingScraperModule = ({ company }: { company: CompanyContext }) => {
  const [url, setUrl] = useState(company.sahibindenUrl || "");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [analysis, setAnalysis] = useState<ModuleResult | null>(null);
  const [activeTab, setActiveTab] = useState<"listings" | "analysis">("listings");
  const [scraped, setScraped] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadingMessages = [
    "Sahibinden sayfası yükleniyor...",
    "İlanlar tespit ediliyor...",
    "Fiyatlar ve detaylar çekiliyor...",
    "AI analizi başlatılıyor...",
    "Rapor hazırlanıyor...",
  ];

  const handleScrape = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setListings([]);
    setAnalysis(null);
    setScraped(false);

    let step = 0;
    setLoadingMsg(loadingMessages[0]);
    intervalRef.current = setInterval(() => {
      step = Math.min(step + 1, loadingMessages.length - 1);
      setLoadingMsg(loadingMessages[step]);
    }, 1200);

    try {
      // Scraping dene
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const scrapeData = await scrapeRes.json();
      let fetchedListings: Listing[] = scrapeData.listings || [];

      // Eğer scraping çalışmadıysa demo ilanlar ekle
      if (fetchedListings.length === 0) {
        fetchedListings = generateDemoListings(company);
      }

      setListings(fetchedListings);

      // AI analizi
      const systemPrompt = buildSystemPrompt(company);
      const userPrompt = `Aşağıdaki emlak ilanlarını analiz et:

${fetchedListings.slice(0, 8).map((l, i) => `${i + 1}. ${l.title} - ${l.price} - ${l.location} - ${l.details}`).join("\n")}

Şunları değerlendir:
- Genel fiyat analizi ve pazar pozisyonu
- En güçlü ilanlar ve neden
- Zayıf noktalar ve iyileştirme önerileri
- Rakiplerle karşılaştırma
- Hangi ilanlar önce satılır ve neden
- İlan başlığı ve açıklama optimizasyon önerileri`;

      const aiResult = await callAI(systemPrompt, userPrompt, "listing-scraper");
      setAnalysis(aiResult);
      setScraped(true);
      setActiveTab("listings");
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-2xl">🏠</div>
        <div>
          <h1 className="text-xl font-bold text-white">İlan Analiz Ajanı</h1>
          <p className="text-white/40 text-sm mt-0.5">Sahibinden ilanlarını çek, AI ile analiz et</p>
        </div>
        <Badge variant="new">Yeni</Badge>
      </div>

      <GlassCard className="p-5">
        <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Sahibinden Profil veya Arama Linki</label>
        <div className="flex gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.sahibinden.com/magaza/... veya arama linki"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
          />
          <button
            onClick={handleScrape}
            disabled={loading || !url.trim()}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 flex-shrink-0 ${loading || !url.trim() ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:opacity-90 shadow-lg"}`}
          >
            {loading ? <><Spinner size="sm" /><span>Yükleniyor</span></> : <><span>🔍</span><span>İlanları Çek</span></>}
          </button>
        </div>
        <p className="text-xs text-white/30 mt-2">
          Sahibinden bot koruması nedeniyle ilanlar yüklenemezse sistem otomatik demo verisi oluşturur
        </p>
      </GlassCard>

      {loading && (
        <GlassCard className="p-5">
          <div className="space-y-3">
            {loadingMessages.map((msg, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs transition-all ${loadingMessages.indexOf(loadingMsg) > i ? "text-emerald-400" : loadingMsg === msg ? "text-white" : "text-white/20"}`}>
                <span>{loadingMessages.indexOf(loadingMsg) > i ? "✓" : loadingMsg === msg ? "►" : "○"}</span>
                {msg}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {scraped && !loading && (
        <>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab("listings")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "listings" ? "bg-white/10 text-white border border-white/20" : "text-white/40 hover:text-white/60"}`}>
              🏠 İlanlar ({listings.length})
            </button>
            <button onClick={() => setActiveTab("analysis")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "analysis" ? "bg-white/10 text-white border border-white/20" : "text-white/40 hover:text-white/60"}`}>
              🧠 AI Analizi
            </button>
          </div>

          {activeTab === "listings" && (
            <div className="grid grid-cols-2 gap-3">
              {listings.map((listing) => (
                <GlassCard key={listing.id} className="p-4">
                  <div className="space-y-2">
                    <div className="text-white font-medium text-sm leading-tight">{listing.title}</div>
                    <div className="text-emerald-400 font-bold">{listing.price}</div>
                    <div className="text-white/40 text-xs">{listing.location}</div>
                    {listing.details && <div className="text-white/30 text-xs">{listing.details}</div>}
                    {listing.date && <div className="text-white/20 text-xs">{listing.date}</div>}
                    {listing.url && listing.url !== url && (
                      <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 text-xs hover:text-violet-300 transition-colors block">
                        İlanı Gör →
                      </a>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {activeTab === "analysis" && analysis && (
            <div className="space-y-4">
              <GlassCard className="p-6">
                <div className="text-white/80 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis.result) }} />
              </GlassCard>
              <GlassCard className="p-5">
                <h3 className="text-white font-semibold mb-3">🧠 Analiz Mantığı</h3>
                <p className="text-white/60 text-sm">{analysis.reasoning_summary}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <h3 className="text-white font-semibold mb-3">🚀 Önerilen Aksiyonlar</h3>
                <div className="space-y-2">
                  {analysis.next_actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                      <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                      <span className="text-white/70 text-sm">{a}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
              <GlassCard className="p-5"><ConfidenceBar value={analysis.confidence} /></GlassCard>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Demo ilanlar (scraping çalışmazsa)
const generateDemoListings = (company: CompanyContext): Listing[] => {
  const city = company.city || "İstanbul";
  const region = company.region || "Merkez";
  return [
    { id: "1", title: `${region} Satılık 3+1 Daire`, price: "₺4.500.000", location: `${city} / ${region}`, details: "120 m² • 3+1 • 5. Kat", url: "", date: "Bugün", imageUrl: "" },
    { id: "2", title: `${region} Kiralık 2+1 Residence`, price: "₺25.000/ay", location: `${city} / ${region}`, details: "85 m² • 2+1 • Eşyalı", url: "", date: "Bugün", imageUrl: "" },
    { id: "3", title: `${region} Satılık Dubleks Villa`, price: "₺12.000.000", location: `${city} / ${region}`, details: "280 m² • 5+2 • Özel Havuz", url: "", date: "Dün", imageUrl: "" },
    { id: "4", title: `${region} Satılık 1+1 Stüdyo`, price: "₺2.200.000", location: `${city} / ${region}`, details: "52 m² • 1+1 • 2. Kat", url: "", date: "Dün", imageUrl: "" },
    { id: "5", title: `${region} Ticari Dükkan`, price: "₺8.500.000", location: `${city} / ${region}`, details: "180 m² • Cadde Üzeri", url: "", date: "2 gün önce", imageUrl: "" },
    { id: "6", title: `${region} Arsa Satılık`, price: "₺3.200.000", location: `${city} / ${region}`, details: "450 m² • İmarlı", url: "", date: "3 gün önce", imageUrl: "" },
  ];
};

// ============================================================
// AI CONSULTANT MODULE
// ============================================================
const AIConsultantModule = ({ company }: { company: CompanyContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Merhaba! Ben ${company.companyName}'ın AI emlak danışmanıyım. 🏢\n\nSize portföyümüzdeki ilanlar hakkında yardımcı olabilirim:\n\n• Bütçenize uygun daire önerisi\n• Bölge karşılaştırması\n• Yatırım değerlendirmesi\n• Randevu ve görüşme organizasyonu\n\nNasıl yardımcı olabilirim?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<Listing[]>(generateDemoListings(company));
  const [showListings, setShowListings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          listings,
          companyContext: company,
        }),
      });

      if (!response.ok) throw new Error("Chat error");
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Üzgünüm, şu an bir sorun yaşıyorum. Lütfen tekrar deneyin.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "Bütçem 5 milyon, ne önerirsiniz?",
    "Kadıköy'de kiralık daire var mı?",
    "Yatırım için en iyi seçenek hangisi?",
    "Görüşme ayarlayabilir misiniz?",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-2xl">💬</div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Emlak Danışmanı</h1>
            <p className="text-white/40 text-sm mt-0.5">İlanlar hakkında müşterilerle gerçek zamanlı sohbet</p>
          </div>
        </div>
        <button onClick={() => setShowListings(!showListings)} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-xs transition-all">
          {showListings ? "Sohbeti Gör" : `📋 ${listings.length} İlan`}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4" style={{ height: "600px" }}>
        {/* Chat */}
        <div className="col-span-2 flex flex-col">
          <GlassCard className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1">
                      🤖
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-violet-500/30 text-white rounded-br-none" : "bg-white/8 text-white/80 rounded-bl-none"}`}>
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs mr-2">🤖</div>
                  <div className="bg-white/8 px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {quickQuestions.map((q) => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Mesajınızı yazın... (Enter ile gönder)"
                  rows={2}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 resize-none text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`px-4 rounded-xl transition-all flex-shrink-0 ${loading || !input.trim() ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:opacity-90"}`}
                >
                  ↑
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Listings Panel */}
        <div className="overflow-y-auto space-y-2">
          <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Aktif İlanlar</div>
          {listings.map((listing) => (
            <GlassCard
              key={listing.id}
              className="p-3"
              onClick={() => setInput(`${listing.title} hakkında bilgi alabilir miyim?`)}
            >
              <div className="text-white text-xs font-medium leading-tight mb-1">{listing.title}</div>
              <div className="text-emerald-400 text-xs font-bold">{listing.price}</div>
              <div className="text-white/30 text-xs mt-1">{listing.location}</div>
              {listing.details && <div className="text-white/20 text-xs mt-0.5">{listing.details}</div>}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// VISUAL DESIGN MODULE
// ============================================================
const VisualDesignModule = ({ company }: { company: CompanyContext }) => {
  const [brief, setBrief] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [style, setStyle] = useState("luxury real estate photography");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<{ imageUrl: string; usedPrompt: string; dimensions: { width: number; height: number } } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadingMessages = ["Marka kimliği analiz ediliyor...", "Görsel direktifler oluşturuluyor...", "Platform kompozisyonu ayarlanıyor...", "AI görsel üretiliyor...", "Son düzenlemeler yapılıyor..."];
  const platforms = [
    { id: "instagram", label: "Instagram Feed", icon: "📸", size: "1080×1080" },
    { id: "story", label: "Story / Reels", icon: "📱", size: "1080×1920" },
    { id: "facebook", label: "Facebook Post", icon: "📘", size: "1200×630" },
    { id: "google", label: "Google Display", icon: "🔍", size: "728×90" },
  ];
  const styles = ["luxury real estate photography", "modern architecture", "aerial drone shot", "interior design", "minimalist premium", "warm family home"];

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
        body: JSON.stringify({ prompt: brief, style, platform, companyName: company.companyName, tone: company.toneOfVoice, companyType: "realestate" }),
      });
      if (!response.ok) throw new Error("Visual API error");
      const data = await response.json();
      setResult(data);
      setGenerationCount((c) => c + 1);
    } catch {
      const fallbackPrompt = encodeURIComponent(`${style}, ${brief}, luxury real estate, professional photography, high quality`);
      setResult({ imageUrl: `https://image.pollinations.ai/prompt/${fallbackPrompt}?width=1080&height=1080&nologo=true&seed=${Date.now()}`, usedPrompt: brief, dimensions: { width: 1080, height: 1080 } });
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
          <h1 className="text-xl font-bold text-white">Görsel Tasarım & Üretim</h1>
          <p className="text-white/40 text-sm mt-0.5">Emlak görselleri için AI ile brief oluştur ve görsel üret</p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-2 space-y-4">
          <GlassCard className="p-4">
            <label className="text-xs text-white/50 mb-3 block uppercase tracking-wider">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <button key={p.id} onClick={() => setPlatform(p.id)} className={`p-2.5 rounded-xl border transition-all text-left ${platform === p.id ? "border-fuchsia-500 bg-fuchsia-500/10" : "border-white/10 hover:border-white/20"}`}>
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
                <button key={s} onClick={() => setStyle(s)} className={`w-full px-3 py-2 rounded-lg text-left text-xs transition-all ${style === s ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>{s}</button>
              ))}
            </div>
          </GlassCard>
        </div>
        <div className="col-span-3 space-y-4">
          <GlassCard className="p-4">
            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Görsel Brief</label>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Modern bir rezidansın gün batımında çekilen lüks dış cephe fotoğrafı, premium atmosfer, İstanbul skyline arka plan..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-fuchsia-500/50 transition-all resize-none text-sm" />
            <button onClick={handleGenerate} disabled={loading || !brief.trim()} className={`mt-3 w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${loading || !brief.trim() ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:opacity-90 shadow-lg"}`}>
              {loading ? <><Spinner size="sm" /><span>{loadingMsg}</span></> : <><span>✨</span><span>Görsel Üret</span></>}
            </button>
          </GlassCard>
          {loading && (
            <GlassCard className="p-5">
              <div className="space-y-3">
                {loadingMessages.map((msg, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs transition-all ${i < loadingStep ? "text-emerald-400" : i === loadingStep ? "text-white" : "text-white/20"}`}>
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
                <div className="flex gap-2">
                  <Badge variant="success">{result.dimensions.width}×{result.dimensions.height}</Badge>
                  <Badge variant="info">#{generationCount}</Badge>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 min-h-48">
                {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center"><Spinner size="lg" /></div>}
                <img src={result.imageUrl} alt="AI Generated" className={`w-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`} style={{ maxHeight: "400px" }} onLoad={() => setImageLoaded(true)} onError={() => setImageLoaded(true)} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleGenerate} className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all text-sm">🔄 Yeniden Üret</button>
                <a href={result.imageUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/20 transition-all text-sm text-center">↗ Tam Boyut</a>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// GENERIC MODULE PAGE
// ============================================================
const ModulePage = ({ moduleId, company }: { moduleId: string; company: CompanyContext }) => {
  if (moduleId === "visual-design") return <VisualDesignModule company={company} />;
  if (moduleId === "listing-scraper") return <ListingScraperModule company={company} />;
  if (moduleId === "ai-consultant") return <AIConsultantModule company={company} />;

  const moduleConfig = MODULE_CONFIG.find((m) => m.id === moduleId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ModuleResult | null>(null);
  const [activeTab, setActiveTab] = useState<"result" | "reasoning" | "actions">("result");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const messages = LOADING_MESSAGES[moduleId] || ["Analiz ediliyor..."];

  const getModulePrompt = () => {
    const prompts: Record<string, string> = {
      "market-analysis": `${company.companyName} emlak ofisi için kapsamlı pazar ve rakip analizi yap. Şehir: ${company.city}, Rakipler: ${company.competitors}, Portföy: ${company.servicePrices?.map((s) => s.name).join(", ")}. ${input ? `Ek: ${input}` : ""}`,
      "sales-proposal": `${company.companyName} için alıcıya özel teklif hazırla. Portföy fiyatları: ${company.servicePrices?.map((s) => `${s.name}: ₺${s.price}`).join(", ")}. ${input ? `Alıcı talebi: ${input}` : ""}`,
      "content-planning": `${company.companyName} için aylık emlak içerik planı oluştur. Hedefler: ${company.marketingGoals?.join(", ")}, Ton: ${company.toneOfVoice}. ${input ? `Odak: ${input}` : ""}`,
      "copywriting": `${company.companyName} için emlak reklam metinleri yaz. Ton: ${company.toneOfVoice}, Hedef: ${company.targetClientProfile}. ${input ? `Tip: ${input}` : ""}`,
      "ad-media": `${company.companyName} için medya planı. Bütçe: ₺${company.monthlyBudget}/ay. ${input ? `Odak: ${input}` : ""}`,
      "lead-tracking": `${company.companyName} için alıcı lead takip sistemi. Sorun: ${company.biggestSalesProblem}. ${input ? `Lead bilgisi: ${input}` : ""}`,
    };
    return prompts[moduleId] || input || "Genel analiz yap";
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
      const result = await callAI(buildSystemPrompt(company), getModulePrompt(), moduleId);
      setResult(result);
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
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${moduleConfig.color} flex items-center justify-center text-2xl`}>{moduleConfig.icon}</div>
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
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-white/50">Bağlam Aktif</span></div>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-white/70 font-medium">{company.companyName}</span>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-white/40">{company.city} Emlak</span>
          {company.monthlyBudget && <><div className="h-3 w-px bg-white/10" /><span className="text-white/40">₺{company.monthlyBudget}/ay</span></>}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Analiz Parametresi</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Özel isteğinizi yazın veya boş bırakın..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all resize-none text-sm" />
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-white/30">Boş bırakırsan AI şirket profilini baz alır</p>
          <button onClick={handleGenerate} disabled={loading} className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${loading ? "bg-white/10 text-white/40 cursor-not-allowed" : `bg-gradient-to-r ${moduleConfig.color} text-white hover:opacity-90 shadow-lg`}`}>
            {loading ? <><Spinner size="sm" /><span>Analiz ediliyor...</span></> : <><span>🤖</span><span>AI Analizi Başlat</span></>}
          </button>
        </div>
      </GlassCard>

      {loading && (
        <GlassCard className="p-5">
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs transition-all ${i < loadingStep ? "text-emerald-400" : i === loadingStep ? "text-white" : "text-white/20"}`}>
                <span>{i < loadingStep ? "✓" : i === loadingStep ? "►" : "○"}</span>{msg}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {result && !loading && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {([{ id: "result", label: "Sonuç", icon: "📋" }, { id: "reasoning", label: "Analiz Mantığı", icon: "🧠" }, { id: "actions", label: "Aksiyonlar", icon: "🚀" }] as const).map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white/10 text-white border border-white/20" : "text-white/40 hover:text-white/60"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          {activeTab === "result" && <GlassCard className="p-6"><div className="text-white/80 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(result.result) }} /></GlassCard>}
          {activeTab === "reasoning" && (
            <div className="space-y-4">
              <GlassCard className="p-5"><h3 className="text-white font-semibold mb-3">🧠 Karar Özeti</h3><p className="text-white/60 text-sm">{result.reasoning_summary}</p></GlassCard>
              <GlassCard className="p-5">
                <h3 className="text-white font-semibold mb-3">📌 Varsayımlar</h3>
                <div className="space-y-2">{result.assumptions.map((a, i) => <div key={i} className="flex gap-2"><span className="text-violet-400 text-xs mt-0.5">{i + 1}.</span><span className="text-white/60 text-sm">{a}</span></div>)}</div>
              </GlassCard>
              <GlassCard className="p-5"><ConfidenceBar value={result.confidence} /></GlassCard>
            </div>
          )}
          {activeTab === "actions" && (
            <GlassCard className="p-5">
              <h3 className="text-white font-semibold mb-4">🚀 Sonraki Adımlar</h3>
              <div className="space-y-3">{result.next_actions.map((a, i) => <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5"><div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div><span className="text-white/70 text-sm">{a}</span></div>)}</div>
            </GlassCard>
          )}
          <div className="flex justify-end"><button onClick={handleGenerate} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all text-sm">🔄 Yeniden Üret</button></div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================
const Dashboard = ({ company, onNavigate }: { company: CompanyContext; onNavigate: (page: ActivePage) => void }) => (
  <div className="space-y-6">
    <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-white/10 relative overflow-hidden">
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="text-3xl">🏢</span><Badge variant="success">AI Aktif</Badge></div>
            <h1 className="text-2xl font-bold text-white mb-1">{company.companyName}</h1>
            <p className="text-white/50 text-sm">Emlak Ofisi · {company.city}{company.region ? ` / ${company.region}` : ""} · {company.teamSize}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/30 mb-1">Aylık Bütçe</div>
            <div className="text-2xl font-bold text-white">₺{company.monthlyBudget || "—"}</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-5">
          {[
            { label: "Portföy Tipi", value: company.servicePrices?.length || 0, icon: "🏠" },
            { label: "Aktif Platform", value: [company.hasInstagram, company.hasGoogleAds, company.hasMetaAds, company.hasLinkedIn].filter(Boolean).length, icon: "📱" },
            { label: "Hedef", value: company.marketingGoals?.length || 0, icon: "🎯" },
            { label: "AI Modülü", value: 11, icon: "🤖" },
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

    {/* Yeni Modüller */}
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Öne Çıkan Modüller</h2>
        <Badge variant="new">Yeni</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {MODULE_CONFIG.filter((m) => m.isNew).map((module) => (
          <GlassCard key={module.id} className="p-5 group" onClick={() => onNavigate(module.id as ActivePage)}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-2xl`}>{module.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">{module.title}</h3>
                  <Badge variant="new">Yeni</Badge>
                </div>
                <p className="text-white/40 text-sm">{module.description}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">Başla →</div>
          </GlassCard>
        ))}
      </div>
    </div>

    {/* Tüm Modüller */}
    <div>
      <h2 className="text-sm font-semibold text-white/50 mb-4 uppercase tracking-wider">Tüm AI Modülleri</h2>
      <div className="grid grid-cols-3 gap-3">
        {MODULE_CONFIG.filter((m) => !m.isNew).map((module) => (
          <GlassCard key={module.id} className="p-4 group" onClick={() => onNavigate(module.id as ActivePage)}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-lg mb-3`}>{module.icon}</div>
            <h3 className="text-white font-medium text-sm mb-1">{module.title}</h3>
            <p className="text-white/30 text-xs">{module.description}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  </div>
);

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [appState, setAppState] = useState<"login" | "onboarding" | "dashboard">("login");
  const [company, setCompany] = useState<CompanyContext | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");

  if (appState === "login") return <LoginPage onLogin={() => setAppState("onboarding")} />;
  if (appState === "onboarding") return <OnboardingWizard onComplete={(c) => { setCompany(c); setAppState("dashboard"); }} />;
  if (!company) return null;

  return (
    <div className="min-h-screen bg-[#0A0D1A] flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} company={company} />
      <div className="ml-64 flex-1 min-h-screen">
        <div className="sticky top-0 z-40 bg-[#0A0D1A]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <h1 className="text-white font-semibold text-sm">
            {activePage === "dashboard" ? "Ana Dashboard" : MODULE_CONFIG.find((m) => m.id === activePage)?.title || activePage}
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">AI Aktif</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {company.companyName?.charAt(0) || "A"}
            </div>
          </div>
        </div>
        <div className="p-8">
          {activePage === "dashboard" ? <Dashboard company={company} onNavigate={setActivePage} /> : <ModulePage moduleId={activePage} company={company} />}
        </div>
      </div>
      <style>{`
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>
    </div>
  );
}
