import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, MapPin, CheckCircle2, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const PORTAL_META = {
  aadhaar: { href: 'https://uidai.gov.in', isHttp: true },
  pan: { href: 'https://www.utiitsl.com/', isHttp: true },
  voter: { href: 'https://voters.eci.gov.in', isHttp: true },
  passport: { href: 'https://www.passportindia.gov.in', isHttp: true },
  driving: { href: 'https://parivahan.gov.in/parivahan/', isHttp: true },
  electricity_bill: { href: 'https://www.uppclonline.com', isHttp: true },
  water_bill: { href: 'https://jalshakti-ddws.gov.in', isHttp: true },
  rent_agreement: { href: 'https://igrs.up.gov.in', isHttp: true },
  'birth-certificate': { href: 'https://health.city.gov/birth', isHttp: true },
  'death-certificate': { href: 'https://crsorgi.gov.in', isHttp: true },
  'marriage-certificate': { href: 'https://services.india.gov.in', isHttp: true },
  'family-register': { href: 'https://edistrict.up.gov.in', isHttp: true },
  'pothole-complaint': { href: '/map', isHttp: false },
  electricity: { href: 'https://power.city.gov/report', isHttp: true },
  'income-certificate': { href: 'https://edistrict.gov.in', isHttp: true },
  'caste-certificate': { href: 'https://edistrict.gov.in', isHttp: true },
  'ews-certificate': { href: 'https://edistrict.gov.in', isHttp: true },
  'domicile-certificate': { href: 'https://edistrict.gov.in', isHttp: true },
  'ration-card': { href: 'https://nfsa.gov.in', isHttp: true },
  'job-card-mgnrega': { href: 'https://nrega.nic.in', isHttp: true },
  'water-connection': { href: 'https://water.city.gov/new-connection', isHttp: true },
  generic: { href: 'https://municipal.gov/services', isHttp: true },
};

