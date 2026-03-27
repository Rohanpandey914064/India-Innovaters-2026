import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Loader2, HelpCircle, MapPin, FileText, ListOrdered, Lightbulb, ShieldCheck, Timer, Wallet, Target } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { apiJson } from "@/lib/api";
import { translateWithGemini } from "@/services/GeminiService";

const CATEGORY_OPTIONS = [
  { value: "", label: "Select Category" },
  { value: "utilities", label: "Utilities" },
  { value: "identity", label: "Identity & Documents" },
  { value: "infrastructure", label: "Public Infrastructure" },
  { value: "other", label: "Other" },
];

const FALLBACK_GUIDANCE = {
  department: "General Administration",
  steps: ["1. Submit a detailed query", "2. Visit the nearest citizen service center", "3. Follow departmental protocols"],
  documents: ["Identity Proof", "Address Proof"],
  location: "Municipal Office / Online Portal",
  where_to_go: "Municipal Office / Online Portal",
  important_points: [
    "Include exact location details for accurate routing.",
    "Carry at least one government identity proof.",
    "Keep complaint/application reference number safely."
  ],
  urgency: "Normal",
  confidence: 0.3,
  timeline: "Depends on department process",
  estimated_fees: "Varies by service",
  matched_service: "General Civic Guidance"
};

