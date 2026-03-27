/**
 * AIService.js
 * Server-side AI logic for Classification, Duplicate Detection, and Predictive Alerts.
 */

const CATEGORIES = ['Infrastructure', 'Electricity', 'Water', 'Sanitation', 'Public Transport', 'Other'];
const DEPARTMENTS = {
  'Infrastructure': 'Public Works Department',
  'Electricity': 'Electricity Board',
  'Water': 'Water & Sewage Board',
  'Sanitation': 'Municipal Corporation - Health Dept',
  'Public Transport': 'Transport Authority',
  'Other': 'General Administration'
};

const GUIDANCE_KB = [
  {
    id: 'pan_card_services',
    title: 'PAN Card Services',
    department: 'Income Tax Department (NSDL / UTIITSL)',
    location: 'https://www.utiitsl.com/',
    whereToApply: 'https://www.utiitsl.com/',
    timeline: 'Usually 7-15 working days depending on verification',
    fees: 'As per PAN issuance/update fee schedule',
    tags: [
      'pan', 'pan card', 'pancard', 'income tax pan', 'permanent account number',
      'apply pan', 'new pan', 'pan correction', 'pan update'
    ],
    documents: [
      'Proof of Identity (POI)',
      'Proof of Address (POA)',
      'Proof of Date of Birth (DOB)',
      'Passport-size photograph (if required)',
      'Existing PAN copy (for correction/reprint)'
    ],
    steps: [
      'Select application type: New PAN, Correction/Update, or Reprint.',
      'Fill PAN form (Form 49A/49AA as applicable) on official portal.',
      'Upload required POI/POA/DOB documents and complete e-KYC/e-sign if available.',
      'Pay the applicable fee and submit the application.',
      'Track acknowledgment number and download/receive PAN after processing.'
    ],
    importantPoints: [
      'Use only official NSDL/UTIITSL portals; avoid unofficial websites.',
      'Ensure name and date of birth match your identity documents exactly.',
      'Save acknowledgment number for status tracking and support requests.'
    ]
  },
  {
    id: 'aadhaar_services',
    title: 'Aadhaar Card Services',
    department: 'UIDAI / Aadhaar Seva Kendra',
    location: 'Nearest Aadhaar Seva Kendra / Authorized Enrollment Center',
    whereToApply: 'bookappointment.uidai.gov.in or nearest authorized Aadhaar center',
    timeline: 'Enrollment/Update usually completed within 1-3 weeks after processing',
    fees: 'As per UIDAI update fee schedule (varies by update type)',
    tags: [
      'aadhaar', 'aadhar', 'adhar', 'uidai', 'aadhaar card', 'aadhar card',
      'identity card', 'id card', 'biometric update', 'aadhaar update', 'aadhaar enrollment'
    ],
    documents: [
      'Proof of Identity (POI)',
      'Proof of Address (POA)',
      'Date of Birth Proof (if required)',
      'Mobile Number for OTP/status updates'
    ],
    steps: [
      'Choose the service type: new enrollment, demographic update, or biometric update.',
      'Book an appointment online or visit a nearby authorized Aadhaar center.',
      'Carry required POI/POA documents and provide biometrics if requested.',
      'Collect the acknowledgment slip with enrollment/update request number (URN/EID).',
      'Track status on the UIDAI portal and download e-Aadhaar after approval.'
    ],
    importantPoints: [
      'Use only official UIDAI portal or authorized centers; avoid unverified agents.',
      'Check name and date-of-birth spellings carefully before final submission.',
      'Keep your acknowledgment slip safe for status tracking and reprint requests.'
    ]
  },
  {
    id: 'birth_certificate',
    title: 'Birth Certificate',
    department: 'Health & Vital Statistics',
    location: 'Zonal Health Center / Online',
    whereToApply: 'Municipal e-Services portal or nearest Zonal Registrar Office',
    timeline: 'Usually 3-7 working days after verification',
    fees: 'Nominal municipal fee (varies by zone)',
    tags: ['birth', 'newborn', 'baby', 'child', 'certificate', 'registration', 'hospital discharge'],
    documents: ['Hospital Birth Record', 'Parent ID Proof', 'Address Proof', 'Application Form'],
    steps: [
      'Complete the birth registration form with correct child and parent details.',
      'Upload or submit hospital birth record and identity documents.',
      'Verify details at the registrar office if requested by officials.',
      'Track status on portal and download certificate once approved.'
    ],
    importantPoints: [
      'Register early to avoid late registration affidavit requirements.',
      'Ensure spellings match government ID records exactly.',
      'Keep the application reference number for follow-up.'
    ]
  },
  {
    id: 'death_certificate',
    title: 'Death Certificate',
    department: 'Health & Vital Statistics',
    location: 'Registrar Office / Online',
    whereToApply: 'Zonal Registrar Office or municipal civil registration portal',
    timeline: 'Usually 3-10 working days',
    fees: 'Nominal municipal fee',
    tags: ['death', 'deceased', 'demise', 'certificate', 'hospital summary', 'cremation'],
    documents: ['Medical Death Summary', 'Applicant ID Proof', 'Address Proof', 'Relationship Declaration'],
    steps: [
      'Submit death registration application with deceased details.',
      'Attach medical death summary and applicant identity documents.',
      'Respond to verification queries from registrar if needed.',
      'Collect or download signed digital certificate.'
    ],
    importantPoints: [
      'Names and dates must match hospital records exactly.',
      'Keep copies for legal, bank, and insurance procedures.'
    ]
  },
  {
    id: 'trade_license',
    title: 'Trade / Business License',
    department: 'General Administration / Licensing Dept',
    location: 'Municipal Licensing Office',
    whereToApply: 'City business licensing portal or licensing counter',
    timeline: 'Typically 7-15 working days',
    fees: 'Category and business-size based',
    tags: ['license', 'licence', 'permit', 'shop', 'business', 'trade', 'renewal'],
    documents: ['Identity Proof', 'Address Proof', 'Business Address Proof', 'Photograph', 'NOC (if applicable)'],
    steps: [
      'Choose new application or renewal as applicable.',
      'Submit business details and upload required documents.',
      'Pay applicable processing charges online.',
      'Complete site inspection/compliance check if requested.',
      'Download approved license from portal dashboard.'
    ],
    importantPoints: [
      'Apply renewal before expiry to avoid penalty.',
      'Business category must match actual activity for compliance.'
    ]
  },
  {
    id: 'water_leak_or_supply',
    title: 'Water Leak / Water Supply Complaint',
    department: 'Water & Sewage Board',
    location: 'Water Board Helpline Desk / Ward Office',
    whereToApply: 'City grievance portal, helpline, or ward office complaint desk',
    timeline: 'Inspection in 24-72 hours for normal cases',
    fees: 'No fee for complaint lodging',
    tags: ['water', 'leak', 'pipeline', 'sewage', 'drain', 'overflow', 'no water', 'water supply'],
    documents: ['Issue Photo/Video', 'Exact Location Details', 'Contact Number'],
    steps: [
      'Log complaint with exact landmark, street, and timing details.',
      'Upload clear evidence photo/video where possible.',
      'Track assigned complaint number in app/portal.',
      'Escalate if unresolved beyond stated service timeline.'
    ],
    importantPoints: [
      'Mention whether the issue is active leakage or no-supply.',
      'Add nearby landmarks for faster field-team routing.',
      'Mark as emergency if road cave-in or contamination risk exists.'
    ]
  },
  {
    id: 'electricity_issue',
    title: 'Power Outage / Streetlight Issue',
    department: 'Electricity Board',
    location: 'Electricity Complaint Cell / Online',
    whereToApply: 'Electricity utility app/portal or emergency helpline',
    timeline: 'Critical outages prioritized within hours',
    fees: 'No fee for complaint lodging',
    tags: ['electricity', 'power', 'outage', 'streetlight', 'wire', 'transformer', 'sparking'],
    documents: ['Consumer Number (if available)', 'Location Details', 'Issue Photo (optional)'],
    steps: [
      'Confirm if outage is planned using utility notice board.',
      'Register complaint with exact location and fault type.',
      'Share consumer/account details for faster verification.',
      'Track ticket updates and restoration estimate.'
    ],
    importantPoints: [
      'Treat exposed wires/sparking as high-risk emergency.',
      'Avoid touching electric poles or waterlogged panels.'
    ]
  },
  {
    id: 'road_pothole',
    title: 'Road Damage / Pothole Complaint',
    department: 'Public Works Department',
    location: 'Ward Engineering Office / Online Grievance',
    whereToApply: 'City grievance portal or PWD complaint desk',
    timeline: 'Inspection typically 2-5 working days',
    fees: 'No fee for complaint lodging',
    tags: ['pothole', 'road', 'street', 'crack', 'pavement', 'bridge', 'sinkhole'],
    documents: ['Issue Photos', 'Exact Location/Pin', 'Reporter Contact'],
    steps: [
      'Report issue with precise location and lane direction.',
      'Attach photos showing severity and surrounding traffic context.',
      'Track complaint status and assigned engineer details.',
      'Escalate if no action within service window.'
    ],
    importantPoints: [
      'Highlight accident risk, school zone, or hospital approach road.',
      'Upload multiple photos from different angles for clarity.'
    ]
  },
  {
    id: 'sanitation',
    title: 'Garbage / Sanitation Complaint',
    department: 'Municipal Corporation - Health Dept',
    location: 'Ward Sanitation Office',
    whereToApply: 'Municipal sanitation portal or ward complaint desk',
    timeline: 'Usually 24-72 hours depending on zone',
    fees: 'No fee for complaint lodging',
    tags: ['garbage', 'trash', 'waste', 'cleaning', 'smell', 'dump', 'sanitation'],
    documents: ['Issue Photo', 'Location', 'Contact Number'],
    steps: [
      'Register complaint with location and type of waste issue.',
      'Attach photos showing pile size or overflow condition.',
      'Follow complaint ID for pickup and cleaning schedule.',
      'Escalate repeated non-clearance to zonal health officer.'
    ],
    importantPoints: [
      'Mention if near schools, hospitals, or food markets.',
      'Frequent repeat complaints indicate route planning gaps.'
    ]
  },
  {
    id: 'generic',
    title: 'General Civic Guidance',
    department: 'Civic Help Desk',
    location: 'Main City Hall - Information Kiosk',
    whereToApply: 'Main civic portal helpdesk section',
    timeline: 'Depends on selected department process',
    fees: 'Depends on service requested',
    tags: [],
    documents: ['Government ID Proof', 'Address Proof', 'Application Form (as required)'],
    steps: [
      'Describe the request clearly with location and urgency context.',
      'Select the nearest matching department from the provided guidance.',
      'Prepare standard ID/address documents before visiting office/portal.',
      'Track your reference number and escalate if timeline is exceeded.'
    ],
    importantPoints: [
      'Specific location details significantly improve routing accuracy.',
      'Include urgency and public-safety impact in your request.'
    ]
  }
];

