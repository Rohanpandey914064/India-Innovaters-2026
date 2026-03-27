import { Issue } from './models/Issue.js';
import { Notification } from './models/Notification.js';
import { User } from './models/User.js';
import bcrypt from 'bcryptjs';

const LOWER_AUTHORITY_PASSWORD = 'Arpit@123';
const LOWER_AUTHORITIES = [
  { name: 'Aarushi Gupta', email: 'aarushi@gmail.com', department: 'Sanitation' },
  { name: 'Aditi Gupta', email: 'aditi@gmail.com', department: 'Electricity' },
  { name: 'Ashish Keshri', email: 'ashish@gmail.com', department: 'Water' },
  { name: 'Rohan Pandey', email: 'rohan@gmail.com', department: 'Infrastructure' },
  { name: 'Aryan Tiwari', email: 'aryan@gmail.com', department: 'Public Transport' },
];

/** Remove legacy global notifications (no userId) after schema change */
export async function migrateNotificationsToPerUser() {
  await Notification.collection.dropIndex('id_1').catch(() => {});
  const r = await Notification.deleteMany({
    $or: [{ userId: { $exists: false } }, { userId: null }, { userId: '' }],
  });
  if (r.deletedCount > 0) {
    console.log(`Removed ${r.deletedCount} legacy notification(s) without userId`);
  }
}

const MOCK_ISSUES = [
  {
    id: 1,
    title: 'Pothole on Main St',
    titles: {
      hi: 'मेन स्ट्रीट पर गड्ढा',
      mr: 'मेन स्ट्रीटवर खड्डा',
      bn: 'মেইন স্ট্রিটে গর্ত',
      ta: 'மெயின் ஸ்ட்ரீட்டில் குழி',
      te: 'మెయిన్ స్ట్రీట్‌లో గుంత',
      gu: 'મેઈન સ્ટ્રીટ પર ખાડો',
      kn: 'ಮೇಯಿನ್ ಸ್ಟ್ರೀಟ್‌ನಲ್ಲಿ ಗುಂಡಿ',
      pa: 'ਮੇਨ ਸਟਰੀਟ ਤੇ ਟੋਆ',
      ur: 'مین سٹریٹ پر گڑھا',
    },
    description: 'A large pothole has formed on the main street causing damage to vehicles.',
    descriptions: {
      hi: 'मुख्य सड़क पर एक बड़ा गड्ढा बन गया है जिससे वाहनों को नुकसान हो रहा है।',
      mr: 'मुख्य रस्त्यावर एक मोठा खड्डा तयार झाला आहे ज्यामुळे वाहनांना नुकसान होत आहे।',
      bn: 'প্রধান রাস্তায় একটি বড় গর্ত তৈরি হয়েছে যা যানবাহনের ক্ষতি করছে।',
      ta: 'முக்கிய சாலையில் ஒரு பெரிய குழி உருவாகியுள்ளது, வாகனங்களுக்கு சேதம் ஏற்படுகிறது.',
      te: 'ప్రధాన రోడ్డులో పెద్ద గుంత ఏర్పడింది, వాహనాలకు నష్టం కలుగుతోంది.',
      gu: 'મુખ્ય રસ્તા પર એક મોટો ખાડો પડ્યો છે જે વાહનોને નુકસાન કરી રહ્યો છે.',
      kn: 'ಮುಖ್ಯ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದ್ದು ವಾಹನಗಳಿಗೆ ಹಾನಿ ಉಂಟಾಗುತ್ತಿದೆ.',
      pa: 'ਮੁੱਖ ਸੜਕ ਤੇ ਇੱਕ ਵੱਡਾ ਟੋਆ ਬਣ ਗਿਆ ਹੈ ਜੋ ਵਾਹਨਾਂ ਨੂੰ ਨੁਕਸਾਨ ਪਹੁੰਚਾ ਰਿਹਾ ਹੈ।',
      ur: 'مین سٹریٹ پر ایک بڑا گڑھا بن گیا ہے جو گاڑیوں کو نقصان پہنچا رہا ہے۔',
    },
    category: 'Infrastructure',
    location: '123 Main St',
    progress: 'In Progress',
    upvotes: 12,
    downvotes: 2,
    authorId: 100,
    lat: 51.505,
    lng: -0.09,
    img: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
    voteMap: {},
    comments: [],
  },
  {
    id: 2,
    title: 'Broken Streetlight',
    titles: {
      hi: 'टूटी हुई सड़क की बत्ती',
      mr: 'तुटलेला रस्त्यावरचा दिवा',
      bn: 'ভাঙা রাস্তার বাতি',
      ta: 'உடைந்த தெரு விளக்கு',
      te: 'విరిగిన వీధి దీపం',
      gu: 'તૂટેલી શેરી લાઇટ',
      kn: 'ಮುರಿದ ಬೀದಿ ದೀಪ',
      pa: 'ਟੁੱਟਿਆ ਸੜਕ ਦਾ ਦੀਵਾ',
      ur: 'ٹوٹی ہوئی سڑک کی روشنی',
    },
    description:
      'The streetlight at Oak Ave has been broken for weeks, creating a safety hazard at night.',
    descriptions: {
      hi: 'ओक एवेन्यू की सड़क बत्ती कई हफ्तों से टूटी है, जिससे रात में सुरक्षा का खतरा है।',
      mr: 'ओक एवेन्यूवरचा दिवा अनेक आठवड्यांपासून बंद आहे, रात्री सुरक्षेचा धोका आहे।',
      bn: 'ওক অ্যাভিনিউর রাস্তার বাতি কয়েক সপ্তাহ ধরে নষ্ট, রাতে নিরাপত্তার ঝুঁকি তৈরি হচ্ছে।',
      ta: 'ஓக் அவென்யூவின் தெரு விளக்கு வாரங்களாக கேடாக உள்ளது, இரவில் பாதுகாப்பு அபாயம் உள்ளது.',
      te: 'ఓక్ ఏవెన్యూ వద్ద వీధి దీపం వారాల తరబడి పాడైపోయింది, రాత్రి సమయంలో ప్రమాదం.',
      gu: 'ઓક એવ.ની શેરી લાઇટ અઠવાડિયાઓથી બંધ છે, રાત્રે સુરક્ષા જોખમ ઊભું થઈ ગયું છે.',
      kn: 'ಓಕ್ ಅವೆನ್ಯೂ ಬೀದಿ ದೀಪ ವಾರಗಳಿಂದ ಕೆಟ್ಟಿದ್ದು, ರಾತ್ರಿ ಸುರಕ್ಷತಾ ಅಪಾಯ ಉಂಟಾಗಿದೆ.',
      pa: 'ਓਕ ਐਵੇਨਿਊ ਦਾ ਦੀਵਾ ਹਫ਼ਤਿਆਂ ਤੋਂ ਟੁੱਟਿਆ ਹੈ, ਰਾਤ ਵੇਲੇ ਸੁਰੱਖਿਆ ਖ਼ਤਰਾ ਬਣ ਗਿਆ ਹੈ।',
      ur: 'اوک ایونیو کی سڑک کی بتی ہفتوں سے خراب ہے، رات کو حفاظتی خطرہ ہے۔',
    },
    category: 'Electricity',
    location: '45 Oak Ave',
    progress: 'Reported',
    upvotes: 34,
    downvotes: 5,
    authorId: 101,
    lat: 51.51,
    lng: -0.1,
    img: 'https://images.unsplash.com/photo-1542482324-4f05cd43cbeb?auto=format&fit=crop&q=80&w=800',
    voteMap: {},
    comments: [],
  },
];