const SCHEMES = [
  {
    id: 'aadhaar',
    keywords: ['uidai', 'aadhaar', 'aadhar', 'aadhaar card', 'uid card'],
    title: 'Apply for Aadhaar Card (UIDAI)',
    description: 'Enroll for new Aadhaar or update demographic/biometric details through UIDAI.',
    department: 'UIDAI',
    location: 'Nearest Aadhaar Seva Kendra or authorized enrollment center',
    documents: ['Proof of Identity', 'Proof of Address', 'Date of Birth proof (if asked)', 'Mobile number for OTP updates'],
    steps: [
      'Locate your nearest Aadhaar Seva Kendra from UIDAI portal.',
      'Book an appointment or visit the center with original documents.',
      'Complete biometric capture and demographic verification.',
      'Collect acknowledgement slip with Enrollment ID (EID).',
      'Track status online and download e-Aadhaar once generated.',
    ],
  },
  {
    id: 'pan',
    keywords: ['pan', 'pan card', 'income tax card', 'nsdl', 'uti'],
    title: 'Apply for PAN Card (Income Tax Department)',
    description: 'Apply for a new PAN card or correction through NSDL/UTIITSL channels.',
    department: 'Income Tax Department',
    location: 'Online via NSDL/UTI portal or PAN facilitation center',
    documents: ['Identity Proof', 'Address Proof', 'Date of Birth Proof', 'Passport size photo', 'Signature'],
    steps: [
      'Open PAN application portal and select new PAN (Form 49A).',
      'Fill personal details exactly as per supporting documents.',
      'Upload proof documents and photograph/signature.',
      'Pay application fee and submit request.',
      'Track acknowledgment number and receive e-PAN/physical PAN.',
    ],
  },
  {
    id: 'voter',
    keywords: ['voter', 'epic', 'voter id', 'election card'],
    title: 'Apply for Voter ID (EPIC)',
    description: 'Register as a new voter, correct details, or request voter ID services.',
    department: 'Election Commission of India',
    location: 'Voter Service Portal / Booth Level Officer',
    documents: ['Age proof (18+)', 'Address proof', 'Recent passport photo', 'Mobile number'],
    steps: [
      'Visit the Voter Service Portal and choose new registration.',
      'Fill required form details with address and constituency info.',
      'Upload supporting documents and photo.',
      'Submit application and note reference ID.',
      'Track status and download digital EPIC when approved.',
    ],
  },
  {
    id: 'passport',
    keywords: ['passport', 'passport seva'],
    title: 'Apply for Passport',
    description: 'Apply for fresh passport, reissue, or correction through Passport Seva.',
    department: 'Ministry of External Affairs',
    location: 'Passport Seva Kendra (PSK) or Post Office PSK',
    documents: ['Address proof', 'Date of birth proof', 'Identity proof', 'Annexure declarations if required'],
    steps: [
      'Create/login to Passport Seva account.',
      'Fill online application form and pay the fee.',
      'Schedule PSK appointment slot.',
      'Visit PSK with originals for document verification and biometrics.',
      'Complete police verification and track passport dispatch.',
    ],
  },
  {
    id: 'driving',
    keywords: ['driving license', 'dl', 'parivahan', 'learner license', 'licence'],
    title: 'Apply for Driving License',
    description: 'Apply for learner license and permanent driving license via transport portal.',
    department: 'Transport Department',
    location: 'Parivahan portal and Regional Transport Office (RTO)',
    documents: ['Address proof', 'Age proof', 'Passport photo', 'Medical certificate if applicable'],
    steps: [
      'Apply for learner license online and pay required fee.',
      'Pass learner license test as scheduled.',
      'After waiting period, apply for permanent driving license.',
      'Book driving test slot at the assigned RTO.',
      'Pass test and receive DL issuance confirmation.',
    ],
  },
  {
    id: 'electricity_bill',
    keywords: ['electricity bill', 'power bill', 'bijli bill'],
    title: 'Electricity Bill Services',
    description: 'View, download, pay, or correct electricity bill details.',
    department: 'State Electricity Distribution Company',
    location: 'Discom online portal or local electricity office',
    documents: ['Consumer number', 'Previous bill copy', 'ID proof for corrections'],
    steps: [
      'Open state electricity portal and login with consumer number.',
      'View/download current bill or payment history.',
      'Make online payment and save receipt.',
      'For correction/dispute, register complaint with bill evidence.',
      'Track complaint ID until resolution.',
    ],
  },
  {
    id: 'water_bill',
    keywords: ['water bill', 'jal bill', 'water tax'],
    title: 'Water Bill Services',
    description: 'Check, pay, or request correction in municipal water bill.',
    department: 'Water Board / Jal Nigam',
    location: 'Water board portal or zonal water office',
    documents: ['Connection number', 'Previous bill', 'Address proof (for ownership corrections)'],
    steps: [
      'Search your account using connection/consumer number.',
      'Download or print current bill.',
      'Pay bill online and store receipt.',
      'Raise correction request with supporting proof if needed.',
      'Follow ticket status until closure.',
    ],
  },
  {
    id: 'rent_agreement',
    keywords: ['rent agreement', 'rental agreement', 'lease deed', 'rent deed'],
    title: 'Rent Agreement Registration',
    description: 'Create and register a rental agreement with applicable stamp duty.',
    department: 'Registration and Stamps Department',
    location: 'e-Stamp/e-Registration portal and Sub-Registrar Office',
    documents: ['Tenant and owner ID proofs', 'Property details', 'Photographs', 'Witness IDs'],
    steps: [
      'Draft rent agreement with term, rent, and clauses.',
      'Generate e-stamp and pay stamp duty/registration fee.',
      'Book appointment with Sub-Registrar if required by state.',
      'Both parties and witnesses complete signing/biometric process.',
      'Download registered agreement copy.',
    ],
  },
  {
    id: 'birth-certificate',
    keywords: ['birth certificate', 'birth', 'born', 'child'],
    title: 'Apply for Birth Certificate',
    description: 'Get a new birth certificate or a copy of an existing one.',
    department: 'Department of Health',
    location: 'City Hall, Room 102',
    documents: ['ID Proof of Parents', 'Hospital Discharge Summary', 'Marriage Certificate (Optional)'],
    steps: [
      'Fill out the online application form',
      'Upload the required documents in PDF format',
      'Pay the processing fee ($15)',
      'Wait for SMS confirmation (typically 3-5 days)',
      'Download digital copy or collect physical copy from City Hall',
    ],
  },
  {
    id: 'death-certificate',
    keywords: ['death certificate', 'death', 'deceased'],
    title: 'Apply for Death Certificate',
    description: 'Register a death event and obtain certified death certificate copy.',
    department: 'Registrar of Births and Deaths',
    location: 'Municipal Birth-Death Registrar Office / CRS Portal',
    documents: ['Death report from hospital/doctor', 'ID proof of applicant', 'Address proof', 'Application form'],
    steps: [
      'Register death within prescribed timeline with registrar office.',
      'Submit medical death report and applicant documents.',
      'Pay applicable fee for certificate copies.',
      'Verify record details before final submission.',
      'Download or collect death certificate copy.',
    ],
  },
  {
    id: 'marriage-certificate',
    keywords: ['marriage certificate', 'marriage', 'nikah registration', 'wedding certificate'],
    title: 'Apply for Marriage Certificate',
    description: 'Register marriage and obtain official marriage certificate.',
    department: 'Marriage Registrar Office',
    location: 'Local Sub-Registrar / Marriage Registrar Office',
    documents: ['Bride and groom ID proof', 'Address proof', 'Age proof', 'Wedding photos', 'Witness IDs'],
    steps: [
      'Fill marriage registration form online/offline.',
      'Upload required documents and schedule appearance.',
      'Appear with witnesses before registrar.',
      'Complete verification and signing process.',
      'Receive digitally signed or printed marriage certificate.',
    ],
  },
  {
    id: 'family-register',
    keywords: ['family register', 'parivar register', 'family copy', 'kutumb register'],
    title: 'Family/Parivar Register Copy',
    description: 'Get certified copy of family register for local administrative use.',
    department: 'Revenue Department / Gram Panchayat',
    location: 'Tehsil office / Panchayat office / e-District portal',
    documents: ['ID proof', 'Address proof', 'Existing family details/reference number'],
    steps: [
      'Apply for parivar register copy on e-District or local office.',
      'Provide family head details and village/ward information.',
      'Attach proof documents and submit fee.',
      'Records officer verifies register entry.',
      'Collect/download certified family register copy.',
    ],
  },
  {
    id: 'pothole-complaint',
    keywords: ['pothole', 'road', 'street', 'broken'],
    title: 'Complain about Road/Pothole',
    description: 'Report road damage, potholes, or damaged pavements.',
    department: 'Public Works Department',
    location: 'City Maintenance Office, Block B',
    documents: ['Photo of the issue', 'Exact location coordinates'],
    steps: [
      'Open the CitySpark Report page',
      'Enter the exact location using the GPS auto-detect',
      'Upload the photo & submit your report',
      'Municipal workers will inspect within 48 hours',
      'Track progress on your Dashboard',
    ],
  },
  {
    id: 'electricity',
    keywords: ['power', 'electricity', 'light', 'outage', 'wire'],
    title: 'Report Power Outage',
    description: 'Notify the electricity board about power cuts or broken streetlights.',
    department: 'Electricity Board',
    location: '12 Power Grid Avenue',
    documents: ['Customer Account Number', 'Recent Electricity Bill'],
    steps: [
      'Check if it is a planned outage on the Electricity Board website',
      'If unplanned, submit a report with your account number',
      'Wait for the board to dispatch line workers',
      'Updates will be provided via SMS',
    ],
  },
  {
    id: 'income-certificate',
    keywords: ['income', 'salary', 'pension'],
    title: 'Income Certificate Application',
    description: 'Official document certifying your annual income for scholarships and subsidies.',
    department: 'Revenue Department',
    location: 'Tehsil Office / District Magistrate Office',
    documents: ['Aadhar Card', 'Ration Card / Address Proof', 'Salary Slip / Income Proof', 'Passport Size Photo'],
    steps: [
      'Visit the local Tehsil or e-District portal.',
      'Fill out the Income Certificate Application form.',
      'Attach the required self-attested documents and photograph.',
      'Pay the minimal processing fee online.',
      'The Patwari/Lekhpal will digitally verify the details.',
      'Certificate is issued and downloadable within 7-15 working days.',
    ],
  },
  {
    id: 'caste-certificate',
    keywords: ['caste certificate', 'sc certificate', 'st certificate', 'obc certificate', 'category certificate'],
    title: 'Caste Certificate (SC/ST/OBC)',
    description: 'Apply for caste/category certificate for reservation and welfare schemes.',
    department: 'Revenue Department / Social Welfare',
    location: 'Tehsil office / e-District portal',
    documents: ['ID proof', 'Address proof', 'Caste proof of parent/family', 'Affidavit if required'],
    steps: [
      'Fill caste certificate application on e-District portal.',
      'Upload supporting caste lineage and identity proofs.',
      'Submit application and note reference ID.',
      'Field verification may be conducted by local authority.',
      'Download approved caste certificate online.',
    ],
  },
  {
    id: 'ews-certificate',
    keywords: ['ews certificate', 'economically weaker section', 'ews'],
    title: 'EWS Certificate',
    description: 'Apply for Economically Weaker Section certificate.',
    department: 'Revenue Department',
    location: 'Tehsil office / e-District portal',
    documents: ['Income proof', 'Property declaration', 'ID and address proof', 'Affidavit'],
    steps: [
      'Submit EWS application with family income details.',
      'Upload affidavit and required financial/property documents.',
      'Department verifies eligibility criteria as per state rules.',
      'Track application ID online.',
      'Download certificate after approval.',
    ],
  },
  {
    id: 'domicile-certificate',
    keywords: ['domicile certificate', 'residence certificate', 'niwas', 'resident certificate'],
    title: 'Domicile/Residence Certificate',
    description: 'Obtain proof of permanent residence in the state/district.',
    department: 'Revenue Department',
    location: 'Tehsil office / e-District portal',
    documents: ['Address proof', 'ID proof', 'Residence duration proof', 'Affidavit if applicable'],
    steps: [
      'Apply on e-District portal for domicile/residence certificate.',
      'Upload identity and long-term residence proof documents.',
      'Submit form and fee, then note tracking ID.',
      'Local authority verifies residence records.',
      'Certificate is issued online for download.',
    ],
  },
  {
    id: 'ration-card',
    keywords: ['ration card', 'nfsa', 'food card', 'pds card'],
    title: 'Ration Card Application',
    description: 'Apply for new ration card or update family/member details.',
    department: 'Food and Civil Supplies Department',
    location: 'State food portal / local ration office',
    documents: ['Aadhaar of family members', 'Address proof', 'Income details', 'Passport photo'],
    steps: [
      'Apply online for new ration card on state food portal.',
      'Enter household member and income details.',
      'Upload required documents and submit.',
      'Field verification by supply inspector may occur.',
      'Download/collect ration card after approval.',
    ],
  },
  {
    id: 'job-card-mgnrega',
    keywords: ['job card', 'mgnrega', 'nrega card', 'manrega'],
    title: 'Job Card (MGNREGA)',
    description: 'Register household for MGNREGA and receive job card.',
    department: 'Rural Development Department',
    location: 'Gram Panchayat office / MGNREGA portal',
    documents: ['Household details', 'Aadhaar IDs', 'Address proof', 'Photographs'],
    steps: [
      'Submit MGNREGA job card application at Gram Panchayat.',
      'Provide family member and identity details.',
      'Panchayat verifies household eligibility.',
      'Job card is generated and issued to applicant household.',
      'Use job card to demand work and track wage payments.',
    ],
  },
  {
    id: 'water-connection',
    keywords: ['water', 'pipe', 'plumbing'],
    title: 'New Water Connection',
    description: 'Apply for a new municipal water pipeline connection for residential properties.',
    department: 'Water & Sanitation Authority',
    location: 'Public Health Engineering Dept, Zone 4',
    documents: ['Property Tax Receipt', 'Registered Sale Deed / Lease Agreement', 'Aadhar Card', 'Plumber Certification'],
    steps: [
      'Submit the application form online or at the Zone office.',
      'A Junior Engineer (JE) will schedule a site inspection.',
      'Pay the estimated connection fee based on the JE report.',
      'A licensed municipal plumber will execute the connection.',
      'Connection activated within 14 working days of fee payment.',
    ],
  },
  {
    id: 'generic',
    keywords: [],
    title: 'Civic Process Guidance',
    description: 'General instructions for municipal administrative tasks based on your inquiry.',
    department: 'General Municipal Administration',
    location: 'City Hall, Central Helpdesk',
    documents: ['Valid Government ID', 'Application Form', 'Address Proof (Utility Bill/Aadhar)'],
    steps: [
      'Visit the main city hall helpdesk or browse the municipal portal.',
      'Inquire about the specific department handling your specific request.',
      'Submit standard identification documents to the designated clerk.',
      'Follow the directed procedural steps provided by the administration.',
      'Keep the application reference number for tracking.',
    ],
  },
];