const STOP_WORDS = new Set(['the', 'is', 'for', 'and', 'or', 'to', 'a', 'an', 'of', 'in', 'on', 'with', 'my', 'i', 'need', 'help']);

const normalizeText = (text = '') => text
  .toLowerCase()
  .replace(/pan\s+car\b/g, 'pan card')
  .replace(/pancard\b/g, 'pan card')
  .replace(/aadhar\s+car\b/g, 'aadhaar card')
  .replace(/aadhar\s+card\b/g, 'aadhaar card')
  .replace(/aadhar\b/g, 'aadhaar')
  .replace(/adhar\b/g, 'aadhaar')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const tokenize = (text = '') => normalizeText(text)
  .split(' ')
  .map((w) => w.trim())
  .filter((w) => w && !STOP_WORDS.has(w));

const inferUrgency = (q) => {
  if (/urgent|emergency|accident|danger|critical|immediately|asap/.test(q)) return 'High';
  if (/soon|priority|quick/.test(q)) return 'Medium';
  return 'Normal';
};

const detectImportantFlags = (q) => {
  const flags = [];
  if (/hospital|school|children|elderly|ambulance/.test(q)) flags.push('Sensitive public area involved.');
  if (/night|dark|rain|monsoon|flood/.test(q)) flags.push('Environmental conditions may increase risk.');
  if (/injury|accident|unsafe|hazard/.test(q)) flags.push('Public safety risk indicated.');
  return flags;
};

