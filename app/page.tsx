"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ============================================================
// TYPES
// ============================================================
type ToneOfVoice = "kurumsal" | "samimi" | "premium" | "ulasilabilir";
type MarketingGoal = "lead" | "awareness" | "appointment" | "sales" | "portfolio";
type ActivePage =
  | "dashboard" | "listing-scraper" | "ai-consultant"
  | "market-analysis" | "sales-proposal" | "content-planning"
  | "copywriting" | "ad-media" | "lead-tracking"
  | "data-analytics" | "operations" | "visual-design";

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
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
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
  key_metrics?: Record<string, string>;
  agent_output?: { transferable_data: string };
  risk_factors?: string[];
  opportunity_score?: number;
}

// Agent Memory - modüller arası veri akışı
interface AgentMemory {
  marketAnalysis?: ModuleResult;
  listingAnalysis?: ModuleResult;
  salesProposal?: ModuleResult;
  contentPlan?: ModuleResult;
  adPlan?: ModuleResult;
  listings?: Listing[];
}

// ============================================================
// CONSTANTS
// ============================================================
const REAL_ESTATE_SERVICES = [
  "Satılık Daire", "Kiralık Daire", "Satılık Villa",
  "Arsa", "Lüks Konut", "Ticari Gayrimenkul",
  "Yatırım Danışmanlığı", "Proje Satışı", "Değerleme",
];

const MODULE_CONFIG = [
  { id: "listing-scraper", title: "İlan Analiz Ajanı", icon: "🏠", description: "Sahibinden ilanlarını analiz et", color: "from-amber-500 to-orange-500", isNew: true, isCore: true },
  { id: "ai-consultant", title: "AI Emlak Danışmanı", icon: "💬", description: "Müşterilerle canlı sohbet", color: "from-emerald-500 to-teal-500", isNew: true, isCore: true },
  { id: "market-analysis", title: "Pazar & Rakip Analizi", icon: "📊", description: "Rekabet haritası ve fırsatlar", color: "from-blue-500 to-indigo-500", isNew: false, isCore: false },
  { id: "sales-proposal", title: "Teklif Hazırlama", icon: "📝", description: "Alıcıya özel teklif dokümanı", color: "from-violet-500 to-purple-500", isNew: false, isCore: false },
  { id: "content-planning", title: "İçerik Planı", icon: "📅", description: "Aylık sosyal medya takvimi", color: "from-orange-500 to-amber-500", isNew: false, isCore: false },
  { id: "copywriting", title: "Metin Yazarı", icon: "✍️", description: "İlan ve reklam metinleri", color: "from-pink-500 to-rose-500", isNew: false, isCore: false },
  { id: "ad-media", title: "Reklam Planı", icon: "📢", description: "Bütçe ve kampanya optimizasyonu", color: "from-cyan-500 to-sky-500", isNew: false, isCore: false },
  { id: "lead-tracking", title: "Lead Takibi", icon: "🎯", description: "Alıcı skorlama ve önceliklendirme", color: "from-teal-500 to-green-500", isNew: false, isCore: false },
  { id: "data-analytics", title: "Veri & Raporlama", icon: "📈", description: "KPI analizi ve büyüme raporu", color: "from-indigo-500 to-blue-500", isNew: false, isCore: false },
  { id: "operations", title: "Operasyon", icon: "⚙️", description: "İş akışı optimizasyonu", color: "from-slate-500 to-gray-500", isNew: false, isCore: false },
  { id: "visual-design", title: "Görsel Üretim", icon: "🎨", description: "AI ile emlak görselleri", color: "from-fuchsia-500 to-pink-500", isNew: false, isCore: false },
];

const LOADING_MESSAGES: Record<string, string[]> = {
  "market-analysis": ["Bölgesel fiyat endeksi analiz ediliyor...", "Rakip portföyler karşılaştırılıyor...", "Talep-arz dengesi hesaplanıyor...", "Yatırım fırsatları haritalanıyor...", "Pazar raporu hazırlanıyor..."],
  "sales-proposal": ["Alıcı profili değerlendiriliyor...", "Portföy eşleştirmesi yapılıyor...", "Finansman seçenekleri hesaplanıyor...", "Değer önerisi oluşturuluyor...", "Teklif dokümanı hazırlanıyor..."],
  "content-planning": ["Emlak trendleri taranıyor...", "Platform algoritmaları analiz ediliyor...", "Mevsimsel fırsatlar hesaplanıyor...", "İçerik mix optimize ediliyor...", "Yayın takvimi finalize ediliyor..."],
  "copywriting": ["Hedef kitle dil profili analiz ediliyor...", "Rekabet avantajları belirleniyor...", "İkna edici yapı kuruluyor...", "SEO optimizasyonu uygulanıyor...", "Ton uyumu kontrol ediliyor..."],
  "ad-media": ["Platform ROI karşılaştırması yapılıyor...", "Hedef kitle segmentasyonu...", "Bütçe dağılımı optimize ediliyor...", "Kampanya yapısı planlanıyor...", "Medya planı finalize ediliyor..."],
  "lead-tracking": ["Lead profilleri skorlanıyor...", "Dönüşüm olasılıkları hesaplanıyor...", "Önceliklendirme matrisi oluşturuluyor...", "Takip stratejisi kişiselleştiriliyor...", "Pipeline güncelleniyor..."],
  "data-analytics": ["KPI trendleri modelleniyor...", "Büyüme potansiyeli hesaplanıyor...", "Anomaliler tespit ediliyor...", "Benchmark karşılaştırması yapılıyor...", "Rapor oluşturuluyor..."],
  "operations": ["İş akışı darboğazları analiz ediliyor...", "Kaynak verimliliği hesaplanıyor...", "Otomasyon fırsatları haritalanıyor...", "Öncelik matrisi oluşturuluyor...", "Aksiyon planı hazırlanıyor..."],
  "listing-scraper": ["Sahibinden bağlantısı kuruluyor...", "İlanlar tespit ediliyor...", "Fiyat ve detaylar çekiliyor...", "AI değerlendirmesi yapılıyor...", "Rapor hazırlanıyor..."],
  "visual-design": ["Marka parametreleri analiz ediliyor...", "Görsel direktifler oluşturuluyor...", "Kompozisyon planlanıyor...", "AI görsel üretiliyor...", "Kalite kontrolü yapılıyor..."],
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
const formatMarkdown = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/## (.*?)(\n|$)/g, '<h2 class="text-white font-bold text-base mt-5 mb-2 flex items-center gap-2">$1</h2>')
    .replace(/### (.*?)(\n|$)/g, '<h3 class="text-white/90 font-semibold text-sm mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-white/70 italic">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-violet-300 text-xs font-mono">$1</code>')
    .replace(/^\| (.*) \|$/gm, (match) => {
      if (match.includes("---")) return "";
      const cells = match.slice(2, -2).split(" | ").map(cell =>
        `<td class="px-3 py-2 text-white/70 text-xs border-b border-white/5 whitespace-nowrap">${cell}</td>`
      ).join("");
      return `<tr class="hover:bg-white/3 transition-colors">${cells}</tr>`;
    })
    .replace(/(<tr[\s\S]*?<\/tr>\n?)+/g, match =>
      `<div class="overflow-x-auto my-4 rounded-xl border border-white/10"><table class="w-full border-collapse"><tbody>${match}</tbody></table></div>`
    )
    .replace(/^- (.*?)$/gm, '<li class="text-white/70 text-sm ml-5 list-disc mb-1">$1</li>')
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="text-white/70 text-sm ml-5 list-decimal mb-1">$2</li>')
    .replace(/(<li[\s\S]*?<\/li>\n?)+/g, match => `<ul class="space-y-0.5 my-3">${match}</ul>`)
    .replace(/\n\n/g, '<div class="my-3"></div>')
    .replace(/\n/g, "<br/>");
};

const buildSystemPrompt = (company: CompanyContext, agentMemory?: AgentMemory): string => {
  const memoryContext = agentMemory
    ? `\nAJAN HAFIZASI (Önceki modül çıktıları):
${agentMemory.marketAnalysis ? `- Pazar Analizi: ${agentMemory.marketAnalysis.reasoning_summary}` : ""}
${agentMemory.listingAnalysis ? `- İlan Analizi: ${agentMemory.listingAnalysis.reasoning_summary}` : ""}
${agentMemory.salesProposal ? `- Teklif: ${agentMemory.salesProposal.reasoning_summary}` : ""}
${agentMemory.listings ? `- ${agentMemory.listings.length} aktif ilan mevcut` : ""}`
    : "";

  return `Sen Adcomio'nun gelişmiş Multi-Agent AI sisteminin Kıdemli Emlak Analisti'sin.

FİRMA PROFİLİ:
- Ad: ${company.companyName}
- Konum: ${company.city} / ${company.region}
- Ton: ${company.toneOfVoice}
- Bütçe: ₺${company.monthlyBudget}/ay
- Portföy: ${company.servicePrices?.map(s => `${s.name}(₺${s.price})`).join(", ") || "Belirtilmedi"}
- Hedef Kitle: ${company.targetClientProfile}
- Rakipler: ${company.competitors}
- Gelir Seviyesi: ${company.incomeLevel}
- Satış Sorunu: ${company.biggestSalesProblem}
- Platformlar: ${[company.hasInstagram && "Instagram", company.hasGoogleAds && "Google", company.hasMetaAds && "Meta"].filter(Boolean).join(", ")}
${memoryContext}

GÖREV: Bu firmaya özgün, ölçülebilir, aksiyonable analizler üret. C-suite seviyesinde Türkçe yanıt ver.`;
};

// ============================================================
// UI COMPONENTS
// ============================================================

const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const s = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-8 h-8" }[size];
  return <div className={`${s} border-2 border-white/20 border-t-white rounded-full animate-spin`} />;
};

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "info" | "new" | "danger" }) => {
  const v = {
    default: "bg-white/10 text-white/70",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    info: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    new: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    danger: "bg-red-500/20 text-red-300 border border-red-500/30",
  }[variant];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v}`}>{children}</span>;
};

const Toast = ({ message, type, onClose }: { message: string; type: "success" | "info" | "warning"; onClose: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    info: "bg-blue-500/20 border-blue-500/30 text-blue-300",
    warning: "bg-amber-500/20 border-amber-500/30 text-amber-300",
  }[type];

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border backdrop-blur-xl ${colors} flex items-center gap-3 shadow-2xl animate-in`}>
      <span>{type === "success" ? "✓" : type === "warning" ? "⚠" : "ℹ"}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">×</button>
    </div>
  );
};