const Services = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [matchScore, setMatchScore] = useState(0);
  const spotlightServices = useMemo(() => SCHEMES.filter((s) => s.id !== 'generic').slice(0, 8), []);
  const quickPrompts = useMemo(() => [
    'Apply for birth certificate',
    'Need PAN card correction',
    'How to apply for domicile certificate',
    'Report pothole near my street',
    'New water connection process',
  ], []);

  const normalizeQuery = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const analyzeText = async (rawText) => {
    if (!rawText.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const q = normalizeQuery(rawText);
    const scored = SCHEMES.map((s) => {
      if (!s.keywords.length) return { scheme: s, score: 0 };
      const score = s.keywords.reduce((acc, k) => {
        const keyword = normalizeQuery(k);
        return acc + (q.includes(keyword) ? (keyword.length > 7 ? 4 : 2) : 0);
      }, 0);
      return { scheme: s, score };
    }).sort((a, b) => b.score - a.score);

    let found = scored[0]?.score > 0 ? scored[0].scheme : null;

    if (!found) {
      if (q.includes('aadhaar') || q.includes('aadhar') || q.includes('uidai')) {
        found = SCHEMES.find((s) => s.id === 'aadhaar');
      } else if (q.includes('pan')) {
        found = SCHEMES.find((s) => s.id === 'pan');
      } else if (q.includes('voter') || q.includes('epic')) {
        found = SCHEMES.find((s) => s.id === 'voter');
      } else if (q.includes('passport')) {
        found = SCHEMES.find((s) => s.id === 'passport');
      } else if (q.includes('driving') || q.includes('license') || q.includes('licence') || q.includes('dl')) {
        found = SCHEMES.find((s) => s.id === 'driving');
      } else if (q.includes('electricity bill') || q.includes('power bill') || q.includes('bijli')) {
        found = SCHEMES.find((s) => s.id === 'electricity_bill');
      } else if (q.includes('water bill') || q.includes('jal bill')) {
        found = SCHEMES.find((s) => s.id === 'water_bill');
      } else if (q.includes('rent agreement') || q.includes('lease')) {
        found = SCHEMES.find((s) => s.id === 'rent_agreement');
      } else if (q.includes('birth certificate')) {
        found = SCHEMES.find((s) => s.id === 'birth-certificate');
      } else if (q.includes('death certificate')) {
        found = SCHEMES.find((s) => s.id === 'death-certificate');
      } else if (q.includes('marriage certificate')) {
        found = SCHEMES.find((s) => s.id === 'marriage-certificate');
      } else if (q.includes('parivar') || q.includes('family register')) {
        found = SCHEMES.find((s) => s.id === 'family-register');
      } else if (q.includes('income') || q.includes('salary') || q.includes('pension')) {
        found = SCHEMES.find((s) => s.id === 'income-certificate');
      } else if (q.includes('caste') || q.includes('sc ') || q.includes('st ') || q.includes('obc')) {
        found = SCHEMES.find((s) => s.id === 'caste-certificate');
      } else if (q.includes('ews')) {
        found = SCHEMES.find((s) => s.id === 'ews-certificate');
      } else if (q.includes('domicile') || q.includes('residence') || q.includes('niwas')) {
        found = SCHEMES.find((s) => s.id === 'domicile-certificate');
      } else if (q.includes('ration')) {
        found = SCHEMES.find((s) => s.id === 'ration-card');
      } else if (q.includes('mgnrega') || q.includes('nrega') || q.includes('job card')) {
        found = SCHEMES.find((s) => s.id === 'job-card-mgnrega');
      } else if (q.includes('water') || q.includes('pipe') || q.includes('plumbing')) {
        found = SCHEMES.find((s) => s.id === 'water-connection');
      } else {
        found = SCHEMES.find((s) => s.id === 'generic');
      }
    }

    const portal = PORTAL_META[found.id] || PORTAL_META.generic;
    const confidence = scored[0]?.score > 0 ? Math.min(95, 35 + scored[0].score * 8) : 25;
    setMatchScore(confidence);
    setResult({ ...found, portalHref: portal.href, portalIsHttp: portal.isHttp });
    setIsAnalyzing(false);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    await analyzeText(query);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-card/50 to-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply opacity-35"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl mix-blend-multiply opacity-25"></div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-16 max-w-6xl flex flex-col gap-10 relative z-10">
      <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2 shadow-inner">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{t('AI Civic Assistant')}</h1>
        <p className="text-muted-foreground text-lg mb-6">{t('Describe what you need, and our AI instantly points you to the right department.')}</p>

        <form onSubmit={handleAnalyze} className="w-full relative mt-4">
          <Input
            placeholder={t('Search for a service... (e.g. Apply for birth certificate)')}
            className="pl-6 pr-32 h-16 rounded-full shadow-lg text-base border-primary/20 bg-background/80 backdrop-blur-sm focus-visible:ring-primary/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isAnalyzing}
          />
          <Button
            type="submit"
            disabled={!query.trim() || isAnalyzing}
            className="absolute right-2 top-2 h-12 rounded-full px-6 font-semibold shadow-antigravity"
          >
            {isAnalyzing ? t('Analyzing...') : t('Analyze')}
          </Button>
        </form>

        <div className="w-full flex flex-wrap justify-center gap-2 pt-1">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuery(prompt);
                analyzeText(prompt);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-full border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/15 hover:border-purple-500/40 transition-colors"
            >
              {t(prompt)}
            </button>
          ))}
        </div>
      </div>

      {!result && !isAnalyzing && (
        <section className="rounded-3xl border border-border/60 bg-card/70 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">{t('Popular Services')}</h2>
              <p className="text-sm text-muted-foreground">{t('One tap to load the complete process and required documents.')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {spotlightServices.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  setQuery(service.title);
                  analyzeText(service.title);
                }}
                className="text-left rounded-2xl border border-border/60 bg-gradient-to-br from-background to-card/80 p-4 hover:shadow-md transition-all"
              >
                <p className="text-xs font-semibold text-primary mb-1">{t(service.department)}</p>
                <h3 className="font-bold leading-snug mb-1 line-clamp-2">{t(service.title)}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{t(service.description)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="w-full mt-4">
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-64 flex flex-col items-center justify-center space-y-4 bg-muted/30 rounded-3xl border border-dashed border-border"
            >
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium animate-pulse">{t('Scanning municipal database...')}</p>
            </motion.div>
          )}

          {result && !isAnalyzing && (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-2xl bg-card border-primary/20 overflow-hidden relative">
                <CardHeader className="border-b bg-muted/30 pb-6 pt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-sm uppercase font-bold tracking-wider shadow-sm">
                      {t(result.department)}
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-sm">
                      {t('Verified Match')}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-500/10 px-2 py-1 rounded-sm">
                      {t('Confidence')}: {matchScore}%
                    </span>
                  </div>
                  <CardTitle className="text-3xl font-extrabold">{t(result.title)}</CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-2 max-w-2xl">{t(result.description)}</CardDescription>
                </CardHeader>

                <CardContent className="p-6 md:p-8 space-y-10">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-start gap-4 bg-primary/5 p-5 rounded-2xl flex-1 border border-primary/10 hover:border-primary/30 transition-colors">
                      <div className="bg-background p-2.5 rounded-xl shadow-sm">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">{t('WHERE TO GO')}</p>
                        <p className="font-semibold text-base leading-snug text-foreground">{t(result.location)}</p>
                        <a href={result.portalHref} className="text-sm text-primary font-bold hover:underline mt-2 inline-flex items-center">
                          {result.portalIsHttp ? t('Visit Official Portal') : t('Use App Tracker')} <ArrowRight className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 text-xl font-bold mb-5 border-b pb-3">
                      <FileText className="h-5 w-5 text-primary" /> {t('Required Documents')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.documents.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm bg-background border border-border/80 rounded-xl px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          <span className="font-medium text-foreground">{t(doc)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold mb-6 border-b pb-3">{t('Step-by-Step Procedure')}</h4>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-border/50 before:to-transparent">
                      {result.steps.map((step, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground font-bold shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                            {i + 1}
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-background p-5 rounded-2xl border shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                            <p className="text-sm font-medium leading-relaxed">{t(step)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
};

export default Services;