const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  te: 'Telugu',
  mr: 'Marathi',
  ta: 'Tamil',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi (Gurmukhi)'
};

const buildGuidanceFromKb = (item, q) => ({
  matched_service: item.title,
  department: item.department,
  where_to_go: item.whereToApply || item.location,
  location: item.location,
  documents: Array.isArray(item.documents) ? item.documents : [],
  steps: Array.isArray(item.steps) ? item.steps : [],
  important_points: [...(Array.isArray(item.importantPoints) ? item.importantPoints : []), ...detectImportantFlags(q)],
  urgency: inferUrgency(q),
  timeline: item.timeline || 'Depends on service type',
  estimated_fees: item.fees || 'As per official schedule',
  confidence: 0.82,
  reasoning: 'Matched from civic service knowledge base.'
});

const findKbMatch = (q) => {
  const queryTokens = new Set(tokenize(q));
  const scored = GUIDANCE_KB.map((item) => {
    if (!Array.isArray(item.tags) || item.tags.length === 0) return { item, score: 0 };
    let score = 0;
    for (const tag of item.tags) {
      const normalizedTag = normalizeText(tag);
      if (!normalizedTag) continue;
      if (q.includes(normalizedTag)) score += normalizedTag.split(' ').length >= 2 ? 5 : 3;
      for (const tk of normalizedTag.split(' ')) {
        if (queryTokens.has(tk)) score += 1;
      }
    }
    return { item, score };
  }).sort((a, b) => b.score - a.score);

  return scored[0]?.score >= 4 ? scored[0].item : null;
};