export async function seedIfEmpty() {
  const shouldSeed = String(process.env.SEED_DEFAULT_ISSUES ?? 'true').toLowerCase() !== 'false';
  if (!shouldSeed) {
    console.log('Skipping default issue seed (SEED_DEFAULT_ISSUES=false)');
    return;
  }

  const count = await Issue.countDocuments();
  if (count === 0) {
    await Issue.insertMany(MOCK_ISSUES);
    console.log('Seeded default issues');
  }
}

export async function ensureLowerAuthorityAccounts() {
  const passwordHash = await bcrypt.hash(LOWER_AUTHORITY_PASSWORD, 10);
  let created = 0;
  let updated = 0;

  for (const account of LOWER_AUTHORITIES) {
    const existing = await User.findOne({ email: account.email.toLowerCase() });
    if (existing) {
      existing.name = account.name;
      existing.role = 'authority';
      existing.department = account.department;
      existing.designation = 'Lower Authority Officer';
      existing.authorityLevel = 'L3';
      existing.passwordHash = passwordHash;
      existing.isVerified = true;
      await existing.save();
      updated += 1;
      continue;
    }

    await User.create({
      name: account.name,
      email: account.email.toLowerCase(),
      passwordHash,
      role: 'authority',
      department: account.department,
      designation: 'Lower Authority Officer',
      authorityLevel: 'L3',
      isVerified: true,
    });
    created += 1;
  }

  if (created || updated) {
    console.log(`Lower authority accounts ready (created: ${created}, updated: ${updated})`);
  }
}