const LOCAL_GUIDANCE_KB = [
  {
    id: 'aadhaar',
    keywords: ['aadhaar', 'aadhar', 'uidai', 'aadhaar card'],
    matched_service: 'Aadhaar Card (UIDAI)',
    department: 'UIDAI',
    where_to_go: 'UIDAI portal or nearest Aadhaar Seva Kendra',
    location: 'https://uidai.gov.in',
    documents: ['Proof of Identity', 'Proof of Address', 'Date of Birth proof (if required)', 'Mobile Number'],
    steps: ['Book appointment or visit Aadhaar center', 'Submit POI/POA documents', 'Complete biometric and demographic verification', 'Collect acknowledgment slip and track status', 'Download e-Aadhaar after approval'],
    important_points: ['Use only official UIDAI channels', 'Check spelling of name and DOB carefully'],
    timeline: 'Usually 1-3 weeks',
    estimated_fees: 'As per UIDAI fee chart',
  },
  {
    id: 'pan',
    keywords: ['pan', 'pan card', 'income tax card', 'pancard', 'nsdl', 'uti'],
    matched_service: 'PAN Card Application',
    department: 'Income Tax Department (NSDL/UTIITSL)',
    where_to_go: 'NSDL or UTIITSL PAN portal',
    location: 'https://www.utiitsl.com/',
    documents: ['Proof of Identity', 'Proof of Address', 'Date of Birth Proof', 'Photo/Signature as required'],
    steps: ['Open PAN portal and select New PAN (Form 49A)', 'Fill application details as per official documents', 'Upload documents and complete verification', 'Pay application fee and submit', 'Track acknowledgment and download/receive PAN'],
    important_points: ['Use official portal only', 'Name and DOB must exactly match your ID proofs'],
    timeline: 'Usually 7-15 working days',
    estimated_fees: 'As per PAN fee schedule',
  },
  {
    id: 'voter',
    keywords: ['voter', 'epic', 'voter id', 'election card'],
    matched_service: 'Voter ID (EPIC)',
    department: 'Election Commission of India',
    where_to_go: 'Voter Service Portal',
    location: 'https://voters.eci.gov.in',
    documents: ['Age Proof (18+)', 'Address Proof', 'Passport Photo'],
    steps: ['Register on Voter Service Portal', 'Fill new voter form', 'Upload supporting documents', 'Submit and track application ID', 'Download digital EPIC once approved'],
    important_points: ['Use your current address and constituency details', 'Track application reference for BLO verification'],
    timeline: 'Typically 2-4 weeks',
    estimated_fees: 'Generally no fee',
  },
  {
    id: 'passport',
    keywords: ['passport', 'passport seva'],
    matched_service: 'Passport Application',
    department: 'Ministry of External Affairs',
    where_to_go: 'Passport Seva Portal and PSK/POPSK',
    location: 'https://www.passportindia.gov.in',
    documents: ['Address Proof', 'Date of Birth Proof', 'Identity Proof', 'Additional annexures if applicable'],
    steps: ['Create account on Passport Seva portal', 'Fill application and pay fee', 'Book PSK appointment', 'Visit PSK with originals for verification', 'Track police verification and dispatch status'],
    important_points: ['Carry original documents at PSK visit', 'Keep ARN/reference number safe'],
    timeline: 'Depends on verification, often 2-6 weeks',
    estimated_fees: 'As per passport type/category',
  },
  {
    id: 'driving_license',
    keywords: ['driving license', 'driving licence', 'dl', 'parivahan'],
    matched_service: 'Driving License',
    department: 'Transport Department',
    where_to_go: 'Parivahan Portal and RTO',
    location: 'https://parivahan.gov.in/parivahan/',
    documents: ['Age Proof', 'Address Proof', 'Photograph', 'Medical Certificate if required'],
    steps: ['Apply for learner license online', 'Pass learner test', 'Apply for permanent DL after eligibility period', 'Book and pass driving test at RTO', 'Download/collect issued DL'],
    important_points: ['Use exact details as per Aadhaar/ID', 'Carry originals for test/verification'],
    timeline: 'Usually 2-8 weeks',
    estimated_fees: 'As per state transport fee schedule',
  },
  {
    id: 'electricity_bill',
    keywords: ['electricity bill', 'power bill', 'bijli bill'],
    matched_service: 'Electricity Bill Services',
    department: 'State Electricity Distribution Company',
    where_to_go: 'State electricity board portal or local office',
    location: 'Official state discom portal',
    documents: ['Consumer Number', 'Previous Bill', 'ID Proof for corrections'],
    steps: ['Login using consumer/account number', 'View/download latest bill', 'Pay online and save receipt', 'Raise correction/dispute if needed', 'Track complaint/ticket until closure'],
    important_points: ['Use official discom portal only', 'Always save payment receipt'],
    timeline: 'Instant for payments, 3-15 days for corrections',
    estimated_fees: 'As per billed amount/service type',
  },
  {
    id: 'water_bill',
    keywords: ['water bill', 'jal bill', 'water tax'],
    matched_service: 'Water Bill Services',
    department: 'Water Board / Jal Nigam',
    where_to_go: 'Water board portal or zonal office',
    location: 'Official state/city water board portal',
    documents: ['Connection/Consumer Number', 'Previous Bill', 'Address Proof for ownership correction'],
    steps: ['Search account by connection number', 'View/download current bill', 'Pay online and retain receipt', 'Submit correction request if required', 'Track ticket resolution status'],
    important_points: ['Use correct consumer number', 'Keep bill and payment references'],
    timeline: 'Instant for payment, 3-15 days for corrections',
    estimated_fees: 'As per utility charges',
  },
  {
    id: 'rent_agreement',
    keywords: ['rent agreement', 'rental agreement', 'lease deed', 'rent deed'],
    matched_service: 'Rent Agreement Registration',
    department: 'Registration and Stamps Department',
    where_to_go: 'State e-Stamp/e-Registration portal',
    location: 'Sub-Registrar Office and state IGRS portal',
    documents: ['Tenant and Owner ID Proof', 'Property Details', 'Witness IDs', 'Photographs'],
    steps: ['Draft agreement with terms and rent details', 'Pay stamp duty and registration fee', 'Book appointment if required', 'Complete signing/biometric verification', 'Download registered agreement copy'],
    important_points: ['Check state stamp duty rules', 'Ensure witness details are valid'],
    timeline: 'Usually 1-7 days',
    estimated_fees: 'Depends on rent term and state rules',
  },
  {
    id: 'birth_certificate',
    keywords: ['birth certificate', 'birth', 'newborn'],
    matched_service: 'Birth Certificate',
    department: 'Registrar of Births and Deaths',
    where_to_go: 'Civil Registration portal or local registrar office',
    location: 'Municipal/Gram Panchayat registrar office',
    documents: ['Hospital Birth Record', 'Parent ID', 'Address Proof'],
    steps: ['Fill birth registration form', 'Submit hospital and parent documents', 'Complete registrar verification', 'Pay nominal fee if applicable', 'Download/collect certificate'],
    important_points: ['Register early to avoid late registration process'],
    timeline: 'Usually 3-10 working days',
    estimated_fees: 'Nominal as per local body rules',
  },
  {
    id: 'death_certificate',
    keywords: ['death certificate', 'death', 'deceased'],
    matched_service: 'Death Certificate',
    department: 'Registrar of Births and Deaths',
    where_to_go: 'Civil Registration portal or registrar office',
    location: 'Municipal/Gram Panchayat registrar office',
    documents: ['Medical Death Report', 'Applicant ID', 'Address Proof'],
    steps: ['Submit death registration request', 'Attach medical report and applicant documents', 'Complete registrar verification', 'Pay applicable fee', 'Download/collect death certificate'],
    important_points: ['Ensure details match hospital records'],
    timeline: 'Usually 3-10 working days',
    estimated_fees: 'Nominal as per local body rules',
  },
  {
    id: 'marriage_certificate',
    keywords: ['marriage certificate', 'marriage', 'wedding certificate'],
    matched_service: 'Marriage Certificate',
    department: 'Marriage Registrar Office',
    where_to_go: 'Local marriage registrar / sub-registrar office',
    location: 'State marriage registration portal and local office',
    documents: ['Bride/Groom ID & Age Proof', 'Address Proof', 'Witness IDs', 'Marriage Photos'],
    steps: ['Fill marriage registration form', 'Upload/submit required documents', 'Appear before registrar with witnesses', 'Complete verification and signing', 'Receive certificate'],
    important_points: ['Check state-specific rules and notice period'],
    timeline: 'Typically 7-30 days',
    estimated_fees: 'As per state rates',
  },
  {
    id: 'family_register',
    keywords: ['family register', 'parivar register', 'family copy'],
    matched_service: 'Family/Parivar Register Copy',
    department: 'Revenue Department / Panchayat',
    where_to_go: 'e-District portal or local tehsil/panchayat office',
    location: 'Tehsil / Panchayat office',
    documents: ['ID Proof', 'Address Proof', 'Family details/reference entry'],
    steps: ['Apply for family register copy', 'Provide household and location details', 'Submit proofs and fee', 'Verification by records officer', 'Collect/download certified copy'],
    important_points: ['Provide exact village/ward and family head details'],
    timeline: 'Usually 3-15 working days',
    estimated_fees: 'Nominal administrative fee',
  },
  {
    id: 'income_certificate',
    keywords: ['income certificate', 'income', 'salary certificate'],
    matched_service: 'Income Certificate',
    department: 'Revenue Department',
    where_to_go: 'e-District portal or Tehsil office',
    location: 'Tehsil / district office',
    documents: ['ID Proof', 'Address Proof', 'Income Proof', 'Photo'],
    steps: ['Submit income certificate application', 'Upload income and identity documents', 'Field/records verification by authority', 'Track application status', 'Download certificate after approval'],
    important_points: ['Income details should match supporting proofs'],
    timeline: 'Usually 7-15 working days',
    estimated_fees: 'Nominal service fee',
  },
  {
    id: 'caste_certificate',
    keywords: ['caste certificate', 'sc', 'st', 'obc'],
    matched_service: 'Caste Certificate (SC/ST/OBC)',
    department: 'Revenue Department / Social Welfare',
    where_to_go: 'e-District portal or Tehsil office',
    location: 'Tehsil office',
    documents: ['ID Proof', 'Address Proof', 'Family caste proof', 'Affidavit (if required)'],
    steps: ['Apply through e-District portal', 'Upload caste lineage and identity documents', 'Authority verification/field inquiry', 'Track application status', 'Download issued certificate'],
    important_points: ['Ensure caste details are consistent across documents'],
    timeline: 'Usually 10-30 working days',
    estimated_fees: 'Nominal service fee',
  },
  {
    id: 'ews_certificate',
    keywords: ['ews certificate', 'ews', 'economically weaker section'],
    matched_service: 'EWS Certificate',
    department: 'Revenue Department',
    where_to_go: 'e-District portal or Tehsil office',
    location: 'Tehsil office',
    documents: ['Income Proof', 'Property Declaration', 'ID and Address Proof', 'Affidavit'],
    steps: ['Submit EWS application with family details', 'Upload income/property documents', 'Authority verifies eligibility criteria', 'Track application ID', 'Download issued EWS certificate'],
    important_points: ['Eligibility depends on current government criteria'],
    timeline: 'Usually 7-20 working days',
    estimated_fees: 'Nominal service fee',
  },
  {
    id: 'domicile',
    keywords: ['domicile certificate', 'residence certificate', 'niwas certificate', 'residence'],
    matched_service: 'Domicile/Residence Certificate',
    department: 'Revenue Department',
    where_to_go: 'e-District portal or Tehsil office',
    location: 'Tehsil office',
    documents: ['Address Proof', 'ID Proof', 'Residence duration proof', 'Affidavit if required'],
    steps: ['Apply online/offline for domicile certificate', 'Upload residency and identity documents', 'Authority verification', 'Track application status', 'Download certificate after approval'],
    important_points: ['Residence proofs should clearly cover required duration'],
    timeline: 'Usually 7-20 working days',
    estimated_fees: 'Nominal service fee',
  },
  {
    id: 'ration_card',
    keywords: ['ration card', 'nfsa', 'food card', 'pds'],
    matched_service: 'Ration Card',
    department: 'Food and Civil Supplies Department',
    where_to_go: 'State food portal or local ration office',
    location: 'Food supply office / online state portal',
    documents: ['Aadhaar of family members', 'Address Proof', 'Income Details', 'Photo'],
    steps: ['Submit new ration card application', 'Provide household and income details', 'Upload required documents', 'Field verification by supply office', 'Download/collect ration card'],
    important_points: ['Use active mobile number for OTP and status alerts'],
    timeline: 'Usually 15-30 working days',
    estimated_fees: 'As per state policy',
  },
  {
    id: 'job_card',
    keywords: ['job card', 'mgnrega', 'nrega', 'manrega'],
    matched_service: 'Job Card (MGNREGA)',
    department: 'Rural Development Department',
    where_to_go: 'Gram Panchayat office',
    location: 'Local Gram Panchayat / MGNREGA office',
    documents: ['Household details', 'Aadhaar IDs', 'Address proof', 'Photographs'],
    steps: ['Apply for MGNREGA job card at Gram Panchayat', 'Submit household and ID details', 'Verification by Panchayat authorities', 'Receive issued job card', 'Use job card to demand work under MGNREGA'],
    important_points: ['Keep job card details updated for wage tracking'],
    timeline: 'Usually 7-30 working days',
    estimated_fees: 'Generally no fee',
  },
];