export const classifyIssue = async (title, description) => {
  const content = (title + ' ' + description).toLowerCase();
  
  let category = 'Other';
  if (content.includes('pothole') || content.includes('road') || content.includes('bridge') || content.includes('crack')) {
    category = 'Infrastructure';
  } else if (content.includes('light') || content.includes('wire') || content.includes('power') || content.includes('electricity')) {
    category = 'Electricity';
  } else if (content.includes('water') || content.includes('leak') || content.includes('pipe') || content.includes('sewage')) {
    category = 'Water';
  } else if (content.includes('garbage') || content.includes('trash') || content.includes('clean') || content.includes('smell')) {
    category = 'Sanitation';
  } else if (content.includes('bus') || content.includes('metro') || content.includes('train') || content.includes('stop')) {
    category = 'Public Transport';
  }

  return {
    category,
    department: DEPARTMENTS[category] || 'General Administration',
    urgency: content.includes('danger') || content.includes('accident') || content.includes('critical') ? 'High' : 'Medium'
  };
};

export const findDuplicate = (newIssue, existingIssues) => {
  return existingIssues.find(issue => {
    const latDiff = Math.abs(newIssue.lat - issue.lat);
    const lngDiff = Math.abs(newIssue.lng - issue.lng);
    const locationMatch = latDiff < 0.001 && lngDiff < 0.001; // ~100m radius
    
    // Simplistic title checking
    const titleMatch = newIssue.title.toLowerCase().split(' ').some(word => 
      word.length > 3 && issue.title.toLowerCase().includes(word)
    );

    return locationMatch && titleMatch && issue.progress !== 'Resolved';
  });
};

export const calculatePriorityScore = (issue, votes = {}) => {
  const severity = issue.severity || 'Low';
  const severityMap = { Low: 25, Medium: 50, High: 75, Critical: 100 };
  const severityScore = severityMap[severity] ?? 25;

  let aiScore = severityScore;
  if (issue.category === 'Water' || issue.category === 'Infrastructure') aiScore += 8;
  if (issue.urgency === 'High') aiScore += 15;
  else if (issue.urgency === 'Medium') aiScore += 8;
  if (issue.isRepeat) aiScore += 10;
  aiScore = Math.min(Math.max(aiScore, 0), 100);

  let upvotes = Number(issue.upvotes || 0);
  let downvotes = Number(issue.downvotes || 0);

  // Prefer exact vote map when available.
  if (votes && typeof votes === 'object' && Object.keys(votes).length > 0) {
    const arr = Object.values(votes);
    upvotes = arr.filter((v) => v === 1).length;
    downvotes = arr.filter((v) => v === -1).length;
  }

  const totalVotes = upvotes + downvotes;
  const voteRatioPercent = totalVotes === 0 ? 0 : (upvotes / totalVotes) * 100;

  // Requested formula: 0.3 * AI score + 0.7 * (upvotes / totalVotes) * 100
  const weightedScore = Math.round(0.3 * aiScore + 0.7 * voteRatioPercent);

  return Math.min(Math.max(weightedScore, 0), 100);
};

export const getPriorityLabel = (score) => {
  if (score >= 85) return 'Critical';
  if (score >= 65) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
};

export const analyzePredictiveRisks = (issue, history = []) => {
  const content = (issue.title + ' ' + issue.description).toLowerCase();
  
  if (content.includes('water') && content.includes('leak')) {
    return {
      type: 'Predictive Alert',
      message: 'High Risk: Sustained water leakage detected. Potential structural soil erosion and road subsidence expected within 48-72 hours.',
      riskLevel: 'High'
    };
  }
  
  if (issue.category === 'Infrastructure' && issue.isRepeat) {
    return {
      type: 'Structural Risk',
      message: 'Persistent issues reported in this segment. Potential long-term structural failure. Recommend deep inspection.',
      riskLevel: 'Medium'
    };
  }

  return null;
};