const MetricCard = ({ label, value, change, icon, color = "from-indigo-500 to-violet-500" }: {
  label: string; value: string; change?: string; icon: string; color?: string;
}) => (
  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden group hover:border-white/20 transition-all">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity`} />
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg`}>{icon}</div>
      {change && (
        <span className={`text-xs font-medium ${change.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{change}</span>
      )}
    </div>
    <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
    <div className="text-xs text-white/40">{label}</div>
  </div>
);

const ConfidenceBar = ({ value, label = "Güven Seviyesi" }: { value: number; label?: string }) => {
  const color = value >= 85 ? "from-emerald-500 to-teal-400" : value >= 70 ? "from-amber-500 to-yellow-400" : "from-red-500 to-rose-400";
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

const GlassCard = ({ children, className = "", onClick, gradient }: {
  children: React.ReactNode; className?: string; onClick?: () => void; gradient?: string;
}) => (
  <div
    onClick={onClick}
    className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden ${className} ${onClick ? "cursor-pointer hover:border-white/20 transition-all" : ""}`}
  >
    {gradient && <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />}
    <div className="relative">{children}</div>
  </div>
);

const AgentTransferButton = ({ fromModule, toModule, onTransfer, disabled }: {
  fromModule: string; toModule: string; onTransfer: () => void; disabled?: boolean;
}) => (
  <button
    onClick={onTransfer}
    disabled={disabled}
    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-all text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
  >
    <span>→</span>
    <span>{toModule}&apos;a Aktar</span>
  </button>
);

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
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#060912] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,#060912_100%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-violet-500/40">
              A
            </div>
            <div className="text-left">
              <div className="text-3xl font-black text-white tracking-tight">adcomio</div>
              <div className="text-xs text-violet-400 font-medium">AI Real Estate Intelligence</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="success">● Live AI</Badge>
            <Badge variant="info">Multi-Agent</Badge>
            <Badge variant="new">v2.0 Demo</Badge>
          </div>
        </div>

        <GlassCard className="p-8" gradient="from-violet-500 to-indigo-500">
          <h2 className="text-xl font-bold text-white mb-1">Demo Erişimi</h2>
          <p className="text-white/40 text-sm mb-6">Yatırımcı sunumu · Herhangi bir bilgi girin</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">E-posta</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="investor@fund.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Şifre</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 disabled:opacity-50 text-sm">
              {loading ? <><Spinner size="sm" /><span>Sisteme Bağlanıyor...</span></> : <><span>🚀</span><span>Demo&apos;yu Başlat</span></>}
            </button>
          </form>
        </GlassCard>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: "🤖", label: "11 AI Ajanı", sub: "Multi-agent" },
            { icon: "⚡", label: "Canlı Analiz", sub: "Real-time" },
            { icon: "🏢", label: "Emlak Odaklı", sub: "Vertical AI" },
          ].map(f => (
            <GlassCard key={f.label} className="p-3 text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-white text-xs font-semibold">{f.label}</div>
              <div className="text-white/30 text-xs">{f.sub}</div>
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
const OnboardingWizard = ({ onComplete }: { onComplete: (c: CompanyContext) => void }) => {
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState<Partial<CompanyContext>>({
    services: [], marketingGoals: [], servicePrices: [], packages: [],
    hasInstagram: true, hasGoogleAds: false, hasMetaAds: true, hasLinkedIn: false,
    sahibindenUrl: "", competitorUrls: "", toneOfVoice: "premium",
  });

  const update = (key: keyof CompanyContext, value: unknown) => setCompany(p => ({ ...p, [key]: value }));

  const steps = [
    { title: "Ofis Kimliği", desc: "Temel bilgiler ve Sahibinden profili" },
    { title: "Portföy", desc: "Hizmetler ve fiyat aralıkları" },
    { title: "Hedefler", desc: "Pazarlama öncelikleri" },
    { title: "Hedef Kitle", desc: "Alıcı profili ve motivasyonlar" },
    { title: "Dijital Varlık", desc: "Platformlar ve ekip" },
  ];

  const canProceed = () => {
    if (step === 1) return !!(company.companyName && company.city);
    if (step === 2) return !!(company.servicePrices && company.servicePrices.length > 0);
    if (step === 3) return !!(company.marketingGoals && company.marketingGoals.length > 0);
    if (step === 4) return !!company.targetAgeRange;
    if (step === 5) return !!company.teamSize;
    return true;
  };

  const loadDemo = () => {
    setCompany({
      companyName: "Güven Premium Emlak",
      city: "İstanbul",
      region: "Kadıköy",
      website: "www.guvenpremium.com",
      instagram: "@guvenpremiumemlak",
      toneOfVoice: "premium",
      sahibindenUrl: "https://www.sahibinden.com/satilik-daire/istanbul-kadikoy",
      competitorUrls: "https://www.sahibinden.com/satilik-daire/istanbul",
      competitors: "Turyap, RE/MAX, Century 21, Era Gayrimenkul",
      monthlyBudget: "25000",
      targetClientProfile: "Yüksek gelirli yatırımcılar ve premium konut alıcıları",
      targetAgeRange: "35-55",
      incomeLevel: "Yüksek gelir",
      interests: "Yatırım, yaşam kalitesi, prestij, lokasyon",
      decisionMotivations: "ROI, lokasyon kalitesi, marka güveni",
      trustBarriers: "Şeffaf fiyatlama, tapu güvencesi, referanslar",
      regionalFocus: "Kadıköy, Moda, Fenerbahçe, Göztepe",
      biggestSalesProblem: "Premium segment lead kalitesi düşük, dönüşüm süreci uzun",
      marketingGoals: ["lead", "sales", "awareness"],
      hasInstagram: true,
      hasGoogleAds: true,
      hasMetaAds: true,
      hasLinkedIn: true,
      contentFrequency: "Haftada 3+",
      teamSize: "6-15 kişi",
      services: ["Satılık Daire", "Lüks Konut", "Yatırım Danışmanlığı"],
      servicePrices: [
        { name: "Satılık Daire", price: "3.000.000 - 15.000.000", isTopService: true, isPriority: true },
        { name: "Lüks Konut", price: "10.000.000 - 50.000.000", isTopService: true, isPriority: false },
        { name: "Yatırım Danışmanlığı", price: "Komisyon bazlı", isTopService: false, isPriority: true },
        { name: "Kiralık Daire", price: "25.000 - 80.000/ay", isTopService: false, isPriority: false },
      ],
      packages: [],
    });
    setStep(5);
  };

  return (
    <div className="min-h-screen bg-[#060912] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg">A</div>
            <span className="text-2xl font-black text-white">adcomio</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Ofisinizi Tanıyalım</h1>
          <p className="text-white/40 text-sm">11 AI ajanı bu verilerle çalışacak</p>
          <button onClick={loadDemo} className="mt-3 px-4 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs hover:bg-violet-500/30 transition-all">
            ⚡ Demo verisi yükle (hızlı test)
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${i + 1 === step ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : i + 1 < step ? "text-emerald-400" : "text-white/20"}`}>
                <span>{i + 1 < step ? "✓" : i + 1}</span>
                {i + 1 === step && <span>{s.title}</span>}
              </div>
              {i < steps.length - 1 && <div className={`w-4 h-px mx-1 ${i + 1 < step ? "bg-emerald-500" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <GlassCard className="p-8" gradient="from-violet-500 to-indigo-500">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">{steps[step - 1].title}</h2>
            <p className="text-white/40 text-sm">{steps[step - 1].desc}</p>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Firma Adı *</label>
                <input value={company.companyName || ""} onChange={e => update("companyName", e.target.value)} placeholder="Güven Premium Emlak" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Şehir *</label>
                <input value={company.city || ""} onChange={e => update("city", e.target.value)} placeholder="İstanbul" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">İlçe / Bölge</label>
                <input value={company.region || ""} onChange={e => update("region", e.target.value)} placeholder="Kadıköy" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Sahibinden Profil / Arama Linki</label>
                <input value={company.sahibindenUrl || ""} onChange={e => update("sahibindenUrl", e.target.value)} placeholder="https://www.sahibinden.com/satilik-daire/istanbul-kadikoy" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Rakip Firma İsimleri</label>
                <input value={company.competitors || ""} onChange={e => update("competitors", e.target.value)} placeholder="Turyap, RE/MAX, Century 21..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Marka Tonu</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["kurumsal", "samimi", "premium", "ulasilabilir"] as ToneOfVoice[]).map(tone => (
                    <button key={tone} onClick={() => update("toneOfVoice", tone)} className={`py-2 px-2 rounded-lg text-xs capitalize transition-all ${company.toneOfVoice === tone ? "bg-violet-500 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"}`}>
                      {tone === "ulasilabilir" ? "ulaşılabilir" : tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {REAL_ESTATE_SERVICES.map(service => {
                  const existing = company.servicePrices?.find(s => s.name === service);
                  const isSelected = !!existing;
                  return (
                    <div key={service} className={`p-3 rounded-xl border transition-all ${isSelected ? "border-violet-500/40 bg-violet-500/5" : "border-white/8 hover:border-white/15"}`}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => {
                            const prices = company.servicePrices || [];
                            update("servicePrices", isSelected
                              ? prices.filter(s => s.name !== service)
                              : [...prices, { name: service, price: "", isTopService: false, isPriority: false }]
                            );
                          }}
                          className={`w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 transition-all ${isSelected ? "bg-violet-500 text-white" : "bg-white/10"}`}
                        >
                          {isSelected ? "✓" : ""}
                        </button>
                        <span className="text-white text-sm flex-1">{service}</span>
                        {isSelected && (
                          <>
                            <input
                              value={existing?.price || ""}
                              onChange={e => {
                                update("servicePrices", (company.servicePrices || []).map(s => s.name === service ? { ...s, price: e.target.value } : s));
                              }}
                              placeholder="Fiyat aralığı"
                              className="w-32 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs placeholder-white/20 focus:outline-none"
                            />
                            <button onClick={() => update("servicePrices", (company.servicePrices || []).map(s => s.name === service ? { ...s, isTopService: !s.isTopService } : s))} className={`text-xs px-2 py-1 rounded-lg transition-all ${existing?.isTopService ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-white/30 hover:bg-white/10"}`}>⭐ Kârlı</button>
                            <button onClick={() => update("servicePrices", (company.servicePrices || []).map(s => s.name === service ? { ...s, isPriority: !s.isPriority } : s))} className={`text-xs px-2 py-1 rounded-lg transition-all ${existing?.isPriority ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/30 hover:bg-white/10"}`}>🎯 Öncelik</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Hedef Alıcı Profili</label>
                  <input value={company.targetClientProfile || ""} onChange={e => update("targetClientProfile", e.target.value)} placeholder="Yatırımcı, aile, genç çift..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 text-sm transition-all" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Aylık Reklam Bütçesi (₺)</label>
                  <input value={company.monthlyBudget || ""} onChange={e => update("monthlyBudget", e.target.value)} placeholder="25.000" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 text-sm transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="grid gap-2">
              {[
                { id: "lead", label: "Lead Toplamak", desc: "Potansiyel alıcı bilgisi", icon: "🎯" },
                { id: "awareness", label: "Marka Bilinirliği", desc: "Bölgede tanınırlık", icon: "📢" },
                { id: "appointment", label: "Görüşme & Gezi", desc: "Mülk ziyareti randevusu", icon: "📅" },
                { id: "sales", label: "Satış Kapatmak", desc: "Portföyü hızlı dönüştür", icon: "💰" },
                { id: "portfolio", label: "Portföy Büyütmek", desc: "Yeni mülk sahiplerine ulaş", icon: "🏢" },
              ].map(goal => {
                const isSelected = (company.marketingGoals || []).includes(goal.id as MarketingGoal);
                return (
                  <button key={goal.id} onClick={() => {
                    const goals = company.marketingGoals || [];
                    update("marketingGoals", isSelected ? goals.filter(g => g !== goal.id) : [...goals, goal.id as MarketingGoal]);
                  }} className={`p-3.5 rounded-xl border-2 text-left transition-all ${isSelected ? "border-violet-500 bg-violet-500/10" : "border-white/8 hover:border-white/20"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{goal.icon}</span>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{goal.label}</div>
                        <div className="text-white/40 text-xs">{goal.desc}</div>
                      </div>
                      {isSelected && <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs">✓</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Yaş Aralığı *</label>
                <select value={company.targetAgeRange || ""} onChange={e => update("targetAgeRange", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50">
                  <option value="" className="bg-gray-900">Seç</option>
                  {["25-35", "35-50", "50+", "Tüm yaşlar"].map(v => <option key={v} value={v} className="bg-gray-900">{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Gelir Seviyesi</label>
                <select value={company.incomeLevel || ""} onChange={e => update("incomeLevel", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50">
                  <option value="" className="bg-gray-900">Seç</option>
                  {["Orta gelir", "Üst-orta gelir", "Yüksek gelir"].map(v => <option key={v} value={v} className="bg-gray-900">{v}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Karar Motivasyonları</label>
                <input value={company.decisionMotivations || ""} onChange={e => update("decisionMotivations", e.target.value)} placeholder="ROI, konum, marka güveni, okul yakınlığı..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Güven Bariyerleri</label>
                <input value={company.trustBarriers || ""} onChange={e => update("trustBarriers", e.target.value)} placeholder="Tapu güvencesi, fiyat şeffaflığı, referanslar..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">En Büyük Satış Sorunu</label>
                <input value={company.biggestSalesProblem || ""} onChange={e => update("biggestSalesProblem", e.target.value)} placeholder="Lead kalitesi düşük, dönüşüm uzun..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "hasInstagram", label: "Instagram", icon: "📸", sub: "Organik + Reklam" },
                  { key: "hasGoogleAds", label: "Google Ads", icon: "🔍", sub: "Arama Reklamı" },
                  { key: "hasMetaAds", label: "Meta Ads", icon: "📘", sub: "FB + IG Reklam" },
                  { key: "hasLinkedIn", label: "LinkedIn", icon: "💼", sub: "B2B Network" },
                ].map(p => {
                  const isOn = company[p.key as keyof CompanyContext] as boolean;
                  return (
                    <button key={p.key} onClick={() => update(p.key as keyof CompanyContext, !isOn)} className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${isOn ? "border-violet-500 bg-violet-500/10" : "border-white/8 hover:border-white/20"}`}>
                      <span className="text-xl">{p.icon}</span>
                      <div className="text-left">
                        <div className="text-white text-sm font-medium">{p.label}</div>
                        <div className="text-white/30 text-xs">{p.sub}</div>
                      </div>
                      {isOn && <span className="ml-auto text-violet-400 text-sm">✓</span>}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Ekip Büyüklüğü *</label>
                  <select value={company.teamSize || ""} onChange={e => update("teamSize", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50">
                    <option value="" className="bg-gray-900">Seç</option>
                    {["Solo / 1 kişi", "2-5 kişi", "6-15 kişi", "15+ kişi"].map(v => <option key={v} value={v} className="bg-gray-900">{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">İçerik Sıklığı</label>
                  <select value={company.contentFrequency || ""} onChange={e => update("contentFrequency", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50">
                    <option value="" className="bg-gray-900">Seç</option>
                    {["Hiç yok", "Ayda 1-2", "Haftada 1", "Haftada 3+", "Her gün"].map(v => <option key={v} value={v} className="bg-gray-900">{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                <div className="text-xs text-violet-300 font-semibold mb-3 flex items-center gap-2">✨ Profil Özeti</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    ["Firma", company.companyName || "—"],
                    ["Şehir", company.city || "—"],
                    ["Portföy", `${company.servicePrices?.length || 0} tip`],
                    ["Bütçe", `₺${company.monthlyBudget || "—"}`],
                    ["Ekip", company.teamSize || "—"],
                    ["Hedef", `${company.marketingGoals?.length || 0} adet`],
                  ].map(([k, v]) => (
                    <div key={k}><span className="text-white/40">{k}: </span><span className="text-white font-medium">{v}</span></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/8">
            <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="px-5 py-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all disabled:opacity-20 text-sm">← Geri</button>
            {step < 5 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-30 text-sm shadow-lg shadow-violet-500/25">
                Devam Et →
              </button>
            ) : (
              <button onClick={() => onComplete(company as CompanyContext)} disabled={!canProceed()} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-30 text-sm shadow-lg shadow-emerald-500/25">
                🚀 Sistemi Başlat
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
const Sidebar = ({ activePage, onNavigate, company }: {
  activePage: ActivePage; onNavigate: (p: ActivePage) => void; company: CompanyContext;
}) => {
  const coreModules = MODULE_CONFIG.filter(m => m.isNew);
  const otherModules = MODULE_CONFIG.filter(m => !m.isNew);

  return (
    <div className="w-64 h-screen bg-[#060912] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg">A</div>
          <div>
            <div className="text-white font-bold text-sm">adcomio</div>
            <div className="text-violet-400 text-xs">Emlak AI · v2.0</div>
          </div>
        </div>
      </div>

      <div className="px-3 py-3 border-b border-white/5">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 border border-violet-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {company.companyName?.charAt(0) || "G"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{company.companyName}</div>
              <div className="text-white/40 text-xs">{company.city} · Emlak Ofisi</div>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-xs">AI Aktif</span>
            </div>
            <Badge variant="new">₺{company.monthlyBudget ? Number(company.monthlyBudget).toLocaleString("tr") : "—"}</Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <button onClick={() => onNavigate("dashboard")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${activePage === "dashboard" ? "bg-violet-500/20 text-white border border-violet-500/30" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
          <span>🏠</span><span className="text-xs font-medium">Dashboard</span>
          {activePage === "dashboard" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
        </button>

        <div className="pt-2 pb-1">
          <div className="text-xs text-white/20 uppercase tracking-wider px-3 mb-1">Öne Çıkan</div>
          {coreModules.map(m => (
            <button key={m.id} onClick={() => onNavigate(m.id as ActivePage)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${activePage === m.id ? "bg-violet-500/20 text-white border border-violet-500/30" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
              <span className="text-base">{m.icon}</span>
              <span className="text-xs font-medium flex-1 truncate">{m.title}</span>
              <Badge variant="new">Yeni</Badge>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <div className="text-xs text-white/20 uppercase tracking-wider px-3 mb-1">AI Modülleri</div>
          {otherModules.map(m => (
            <button key={m.id} onClick={() => onNavigate(m.id as ActivePage)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${activePage === m.id ? "bg-violet-500/20 text-white border border-violet-500/30" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
              <span className="text-base">{m.icon}</span>
              <span className="text-xs font-medium flex-1 truncate">{m.title}</span>
              {activePage === m.id && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="text-xs text-white/15 text-center">Adcomio Demo v2.0 · {company.city}</div>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================
const Dashboard = ({ company, onNavigate, agentMemory }: {
  company: CompanyContext; onNavigate: (p: ActivePage) => void; agentMemory: AgentMemory;
}) => {
  const [animatedValues, setAnimatedValues] = useState({ listings: 0, budget: 0, modules: 0, score: 0 });

  useEffect(() => {
    const targets = {
      listings: agentMemory.listings?.length || 8,
      budget: parseInt(company.monthlyBudget || "0"),
      modules: 11,
      score: 87,
    };
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValues({
        listings: Math.round(targets.listings * eased),
        budget: Math.round(targets.budget * eased),
        modules: Math.round(targets.modules * eased),
        score: Math.round(targets.score * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [company.monthlyBudget, agentMemory.listings]);

  const completedModules = [
    agentMemory.listingAnalysis && "İlan Analizi",
    agentMemory.marketAnalysis && "Pazar Analizi",
    agentMemory.salesProposal && "Teklif",
    agentMemory.contentPlan && "İçerik Planı",
    agentMemory.adPlan && "Reklam Planı",
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl">🏢</span>
                <Badge variant="success">● Sistem Aktif</Badge>
                <Badge variant="new">Multi-Agent AI</Badge>
              </div>
              <h1 className="text-3xl font-black text-white mb-1">{company.companyName}</h1>
              <p className="text-white/50">
                {company.city}{company.region ? ` / ${company.region}` : ""} · {company.teamSize} · <span className="capitalize">{company.toneOfVoice}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/30 mb-1 uppercase tracking-wider">Aylık Reklam Bütçesi</div>
              <div className="text-3xl font-black text-white">₺{animatedValues.budget.toLocaleString("tr")}</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <MetricCard label="Aktif İlan" value={String(animatedValues.listings)} change="+3 bu hafta" icon="🏠" color="from-amber-500 to-orange-500" />
            <MetricCard label="AI Modülü" value={String(animatedValues.modules)} icon="🤖" color="from-violet-500 to-indigo-500" />
            <MetricCard label="Portföy Tipi" value={String(company.servicePrices?.length || 0)} icon="📋" color="from-blue-500 to-cyan-500" />
            <MetricCard label="Fırsat Skoru" value={`${animatedValues.score}%`} change="+12 puan" icon="🎯" color="from-emerald-500 to-teal-500" />
          </div>
        </div>
      </div>

      {/* Agent Pipeline */}
      {completedModules.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Agent Pipeline</h2>
            <Badge variant="success">{completedModules.length} Modül Tamamlandı</Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {["İlan Analizi", "Pazar Analizi", "Teklif", "İçerik Planı", "Reklam Planı"].map((m, i) => {
              const isCompleted = completedModules.includes(m);
              return (
                <div key={m} className="flex items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isCompleted ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 text-white/20 border border-white/10"}`}>
                    {isCompleted ? "✓ " : ""}{m}
                  </div>
                  {i < 4 && <div className={`w-6 h-px ${isCompleted ? "bg-emerald-500/50" : "bg-white/10"}`} />}
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Şirket Bağlamı */}
      <GlassCard className="p-5">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Şirket Bağlamı — Tüm AI Modülleri Bu Datayı Paylaşıyor</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-white/30 mb-2 uppercase tracking-wider">Portföy</div>
            <div className="space-y-1.5">
              {company.servicePrices?.slice(0, 4).map(s => (
                <div key={s.name} className="flex items-center justify-between gap-2">
                  <span className="text-white/60 text-xs truncate">{s.name}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {s.isTopService && <span className="text-amber-400 text-xs">⭐</span>}
                    {s.isPriority && <span className="text-emerald-400 text-xs">🎯</span>}
                    {s.price && <span className="text-white/40 text-xs font-mono">₺{s.price}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/30 mb-2 uppercase tracking-wider">Hedef Kitle</div>
            <div className="space-y-1 text-xs">
              <div className="text-white/50">Profil: <span className="text-white/70">{company.targetClientProfile || "—"}</span></div>
              <div className="text-white/50">Yaş: <span className="text-white/70">{company.targetAgeRange || "—"}</span></div>
              <div className="text-white/50">Gelir: <span className="text-white/70">{company.incomeLevel || "—"}</span></div>
              <div className="text-white/50">Motivasyon: <span className="text-white/70">{company.decisionMotivations?.substring(0, 30) || "—"}</span></div>
            </div>
          </div>
          <div>
            <div className="text-xs text-white/30 mb-2 uppercase tracking-wider">Pazar Durumu</div>
            <div className="space-y-1 text-xs">
              <div className="text-white/50">Rakipler: <span className="text-white/70">{company.competitors?.split(",")[0] || "—"}{(company.competitors?.split(",").length || 0) > 1 ? ` +${(company.competitors?.split(",").length || 1) - 1}` : ""}</span></div>
              <div className="text-white/50">Hedefler: <span className="text-white/70">{company.marketingGoals?.length || 0} adet</span></div>
              <div className="text-white/50">Platformlar: <span className="text-white/70">{[company.hasInstagram && "IG", company.hasGoogleAds && "G", company.hasMetaAds && "Meta", company.hasLinkedIn && "LI"].filter(Boolean).join(", ") || "—"}</span></div>
              <div className="text-white/50">Sorun: <span className="text-white/70">{company.biggestSalesProblem?.substring(0, 25) || "—"}</span></div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Core Modules */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Öne Çıkan Modüller</h2>
          <Badge variant="new">Yeni Nesil</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {MODULE_CONFIG.filter(m => m.isNew).map(module => (
            <GlassCard key={module.id} className="p-5 group" onClick={() => onNavigate(module.id as ActivePage)} gradient={module.color}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-2xl shadow-lg`}>{module.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold">{module.title}</h3>
                    <Badge variant="new">Yeni</Badge>
                  </div>
                  <p className="text-white/40 text-sm">{module.description}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Başlat →</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* All Modules */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 mb-4 uppercase tracking-wider">Tüm AI Modülleri</h2>
        <div className="grid grid-cols-3 gap-3">
          {MODULE_CONFIG.filter(m => !m.isNew).map(module => (
            <GlassCard key={module.id} className="p-4 group" onClick={() => onNavigate(module.id as ActivePage)}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-xl mb-3`}>{module.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{module.title}</h3>
              <p className="text-white/30 text-xs leading-relaxed">{module.description}</p>
              <div className="mt-3 text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">Başlat →</div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// LISTING SCRAPER
// ============================================================
const ListingScraperModule = ({ company, agentMemory, onMemoryUpdate, showToast }: {
  company: CompanyContext;
  agentMemory: AgentMemory;
  onMemoryUpdate: (key: keyof AgentMemory, value: unknown) => void;
  showToast: (msg: string, type: "success" | "info" | "warning") => void;
}) => {
  const [url, setUrl] = useState(company.sahibindenUrl || "");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [listings, setListings] = useState<Listing[]>(agentMemory.listings || []);
  const [analysis, setAnalysis] = useState<ModuleResult | null>(agentMemory.listingAnalysis || null);
  const [activeTab, setActiveTab] = useState<"listings" | "analysis" | "actions">("listings");
  const [scraped, setScraped] = useState(!!agentMemory.listings?.length);
  const [sortBy, setSortBy] = useState<"score" | "price" | "date">("score");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const msgs = LOADING_MESSAGES["listing-scraper"];

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "price") return b.priceRaw - a.priceRaw;
    return 0;
  });

  const handleScrape = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setListings([]);
    setAnalysis(null);
    setScraped(false);
    setLoadingStep(0);
    setLoadingMsg(msgs[0]);

    let step = 0;
    intervalRef.current = setInterval(() => {
      step = Math.min(step + 1, msgs.length - 1);
      setLoadingStep(step);
      setLoadingMsg(msgs[step]);
    }, 1200);

    try {
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, companyName: company.companyName, city: company.city, region: company.region }),
      });
      const scrapeData = await scrapeRes.json();
      const fetchedListings: Listing[] = scrapeData.listings || [];
      setListings(fetchedListings);
      onMemoryUpdate("listings", fetchedListings);

      // AI analizi
      const systemPrompt = buildSystemPrompt(company);
      const userPrompt = `Aşağıdaki ${fetchedListings.length} emlak ilanını profesyonel olarak analiz et:

${fetchedListings.slice(0, 8).map((l, i) =>
  `${i + 1}. "${l.title}" | Fiyat: ${l.price} | ${l.location} | ${l.details} | Skor: ${l.score}/100`
).join("\n")}

Şunları değerlendir:
1. Portföy güçlü/zayıf noktaları
2. Fiyat pozisyonu ve m² analizi
3. En hızlı satılacak ilanlar (neden)
4. İlan başlığı optimizasyon önerileri
5. Rakiplerle kıyaslamalı pazar pozisyonu
6. Acil aksiyon gerektiren ilanlar`;

      const aiResult = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemPrompt, user: userPrompt, module: "listing-scraper" }),
      });
      const aiData = await aiResult.json();
      setAnalysis(aiData);
      onMemoryUpdate("listingAnalysis", aiData);
      setScraped(true);
      setActiveTab("listings");
      showToast(`${fetchedListings.length} ilan analiz edildi`, "success");
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-500/20";
    if (score >= 80) return "text-blue-400 bg-blue-500/20";
    if (score >= 70) return "text-amber-400 bg-amber-500/20";
    return "text-red-400 bg-red-500/20";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">🏠</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white">İlan Analiz Ajanı</h1>
              <Badge variant="new">AI Destekli</Badge>
            </div>
            <p className="text-white/40 text-sm">Sahibinden ilanlarını çek, AI ile skorla ve analiz et</p>
          </div>
        </div>
        {scraped && analysis && (
          <AgentTransferButton
            fromModule="listing-scraper"
            toModule="Pazar Analizine"
            onTransfer={() => showToast("İlan analizi Pazar Analizi modülüne aktarıldı", "success")}
          />
        )}
      </div>

      {/* Context Bar */}
      <GlassCard className="p-3">
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-white/40">Agent Bağlamı</span></div>
          <span className="text-white/20">|</span>
          <span className="text-white/70 font-medium">{company.companyName}</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40">{company.city}{company.region ? ` / ${company.region}` : ""}</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40">Rakipler: {company.competitors?.split(",")[0] || "—"}</span>
          {agentMemory.marketAnalysis && <><span className="text-white/20">|</span><Badge variant="success">Pazar Analizi Bağlandı</Badge></>}
        </div>
      </GlassCard>

      {/* URL Input */}
      <GlassCard className="p-5">
        <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Sahibinden Profil veya Arama URL&apos;i</label>
        <div className="flex gap-3">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.sahibinden.com/satilik-daire/istanbul-kadikoy"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-500/40 transition-all text-sm"
          />
          <button
            onClick={handleScrape}
            disabled={loading || !url.trim()}
            className={`px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 flex-shrink-0 transition-all ${loading || !url.trim() ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 shadow-lg shadow-amber-500/20"}`}
          >
            {loading ? <><Spinner size="sm" /><span>Analiz...</span></> : <><span>🔍</span><span>Analiz Et</span></>}
          </button>
        </div>
        <p className="text-xs text-white/20 mt-2">Sahibinden engellerse sistem otomatik demo verisi üretir</p>
      </GlassCard>

      {/* Loading */}
      {loading && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Spinner size="sm" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">İlan Analiz Ajanı Çalışıyor</div>
              <div className="text-white/40 text-xs">{loadingMsg}</div>
            </div>
          </div>
          <div className="space-y-2">
            {msgs.map((msg, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs transition-all ${i < loadingStep ? "text-emerald-400" : i === loadingStep ? "text-white" : "text-white/15"}`}>
                <span className="w-4 flex-shrink-0">{i < loadingStep ? "✓" : i === loadingStep ? "▶" : "○"}</span>{msg}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {scraped && !loading && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3">
            <MetricCard label="Toplam İlan" value={String(listings.length)} icon="🏠" color="from-amber-500 to-orange-500" />
            <MetricCard label="Ort. Skor" value={`${Math.round(listings.reduce((a, l) => a + l.score, 0) / listings.length)}%`} icon="⭐" color="from-blue-500 to-indigo-500" />
            <MetricCard label="En Yüksek" value={listings.length ? Math.max(...listings.map(l => l.score)) + "%" : "—"} icon="🏆" color="from-emerald-500 to-teal-500" />
            <MetricCard label="AI Skoru" value={analysis ? `${analysis.confidence}%` : "—"} icon="🤖" color="from-violet-500 to-purple-500" />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 items-center">
            {[
              { id: "listings", label: `İlanlar (${listings.length})`, icon: "🏠" },
              { id: "analysis", label: "AI Analizi", icon: "🧠" },
              { id: "actions", label: "Aksiyonlar", icon: "🚀" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white/10 text-white border border-white/20" : "text-white/40 hover:text-white/60"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              {(["score", "price", "date"] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${sortBy === s ? "bg-white/15 text-white" : "text-white/30 hover:text-white/50"}`}>
                  {s === "score" ? "Skor" : s === "price" ? "Fiyat" : "Tarih"}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Grid */}
          {activeTab === "listings" && (
            <div className="grid grid-cols-2 gap-3">
              {sortedListings.map(listing => (
                <GlassCard key={listing.id} className="p-4 hover:border-white/20 transition-all group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm leading-tight mb-1 truncate">{listing.title}</h3>
                      <div className="text-emerald-400 font-bold text-base">{listing.price}</div>
                    </div>
                    <div className={`ml-2 px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${getScoreColor(listing.score)}`}>
                      {listing.score}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/40 text-xs flex items-center gap-1">📍 {listing.location}</div>
                    {listing.details && <div className="text-white/30 text-xs">{listing.details}</div>}
                    {listing.pricePerSqm && <div className="text-white/20 text-xs">{listing.pricePerSqm}</div>}
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <div className="text-white/20 text-xs">{listing.date}</div>
                    {listing.url && (
                      <a href={listing.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-violet-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Sahibinden →</a>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Analysis */}
          {activeTab === "analysis" && analysis && (
            <div className="space-y-4">
              <GlassCard className="p-6">
                <div className="text-white/80 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis.result) }} />
              </GlassCard>
              {analysis.key_metrics && Object.keys(analysis.key_metrics).length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(analysis.key_metrics).slice(0, 6).map(([k, v]) => (
                    <GlassCard key={k} className="p-3 text-center">
                      <div className="text-white font-bold text-lg">{v}</div>
                      <div className="text-white/40 text-xs mt-1">{k}</div>
                    </GlassCard>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4">
                  <h3 className="text-white font-semibold mb-3 text-sm">🧠 Analiz Gerekçesi</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{analysis.reasoning_summary}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <ConfidenceBar value={analysis.confidence} />
                  {analysis.opportunity_score && (
                    <div className="mt-3">
                      <ConfidenceBar value={analysis.opportunity_score} label="Fırsat Skoru" />
                    </div>
                  )}
                  {analysis.risk_factors && analysis.risk_factors.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-white/40 mb-2">Risk Faktörleri</div>
                      {analysis.risk_factors.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-amber-400 mb-1">
                          <span>⚠</span><span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </div>
            </div>
          )}

          {/* Actions */}
          {activeTab === "actions" && analysis && (
            <GlassCard className="p-5">
              <h3 className="text-white font-bold mb-4">🚀 Öncelikli Aksiyonlar</h3>
              <div className="space-y-3">
                {analysis.next_actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-all">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                    <span className="text-white/70 text-sm leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
};

// ============================================================
// AI CONSULTANT
// ============================================================
const AIConsultantModule = ({ company, agentMemory, showToast }: {
  company: CompanyContext;
  agentMemory: AgentMemory;
  showToast: (msg: string, type: "success" | "info" | "warning") => void;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "assistant",
    content: `Merhaba! Ben ${company.companyName} adına çalışan AI Emlak Danışmanıyım. 🏢\n\nPortföyümüzde ${agentMemory.listings?.length || 8} aktif ilan var. Size şu konularda yardımcı olabilirim:\n\n• 💰 Bütçenize uygun en iyi seçenekler\n• 📊 Yatırım getirisi analizi\n• 🗺 Bölge ve lokasyon karşılaştırması\n• 📅 Görüşme ve mülk gezisi organizasyonu\n• ❓ Fiyat müzakeresi stratejisi\n\nNasıl yardımcı olabilirim?`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listings = agentMemory.listings || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMsg, timestamp: new Date() }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.slice(-12).map(m => ({ role: m.role, content: m.content })),
          listings,
          companyContext: company,
          marketAnalysis: agentMemory.marketAnalysis,
        }),
      });

      if (!res.ok) throw new Error("Chat error");
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.message, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Teknik bir sorun oluştu. Lütfen tekrar deneyin.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, listings, company, agentMemory.marketAnalysis]);

  const quickQuestions = [
    "3 milyon bütçem var, ne önerirsiniz?",
    "Yatırım için en iyi seçenek hangisi?",
    "Bu bölgede kira getirisi nedir?",
    "Görüşme ayarlayabilir misiniz?",
    "Fiyat pazarlığı yapılabilir mi?",
    "Hangi ilan en hızlı değerlenir?",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">💬</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white">AI Emlak Danışmanı</h1>
              <Badge variant="success">● Canlı</Badge>
            </div>
            <p className="text-white/40 text-sm">{listings.length} ilan bilgisiyle donanmış · Müşteri sohbeti simülasyonu</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span>🤖</span><span>Groq LLaMA 3.3</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4" style={{ height: "580px" }}>
        {/* Chat */}
        <div className="col-span-2 flex flex-col">
          <GlassCard className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1 shadow-lg">🤖</div>
                  )}
                  <div className={`max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                    ? "bg-violet-500/25 text-white rounded-br-sm border border-violet-500/20"
                    : "bg-white/8 text-white/85 rounded-bl-sm border border-white/8"
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.timestamp && (
                      <div className={`text-xs mt-1.5 ${msg.role === "user" ? "text-violet-300/50 text-right" : "text-white/20"}`}>
                        {msg.timestamp.toLocaleTimeString("tr", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-sm ml-2 flex-shrink-0 mt-1">
                      {company.companyName?.charAt(0) || "M"}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm mr-2">🤖</div>
                  <div className="bg-white/8 px-4 py-3 rounded-2xl rounded-bl-sm border border-white/8">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map(j => (
                        <div key={j} className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />
                      ))}
                      <span className="text-white/30 text-xs ml-2">Yanıt hazırlanıyor...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-4 pb-2">
              <div className="text-xs text-white/20 mb-2">Hızlı sorular:</div>
              <div className="flex gap-1.5 flex-wrap">
                {quickQuestions.map(q => (
                  <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-white/35 hover:text-white/60 hover:bg-white/10 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Mesajınızı yazın... (Enter ile gönder)"
                  rows={2}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/40 resize-none text-sm transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`px-4 rounded-xl transition-all flex-shrink-0 flex items-center justify-center ${loading || !input.trim() ? "bg-white/5 text-white/15 cursor-not-allowed" : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:opacity-90 shadow-lg shadow-emerald-500/20"}`}
                >
                  ↑
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Listings Panel */}
        <div className="overflow-y-auto space-y-2">
          <div className="text-xs text-white/30 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Aktif Portföy</span>
            <Badge variant="info">{listings.length} ilan</Badge>
          </div>
          {listings.map(listing => (
            <GlassCard
              key={listing.id}
              className="p-3 group"
              onClick={() => {
                setInput(`"${listing.title}" ilanı hakkında bilgi almak istiyorum`);
                inputRef.current?.focus();
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-white text-xs font-semibold leading-tight flex-1 min-w-0 truncate">{listing.title}</div>
                <span className={`text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${listing.score >= 90 ? "text-emerald-400" : listing.score >= 80 ? "text-blue-400" : "text-amber-400"}`}>{listing.score}</span>
              </div>
              <div className="text-emerald-400 text-xs font-bold">{listing.price}</div>
              <div className="text-white/30 text-xs mt-1 truncate">{listing.location}</div>
              {listing.details && <div className="text-white/20 text-xs mt-0.5 truncate">{listing.details}</div>}
              <div className="text-violet-400 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Sor →</div>
            </GlassCard>
          ))}

          {listings.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏠</div>
              <div className="text-white/30 text-xs">İlan Analiz Ajanını çalıştır</div>
              <div className="text-white/20 text-xs">ve ilanlar burada görünür</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// VISUAL DESIGN
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
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const msgs = LOADING_MESSAGES["visual-design"];
  const platforms = [
    { id: "instagram", label: "Instagram Feed", icon: "📸", size: "1080×1080" },
    { id: "story", label: "Story / Reels", icon: "📱", size: "1080×1920" },
    { id: "facebook", label: "Facebook", icon: "📘", size: "1200×630" },
    { id: "google", label: "Display", icon: "🔍", size: "728×90" },
  ];
  const styles = ["luxury real estate photography", "modern architecture exterior", "aerial drone shot", "premium interior design", "minimalist premium", "sunset golden hour"];

  const handleGenerate = async () => {
    if (!brief.trim()) return;
    setLoading(true);
    setResult(null);
    setImageLoaded(false);
    setLoadingStep(0);
    setLoadingMsg(msgs[0]);
    let step = 0;
    intervalRef.current = setInterval(() => {
      step = Math.min(step + 1, msgs.length - 1);
      setLoadingStep(step);
      setLoadingMsg(msgs[step]);
    }, 1000);

    try {
      const res = await fetch("/api/visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: brief, style, platform, companyName: company.companyName, tone: company.toneOfVoice }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      setCount(c => c + 1);
    } catch {
      const fp = encodeURIComponent(`${style}, ${brief}, luxury real estate, professional`);
      setResult({ imageUrl: `https://image.pollinations.ai/prompt/${fp}?width=1080&height=1080&nologo=true&seed=${Date.now()}`, usedPrompt: brief, dimensions: { width: 1080, height: 1080 } });
      setCount(c => c + 1);
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-fuchsia-500/20">🎨</div>
        <div>
          <h1 className="text-xl font-bold text-white">Görsel Tasarım & Üretim</h1>
          <p className="text-white/40 text-sm mt-0.5">Brief gir, AI profesyonel emlak görseli üretsin</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-2 space-y-4">
          <GlassCard className="p-4">
            <label className="text-xs text-white/40 mb-3 block uppercase tracking-wider">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)} className={`p-3 rounded-xl border transition-all text-left ${platform === p.id ? "border-fuchsia-500 bg-fuchsia-500/10" : "border-white/8 hover:border-white/20"}`}>
                  <div className="text-xl mb-1">{p.icon}</div>
                  <div className="text-white text-xs font-medium">{p.label}</div>
                  <div className="text-white/30 text-xs">{p.size}</div>
                </button>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <label className="text-xs text-white/40 mb-3 block uppercase tracking-wider">Görsel Stili</label>
            <div className="space-y-1">
              {styles.map(s => (
                <button key={s} onClick={() => setStyle(s)} className={`w-full px-3 py-2 rounded-lg text-left text-xs transition-all ${style === s ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30" : "text-white/35 hover:text-white/65 hover:bg-white/5"}`}>{s}</button>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="col-span-3 space-y-4">
          <GlassCard className="p-4">
            <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Görsel Brief</label>
            <textarea value={brief} onChange={e => setBrief(e.target.value)} placeholder="Modern bir rezidansın gün batımında çekilen lüks dış cephe fotoğrafı, İstanbul silüeti arka planda, premium ve çarpıcı atmosfer..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-fuchsia-500/40 transition-all resize-none text-sm" />
            <button onClick={handleGenerate} disabled={loading || !brief.trim()} className={`mt-3 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${loading || !brief.trim() ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white hover:opacity-90 shadow-lg shadow-fuchsia-500/20"}`}>
              {loading ? <><Spinner size="sm" /><span>{loadingMsg}</span></> : <><span>✨</span><span>Görsel Üret</span></>}
            </button>
          </GlassCard>

          {loading && (
            <GlassCard className="p-5">
              <div className="space-y-2">
                {msgs.map((msg, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs transition-all ${i < loadingStep ? "text-emerald-400" : i === loadingStep ? "text-white" : "text-white/15"}`}>
                    <span className="w-4">{i < loadingStep ? "✓" : i === loadingStep ? "▶" : "○"}</span>{msg}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {result && !loading && (
            <GlassCard className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-sm">AI Üretim #{count}</span>
                <div className="flex gap-2">
                  <Badge variant="success">{result.dimensions.width}×{result.dimensions.height}</Badge>
                  <Badge variant="info">{platform}</Badge>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 min-h-48">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Spinner size="lg" />
                    <p className="text-white/30 text-xs mt-3">AI görseli oluşturuluyor...</p>
                  </div>
                )}
                <img src={result.imageUrl} alt="AI Generated Real Estate Visual" className={`w-full object-cover transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`} style={{ maxHeight: platform === "story" ? "450px" : "380px" }} onLoad={() => setImageLoaded(true)} onError={() => setImageLoaded(true)} />
              </div>
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="text-xs text-white/25 mb-1">AI Görsel Direktifi</div>
                <p className="text-white/45 text-xs leading-relaxed line-clamp-3">{result.usedPrompt}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleGenerate} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-sm">🔄 Yeniden Üret</button>
                <a href={result.imageUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/20 transition-all text-sm text-center">↗ Tam Boyut Aç</a>
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
const ModulePage = ({ moduleId, company, agentMemory, onMemoryUpdate, showToast }: {
  moduleId: string;
  company: CompanyContext;
  agentMemory: AgentMemory;
  onMemoryUpdate: (key: keyof AgentMemory, value: unknown) => void;
  showToast: (msg: string, type: "success" | "info" | "warning") => void;
}) => {
  if (moduleId === "visual-design") return <VisualDesignModule company={company} />;
  if (moduleId === "listing-scraper") return <ListingScraperModule company={company} agentMemory={agentMemory} onMemoryUpdate={onMemoryUpdate} showToast={showToast} />;
  if (moduleId === "ai-consultant") return <AIConsultantModule company={company} agentMemory={agentMemory} showToast={showToast} />;

  const moduleConfig = MODULE_CONFIG.find(m => m.id === moduleId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ModuleResult | null>(null);
  const [activeTab, setActiveTab] = useState<"result" | "reasoning" | "actions">("result");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const msgs = LOADING_MESSAGES[moduleId] || ["Analiz ediliyor..."];

  const getPrompt = () => {
    const base = buildSystemPrompt(company, agentMemory);
    const prompts: Record<string, string> = {
      "market-analysis": `${company.companyName} emlak ofisi için kapsamlı pazar analizi yap.\n\nBölge: ${company.city}/${company.region}\nRakipler: ${company.competitors}\nPortföy: ${company.servicePrices?.map(s => `${s.name}(₺${s.price})`).join(", ")}\n${agentMemory.listingAnalysis ? `\nİlan Analizi Verisi: ${agentMemory.listingAnalysis.reasoning_summary}` : ""}\n\n${input ? `Odak: ${input}` : "Genel pazar durumu, fırsatlar ve tehditler"}`,
      "sales-proposal": `${company.companyName} için profesyonel satış teklifi hazırla.\n\nPortföy fiyatları: ${company.servicePrices?.map(s => `${s.name}: ₺${s.price}`).join(", ")}\nAlıcı profili: ${company.targetClientProfile}\n${agentMemory.marketAnalysis ? `\nPazar durumu: ${agentMemory.marketAnalysis.reasoning_summary}` : ""}\n\n${input ? `Alıcı talebi: ${input}` : "Standart premium alıcı teklifi"}`,
      "content-planning": `${company.companyName} için aylık emlak içerik planı yap.\n\nHedefler: ${company.marketingGoals?.join(", ")}\nTon: ${company.toneOfVoice}\nPlatformlar: ${[company.hasInstagram && "Instagram", company.hasMetaAds && "Meta"].filter(Boolean).join(", ")}\n\n${input ? `Odak: ${input}` : "Tam aylık plan"}`,
      "copywriting": `${company.companyName} için emlak reklam metinleri yaz.\n\nTon: ${company.toneOfVoice}\nHedef: ${company.targetClientProfile}\nÖne çıkan hizmetler: ${company.servicePrices?.filter(s => s.isPriority).map(s => s.name).join(", ")}\n\n${input ? `Format/Konu: ${input}` : "Meta reklam + ilan başlığı + e-posta şablonu"}`,
      "ad-media": `${company.companyName} için aylık medya planı yap.\n\nBütçe: ₺${company.monthlyBudget}/ay\nPlatformlar: ${[company.hasInstagram && "Instagram", company.hasGoogleAds && "Google", company.hasMetaAds && "Meta"].filter(Boolean).join(", ")}\nHedefler: ${company.marketingGoals?.join(", ")}\n\n${input ? `Kampanya: ${input}` : "Tam medya planı ve bütçe dağılımı"}`,
      "lead-tracking": `${company.companyName} için lead takip ve dönüşüm stratejisi.\n\nSatış sorunu: ${company.biggestSalesProblem}\nGüven bariyerleri: ${company.trustBarriers}\nAlıcı profili: ${company.targetClientProfile}\n\n${input ? `Lead bilgisi: ${input}` : "Lead skorlama ve önceliklendirme sistemi"}`,
      "data-analytics": `${company.companyName} için KPI analizi ve büyüme raporu.\n\nBütçe: ₺${company.monthlyBudget}\nHedefler: ${company.marketingGoals?.join(", ")}\nPortföy: ${company.servicePrices?.length} tip\n\n${input ? `Analiz odağı: ${input}` : "Performans analizi ve büyüme önerileri"}`,
      "operations": `${company.companyName} için operasyonel optimizasyon planı.\n\nEkip: ${company.teamSize}\nSorunlar: ${company.biggestSalesProblem}\nPlatformlar: ${[company.hasInstagram && "Instagram", company.hasGoogleAds && "Google"].filter(Boolean).join(", ")}\n\n${input ? `Odak: ${input}` : "İş akışı ve verimlilik optimizasyonu"}`,
    };
    return prompts[moduleId] || input || "Analiz yap";
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setLoadingStep(0);
    setActiveTab("result");
    setLoadingMsg(msgs[0]);
    let step = 0;
    intervalRef.current = setInterval(() => {
      step = Math.min(step + 1, msgs.length - 1);
      setLoadingStep(step);
      setLoadingMsg(msgs[step]);
    }, 900);

    try {
      const systemPrompt = buildSystemPrompt(company, agentMemory);
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemPrompt, user: getPrompt(), module: moduleId }),
      });
      const data = await res.json();
      setResult(data);

      // Agent memory güncelle
      const memoryKey = moduleId === "market-analysis" ? "marketAnalysis" :
        moduleId === "sales-proposal" ? "salesProposal" :
        moduleId === "content-planning" ? "contentPlan" :
        moduleId === "ad-media" ? "adPlan" : null;
      if (memoryKey) {
        onMemoryUpdate(memoryKey as keyof AgentMemory, data);
        showToast(`${moduleConfig?.title} tamamlandı`, "success");
      }
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoading(false);
    }
  };

  const getNextModule = () => {
    const flow: Record<string, string> = {
      "market-analysis": "Teklif Hazırlamaya",
      "sales-proposal": "İçerik Planına",
      "content-planning": "Metin Yazarına",
      "copywriting": "Reklam Planına",
      "ad-media": "Lead Takibine",
    };
    return flow[moduleId];
  };

  if (!moduleConfig) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${moduleConfig.color} flex items-center justify-center text-2xl shadow-lg`}>{moduleConfig.icon}</div>
          <div>
            <h1 className="text-xl font-bold text-white">{moduleConfig.title}</h1>
            <p className="text-white/40 text-sm mt-0.5">{moduleConfig.description}</p>
          </div>
        </div>
        {result && getNextModule() && (
          <AgentTransferButton
            fromModule={moduleId}
            toModule={getNextModule()}
            onTransfer={() => showToast(`${moduleConfig.title} çıktısı aktarıldı`, "success")}
          />
        )}
      </div>

      {/* Agent Memory Status */}
      {(agentMemory.listingAnalysis || agentMemory.marketAnalysis) && (
        <GlassCard className="p-3">
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-white/40">Agent Hafızası Aktif</span>
            </div>
            {agentMemory.listings && <Badge variant="info">📋 {agentMemory.listings.length} İlan</Badge>}
            {agentMemory.listingAnalysis && <Badge variant="success">✓ İlan Analizi</Badge>}
            {agentMemory.marketAnalysis && <Badge variant="success">✓ Pazar Analizi</Badge>}
            {agentMemory.salesProposal && <Badge variant="success">✓ Teklif</Badge>}
          </div>
        </GlassCard>
      )}

      {/* Context */}
      <GlassCard className="p-3">
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-white/40">Şirket Bağlamı</span></div>
          <span className="text-white/20">|</span>
          <span className="text-white/70 font-medium">{company.companyName}</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40">{company.city} Emlak</span>
          {company.monthlyBudget && <><span className="text-white/20">|</span><span className="text-white/40">₺{parseInt(company.monthlyBudget).toLocaleString("tr")}/ay</span></>}
        </div>
      </GlassCard>

      {/* Input */}
      <GlassCard className="p-5">
        <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Analiz Parametresi (Opsiyonel)</label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Özel isteğinizi yazın veya boş bırakın, AI şirket profilini baz alır..."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40 transition-all resize-none text-sm"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-white/25">Agent hafızasındaki önceki analizler otomatik bağlam olarak kullanılır</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${loading ? "bg-white/5 text-white/20 cursor-not-allowed" : `bg-gradient-to-r ${moduleConfig.color} text-white hover:opacity-90 shadow-lg`}`}
          >
            {loading ? <><Spinner size="sm" /><span>Analiz ediliyor...</span></> : <><span>🤖</span><span>AI Analizi Başlat</span></>}
          </button>
        </div>
      </GlassCard>

      {/* Loading */}
      {loading && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${moduleConfig.color} flex items-center justify-center`}><Spinner size="sm" /></div>
            <div>
              <div className="text-white font-semibold text-sm">{moduleConfig.title} Ajanı Çalışıyor</div>
              <div className="text-white/40 text-xs">{loadingMsg}</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {msgs.map((msg, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs transition-all ${i < loadingStep ? "text-emerald-400" : i === loadingStep ? "text-white" : "text-white/15"}`}>
                <span className="w-4 flex-shrink-0">{i < loadingStep ? "✓" : i === loadingStep ? "▶" : "○"}</span>{msg}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Key Metrics */}
          {result.key_metrics && Object.keys(result.key_metrics).length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(result.key_metrics).slice(0, 4).map(([k, v]) => (
                <GlassCard key={k} className="p-3 text-center">
                  <div className="text-white font-bold text-lg">{v}</div>
                  <div className="text-white/35 text-xs mt-1">{k}</div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "result", label: "Sonuç", icon: "📋" },
              { id: "reasoning", label: "Analiz Mantığı", icon: "🧠" },
              { id: "actions", label: "Aksiyonlar", icon: "🚀" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white/10 text-white border border-white/20" : "text-white/35 hover:text-white/60"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              {result.opportunity_score && <Badge variant="success">Fırsat: {result.opportunity_score}%</Badge>}
              <button onClick={handleGenerate} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/35 hover:text-white/60 transition-all text-xs">🔄 Yeniden</button>
            </div>
          </div>

          {activeTab === "result" && (
            <GlassCard className="p-6">
              <div className="text-white/80 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(result.result) }} />
            </GlassCard>
          )}

          {activeTab === "reasoning" && (
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-5">
                <h3 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">🧠 Karar Özeti</h3>
                <p className="text-white/60 text-sm leading-relaxed">{result.reasoning_summary}</p>
                {result.risk_factors && result.risk_factors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="text-xs text-amber-400/70 mb-2 uppercase tracking-wider">Risk Faktörleri</div>
                    {result.risk_factors.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-amber-400/70 mb-1"><span>⚠</span><span>{r}</span></div>
                    ))}
                  </div>
                )}
              </GlassCard>
              <GlassCard className="p-5 space-y-4">
                <ConfidenceBar value={result.confidence} />
                {result.opportunity_score && <ConfidenceBar value={result.opportunity_score} label="Fırsat Skoru" />}
                <div>
                  <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Varsayımlar</div>
                  <div className="space-y-1.5">
                    {result.assumptions.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-violet-400 flex-shrink-0 mt-0.5">{i + 1}.</span>
                        <span className="text-white/55">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === "actions" && (
            <GlassCard className="p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">🚀 Öncelikli Aksiyonlar</h3>
              <div className="space-y-3">
                {result.next_actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-all group">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${moduleConfig.color} text-white text-xs flex items-center justify-center font-bold flex-shrink-0`}>{i + 1}</div>
                    <span className="text-white/70 text-sm leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// TOP BAR
// ============================================================
const TopBar = ({ activePage, company }: { activePage: ActivePage; company: CompanyContext }) => {
  const moduleTitle = activePage === "dashboard" ? "Ana Dashboard" : MODULE_CONFIG.find(m => m.id === activePage)?.title || activePage;

  return (
    <div className="sticky top-0 z-40 bg-[#060912]/95 backdrop-blur-xl border-b border-white/5 px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-white font-bold text-sm">{moduleTitle}</h1>
        {activePage !== "dashboard" && (
          <div className="text-white/20 text-xs hidden md:block">
            {company.companyName} · {company.city}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs text-white/30">
          <span>🤖 LLaMA 3.3 · 70B</span>
          <span className="text-white/15">|</span>
          <span>Groq</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">AI Aktif</span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-violet-500/20">
          {company.companyName?.charAt(0) || "A"}
        </div>
      </div>
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
  const [agentMemory, setAgentMemory] = useState<AgentMemory>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  const handleMemoryUpdate = useCallback((key: keyof AgentMemory, value: unknown) => {
    setAgentMemory(prev => ({ ...prev, [key]: value }));
  }, []);

  const showToast = useCallback((message: string, type: "success" | "info" | "warning") => {
    setToast({ message, type });
  }, []);

  if (appState === "login") return <LoginPage onLogin={() => setAppState("onboarding")} />;
  if (appState === "onboarding") return (
    <OnboardingWizard onComplete={c => {
      setCompany(c);
      setAppState("dashboard");
      setActivePage("dashboard");
    }} />
  );
  if (!company) return null;

  return (
    <div className="min-h-screen bg-[#060912] flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} company={company} />

      <div className="ml-64 flex-1 min-h-screen">
        <TopBar activePage={activePage} company={company} />

        <div className="p-8">
          {activePage === "dashboard" ? (
            <Dashboard company={company} onNavigate={setActivePage} agentMemory={agentMemory} />
          ) : (
            <ModulePage
              moduleId={activePage}
              company={company}
              agentMemory={agentMemory}
              onMemoryUpdate={handleMemoryUpdate}
              showToast={showToast}
            />
          )}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        @keyframes animate-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: animate-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