const normalizeQuery = (text = '') => text
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const matchLocalGuidance = (query) => {
  const q = normalizeQuery(query);
  if (!q) return null;

  const scored = LOCAL_GUIDANCE_KB.map((item) => {
    const score = item.keywords.reduce((acc, kw) => {
      const k = normalizeQuery(kw);
      return acc + (q.includes(k) ? (k.length > 7 ? 4 : 2) : 0);
    }, 0);
    return { item, score };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score <= 0) return null;

  return {
    ...best.item,
    confidence: Math.min(0.95, 0.55 + best.score * 0.05),
    urgency: 'Normal',
    important_points: best.item.important_points || [],
    reasoning: 'Matched from built-in civic services knowledge base.'
  };
};

const isHttpUrl = (value = '') => /^https?:\/\//i.test(String(value).trim());

export default function AICivicAssistant() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const { t, language } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse(null);

    const localResult = matchLocalGuidance(query);

    try {
      let queryEnglish = '';
      if (language !== 'en') {
        queryEnglish = await translateWithGemini(query, 'en', language) || '';
      }

      const data = await apiJson('/api/ai/assistant', {
        method: 'POST',
        body: { query, category, location, language, queryEnglish }
      });

      const isGeneric = !data || /general/i.test(String(data.matched_service || ''));
      setResponse(isGeneric && localResult ? localResult : data || localResult || FALLBACK_GUIDANCE);
    } catch (err) {
      console.warn('AI Assistant Backend failed, using local fallback:', err);
      setResponse(localResult || FALLBACK_GUIDANCE);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-8 lg:py-10 max-w-7xl grid grid-cols-1 xl:grid-cols-[390px_minmax(0,1fr)] gap-5">
      <Card className="xl:sticky xl:top-24 h-fit bg-card/90 backdrop-blur-sm border border-border/50 hover:border-primary/40 transition-shadow shadow-sm rounded-2xl">
        <CardHeader className="border-b pb-4">
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-background/70 p-3">
              <label className="block text-sm font-medium mb-1 text-foreground">{t('Describe your issue or what you need help with')}</label>
              <Textarea
                placeholder={t('e.g., I need to apply for a new birth certificate for my newborn child...')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                className="resize-none"
                required
                voice
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                <label className="block text-sm font-medium mb-1 text-foreground">{t('Category (Optional)')}</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value}>
                      {t(opt.label)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                <label className="block text-sm font-medium mb-1 text-foreground">{t('Location (Optional)')}</label>
                <Input
                  placeholder={t('Enter your area or zone')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  voice
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 shadow-lg font-semibold" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('Consulting AI...')}</>) : t('Get Guidance')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/90 backdrop-blur-sm border border-border/50 hover:border-primary/40 transition-shadow shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b pb-4 bg-muted/20">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
             <Lightbulb className="w-6 h-6 text-primary" />
             {t('Guidance Result')}
          </CardTitle>
          <CardDescription>{t('Structured response with only the most relevant civic steps.')}</CardDescription>
        </CardHeader>
        <CardContent className="p-5 md:p-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">{t('Analyzing municipal protocols...')}</p>
              </motion.div>
            ) : response ? (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="rounded-lg border border-border/60 p-2.5 bg-background/70">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">{t('Matched Service')}</p>
                    <p className="text-sm font-semibold leading-snug">{t(response.matched_service || 'General Civic Guidance')}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-2.5 bg-background/70">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">{t('Urgency')}</p>
                    <p className="text-sm font-semibold inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" />{t(response.urgency || 'Normal')}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-2.5 bg-background/70">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">{t('Confidence')}</p>
                    <p className="text-sm font-semibold inline-flex items-center gap-1.5"><Target className="w-4 h-4 text-primary" />{Math.round((response.confidence || 0) * 100)}%</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-2.5 bg-background/70">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">{t('Timeline')}</p>
                    <p className="text-sm font-semibold inline-flex items-center gap-1.5"><Timer className="w-4 h-4 text-primary" />{t(response.timeline || 'Depends on process')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-primary font-semibold mb-1">{t('Handling Department')}</p>
                    <p className="font-semibold text-primary">{t(response.department)}</p>
                  </div>
                  <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-orange-700 font-semibold mb-1">{t('Where to Go')}</p>
                    <p className="text-sm font-medium">{t(response.where_to_go || response.location)}</p>
                    {isHttpUrl(response.location) && (
                      <a
                        href={response.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-sm font-semibold text-orange-700 hover:underline"
                      >
                        {t('Open Official Portal')}
                      </a>
                    )}
                    <p className="text-[11px] text-orange-700/80 mt-1 inline-flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />{t(response.estimated_fees || 'Varies by service')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
                    <p className="text-sm font-semibold mb-2 inline-flex items-center gap-1.5"><FileText className="w-4 h-4 text-blue-600" /> {t('Required Documents')}</p>
                    <ul className="space-y-1.5">
                      {(response.documents || []).slice(0, 6).map((doc, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                          <span>{t(doc)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                    <p className="text-sm font-semibold mb-2 inline-flex items-center gap-1.5"><ListOrdered className="w-4 h-4 text-emerald-600" /> {t('Step-by-Step Procedure')}</p>
                    <ol className="space-y-1.5">
                      {(response.steps || []).slice(0, 6).map((step, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="font-semibold text-emerald-700 w-5 shrink-0">{i + 1}.</span>
                          <span>{t(step)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {!!response.important_points?.length && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                    <p className="text-sm font-semibold mb-2 inline-flex items-center gap-1.5"><Lightbulb className="w-4 h-4 text-amber-700" /> {t('Important Points')}</p>
                    <ul className="space-y-1.5">
                      {response.important_points.slice(0, 5).map((point, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="font-semibold text-amber-700 w-5 shrink-0">{i + 1}.</span>
                          <span>{t(point)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!!response.reasoning && (
                  <div className="text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded-lg p-2.5">
                    <span className="font-semibold">{t('AI routing note')}:</span> {t(response.reasoning)}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 opacity-60">
                <div className="p-3 rounded-full bg-muted shadow-inner"><HelpCircle className="h-7 w-7 text-muted-foreground" /></div>
                <p className="text-sm font-medium text-muted-foreground max-w-[260px]">{t('Submit your query to get AI-powered municipal guidance.')}</p>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </section>
  );
}