export const getCivicGuidance = async (query, language = 'en') => {
  const raw = String(query || '').trim();
  const q = normalizeText(raw);
  const langCode = String(language || 'en').toLowerCase();
  const targetLanguage = LANGUAGE_NAMES[langCode] || LANGUAGE_NAMES.en;

  const fallback = {
    department: 'Civic Help Desk',
    location: 'Main City Hall - Information Kiosk',
    where_to_go: 'Official service portal or nearest authorized service center',
    documents: ['Government ID Proof', 'Address Proof', 'Service-specific form/documents'],
    steps: [
      'Clearly specify the service you need (example: PAN card, debit card, ration card).',
      'Use the relevant official portal or authorized office listed for that service.',
      'Submit required identity/address documents and keep acknowledgement number.',
      'Track status online and follow escalation path if timeline is exceeded.'
    ],
    important_points: [
      'Use only official websites and authorized centers.',
      'Avoid third-party agents who promise instant approvals.',
      'Keep acknowledgement/reference number for tracking.'
    ],
    confidence: 0.35,
    urgency: inferUrgency(q),
    timeline: 'Depends on selected service and verification',
    estimated_fees: 'As per official service fee schedule',
    matched_service: 'General Service Guidance',
    reasoning: 'Returned safe fallback guidance because AI output was unavailable or invalid.'
  };

  if (!q) {
    return {
      ...fallback,
      confidence: 0.2,
      reasoning: 'No query content provided.'
    };
  }

  const kbMatch = findKbMatch(q);
  if (kbMatch) {
    return buildGuidanceFromKb(kbMatch, q);
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    return {
      ...fallback,
      reasoning: 'No AI API key configured on server. Set GEMINI_API_KEY in server/.env for dynamic responses.'
    };
  }

  const models = ['gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-pro'];
  const prompt = [
    'You are an Indian public-service assistant.',
    'Given a user query, return exact practical guidance for the relevant service.',
    'Handle ANY service category dynamically, including banking-card requests (credit/debit), PAN, Aadhaar, ration, certificates, utilities, etc.',
    'Prefer official portals/authorized channels. Do not invent personal addresses.',
    `Respond in ${targetLanguage}.`,
    'Return STRICT JSON only with this schema:',
    '{',
    '  "matched_service": "string",',
    '  "department": "string",',
    '  "where_to_go": "string",',
    '  "location": "string",',
    '  "documents": ["string"],',
    '  "steps": ["string"],',
    '  "important_points": ["string"],',
    '  "urgency": "Normal|Medium|High",',
    '  "timeline": "string",',
    '  "estimated_fees": "string",',
    '  "confidence": 0.0,',
    '  "reasoning": "one short sentence"',
    '}',
    'Rules:',
    '- documents: 3-6 items',
    '- steps: 4-7 concise ordered actions (no numbering in text)',
    '- important_points: 2-5 critical warnings/tips',
    '- confidence must be a number between 0 and 1',
    `User query: ${raw}`
  ].join('\n');

  for (const model of models) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.15 }
        })
      });

      if (!resp.ok) continue;

      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) continue;

      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      const normalizeArray = (arr) => Array.isArray(arr)
        ? arr.filter(Boolean).map((x) => String(x).trim()).slice(0, 7)
        : [];

      const result = {
        matched_service: String(parsed.matched_service || fallback.matched_service),
        department: String(parsed.department || fallback.department),
        where_to_go: String(parsed.where_to_go || parsed.location || fallback.where_to_go),
        location: String(parsed.location || parsed.where_to_go || fallback.location),
        documents: normalizeArray(parsed.documents).length ? normalizeArray(parsed.documents) : fallback.documents,
        steps: normalizeArray(parsed.steps).length ? normalizeArray(parsed.steps) : fallback.steps,
        important_points: normalizeArray(parsed.important_points).length ? normalizeArray(parsed.important_points) : fallback.important_points,
        urgency: ['Normal', 'Medium', 'High'].includes(parsed.urgency) ? parsed.urgency : fallback.urgency,
        timeline: String(parsed.timeline || fallback.timeline),
        estimated_fees: String(parsed.estimated_fees || fallback.estimated_fees),
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.6)),
        reasoning: String(parsed.reasoning || 'AI-generated dynamic service guidance.')
      };

      const flags = detectImportantFlags(q);
      for (const f of flags) {
        if (!result.important_points.includes(f)) result.important_points.push(f);
      }

      return result;
    } catch (_e) {
      // Try next model.
    }
  }

  return fallback;
};
