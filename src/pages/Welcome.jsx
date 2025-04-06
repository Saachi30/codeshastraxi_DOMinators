import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Welcome = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [showInfo, setShowInfo] = useState(false);
// Supported languages with their native names
const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' }, // Hindi
  { code: 'gu', name: 'ગુજરાતી' }, // Gujarati
  { code: 'mr', name: 'मराठी' }, // Marathi
  { code: 'bn', name: 'বাংলা' }, // Bengali
  { code: 'ta', name: 'தமிழ்' }, // Tamil
  { code: 'te', name: 'తెలుగు' }, // Telugu
  { code: 'kn', name: 'ಕನ್ನಡ' }, // Kannada
  { code: 'ml', name: 'മലയാളം' }, // Malayalam
  { code: 'pa', name: 'ਪੰਜਾਬੀ' }, // Punjabi
  { code: 'or', name: 'ଓଡ଼ିଆ' }, // Odia
  { code: 'as', name: 'অসমীয়া' }, // Assamese
];

// Multilingual content
const content = {
  en: {
    slogan: "Your Voice, Your Vote, Your Future",
    beginBtn: "Begin Voting",
    howItWorksBtn: "How It Works",
    assistant: "Ask Vee about this platform",
    welcome: "Welcome to",
    description: "India's most secure digital voting platform powered by blockchain technology",
    features: [
      "100% Tamper-Proof",
      "Multi-Language Support",
      "Biometric Verification",
      "Instant Results"
    ]
  },
  hi: {
    slogan: "आपकी आवाज़, आपका वोट, आपका भविष्य",
    beginBtn: "मतदान शुरू करें",
    howItWorksBtn: "यह कैसे काम करता है",
    assistant: "वी से इस प्लेटफ़ॉर्म के बारे में पूछें",
    welcome: "आपका स्वागत है",
    description: "ब्लॉकचेन तकनीक द्वारा संचालित भारत का सबसे सुरक्षित डिजिटल मतदान प्लेटफ़ॉर्म",
    features: [
      "100% छेड़छाड़ से सुरक्षित",
      "बहु-भाषा समर्थन",
      "बायोमेट्रिक सत्यापन",
      "तुरंत परिणाम"
    ]
  },
  bn: {
    slogan: "আপনার কণ্ঠ, আপনার ভোট, আপনার ভবিষ্যৎ",
    beginBtn: "ভোট দেওয়া শুরু করুন",
    howItWorksBtn: "এটি কিভাবে কাজ করে",
    assistant: "ভীকে এই প্ল্যাটফর্ম সম্পর্কে জিজ্ঞাসা করুন",
    welcome: "স্বাগতম",
    description: "ব্লকচেইন প্রযুক্তি দ্বারা চালিত ভারতের সবচেয়ে নিরাপদ ডিজিটাল ভোটিং প্ল্যাটফর্ম",
    features: [
      "100% টেম্পার-প্রুফ",
      "বহু-ভাষা সমর্থন",
      "বায়োমেট্রিক যাচাইকরণ",
      "তাত্ক্ষণিক ফলাফল"
    ]
  },
  ta: {
    slogan: "உங்கள் குரல், உங்கள் வாக்கு, உங்கள் எதிர்காலம்",
    beginBtn: "வாக்களிப்பதைத் தொடங்கவும்",
    howItWorksBtn: "இது எப்படி வேலை செய்கிறது",
    assistant: "இந்த தளம் பற்றி வீயிடம் கேளுங்கள்",
    welcome: "வரவேற்கிறோம்",
    description: "பிளாக்செயின் தொழில்நுட்பத்தால் இயக்கப்படும் இந்தியாவின் மிகப் பாதுகாப்பான டிஜிட்டல் வாக்களிப்பு தளம்",
    features: [
      "100% தடையாக்கம்-ஆதாரம்",
      "பல மொழி ஆதரவு",
      "பயோமெட்ரிக் சரிபார்ப்பு",
      "உடனடி முடிவுகள்"
    ]
  },
  te: {
    slogan: "మీ స్వరం, మీ వోటు, మీ భవిష్యత్తు",
    beginBtn: "వోటింగ్ ప్రారంభించండి",
    howItWorksBtn: "ఇది ఎలా పని చేస్తుంది",
    assistant: "ఈ ప్లాట్ఫార్మ్ గురించి వీని నుండి అడగండి",
    welcome: "స్వాగతం",
    description: "బ్లాక్చెయిన్ టెక్నాలజీతో శక్తిని పొందిన భారతదేశంలోనే అత్యంత సురక్షితమైన డిజిటల్ ఓటింగ్ ప్లాట్ఫారమ్",
    features: [
      "100% ఛేదించలేనిది",
      "బహుళ-భాషా మద్దతు",
      "బయోమెట్రిక్ ధృవీకరణ",
      "తక్షణ ఫలితాలు"
    ]
  },
  mr: {
    slogan: "तुमचा आवाज, तुमचा मत, तुमचे भविष्य",
    beginBtn: "मतदान सुरू करा",
    howItWorksBtn: "हे कसे कार्य करते",
    assistant: "या प्लॅटफॉर्मबद्दल वीकडे विचारा",
    welcome: "स्वागत आहे",
    description: "ब्लॉकचेन तंत्रज्ञानाद्वारे चालविलेले भारतातील सर्वात सुरक्षित डिजिटल मतदान प्लॅटफॉर्म",
    features: [
      "100% बदलण्यास अशक्य",
      "बहु-भाषा समर्थन",
      "बायोमेट्रिक पडताळणी",
      "त्वरित परिणाम"
    ]
  },
  gu: {
    slogan: "તમારો અવાજ, તમારો મત, તમારું ભવિષ્ય",
    beginBtn: "મતદાન શરૂ કરો",
    howItWorksBtn: "આ કેવી રીતે કામ કરે છે",
    assistant: "આ પ્લેટફોર્મ વિશે વીને પૂછો",
    welcome: "સ્વાગત છે",
    description: "બ્લોકચેઇન ટેક્નોલોજી દ્વારા સંચાલિત ભારતની સૌથી સુરક્ષિત ડિજિટલ મતદાન પ્લેટફોર્મ",
    features: [
      "100% ફેરફાર-પ્રૂફ",
      "બહુ-ભાષા સપોર્ટ",
      "બાયોમેટ્રિક ચકાસણી",
      "તાત્કાલિક પરિણામો"
    ]
  },
  kn: {
    slogan: "ನಿಮ್ಮ ಸ್ವರ, ನಿಮ್ಮ ಮತ, ನಿಮ್ಮ ಭವಿಷ್ಯ",
    beginBtn: "ಮತದಾನ ಪ್ರಾರಂಭಿಸಿ",
    howItWorksBtn: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    assistant: "ಈ ವೇದಿಕೆಯ ಬಗ್ಗೆ ವೀಯನ್ನು ಕೇಳಿ",
    welcome: "ಸ್ವಾಗತ",
    description: "ಬ್ಲಾಕ್ಚೈನ್ ತಂತ್ರಜ್ಞಾನದಿಂದ ಚಾಲಿತವಾಗಿರುವ ಭಾರತದ ಅತ್ಯಂತ ಸುರಕ್ಷಿತ ಡಿಜಿಟಲ್ ಮತದಾನ ವೇದಿಕೆ",
    features: [
      "100% ಛೇದಿಸಲಾಗದ",
      "ಬಹು-ಭಾಷೆ ಬೆಂಬಲ",
      "ಬಯೋಮೆಟ್ರಿಕ್ ಪರಿಶೀಲನೆ",
      "ತ್ವರಿತ ಫಲಿತಾಂಶಗಳು"
    ]
  },
  ml: {
    slogan: "നിങ്ങളുടെ ശബ്ദം, നിങ്ങളുടെ വോട്ട്, നിങ്ങളുടെ ഭാവി",
    beginBtn: "വോട്ടിംഗ് ആരംഭിക്കുക",
    howItWorksBtn: "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു",
    assistant: "ഈ പ്ലാറ്റ്ഫോമിനെക്കുറിച്ച് വീയോട് ചോദിക്കുക",
    welcome: "സ്വാഗതം",
    description: "ബ്ലോക്ക്ചെയിൻ ടെക്നോളജി പ്രവർത്തിപ്പിക്കുന്ന ഇന്ത്യയിലെ ഏറ്റവും സുരക്ഷിതമായ ഡിജിറ്റൽ വോട്ടിംഗ് പ്ലാറ്റ്ഫോം",
    features: [
      "100% ടാംപർ-പ്രൂഫ്",
      "മൾട്ടി-ലാംഗ്വേജ് പിന്തുണ",
      "ബയോമെട്രിക് പരിശോധന",
      "തൽക്ഷണ ഫലങ്ങൾ"
    ]
  },
  pa: {
    slogan: "ਤੁਹਾਡੀ ਅਵਾਜ਼, ਤੁਹਾਡਾ ਵੋਟ, ਤੁਹਾਡਾ ਭਵਿੱਖ",
    beginBtn: "ਵੋਟਿੰਗ ਸ਼ੁਰੂ ਕਰੋ",
    howItWorksBtn: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    assistant: "ਵੀ ਨੂੰ ਇਸ ਪਲੇਟਫਾਰਮ ਬਾਰੇ ਪੁੱਛੋ",
    welcome: "ਜੀ ਆਇਆਂ ਨੂੰ",
    description: "ਬਲੌਕਚੇਨ ਟੈਕਨੋਲੋਜੀ ਦੁਆਰਾ ਸੰਚਾਲਿਤ ਭਾਰਤ ਦਾ ਸਭ ਤੋਂ ਸੁਰੱਖਿਅਤ ਡਿਜੀਟਲ ਵੋਟਿੰਗ ਪਲੇਟਫਾਰਮ",
    features: [
      "100% ਟੈਂਪਰ-ਪ੍ਰੂਫ",
      "ਬਹੁ-ਭਾਸ਼ਾ ਸਹਾਇਤਾ",
      "ਬਾਇਓਮੈਟ੍ਰਿਕ ਪੁਸ਼ਟੀਕਰਣ",
      "ਤੁਰੰਤ ਨਤੀਜੇ"
    ]
  },
  or: {
    slogan: "ତୁମର ସ୍ୱର, ତୁମର ଭୋଟ, ତୁମର ଭବିଷ୍ୟତ",
    beginBtn: "ଭୋଟିଂ ଆରମ୍ଭ କରନ୍ତୁ",
    howItWorksBtn: "ଏହା କିପରି କାମ କରେ",
    assistant: "ଏହି ପ୍ଲାଟଫର୍ମ ବିଷୟରେ ଭୀଙ୍କୁ ପଚାରନ୍ତୁ",
    welcome: "ସ୍ୱାଗତ",
    description: "ବ୍ଲକ୍‌ଚେନ୍ ଟେକ୍ନୋଲୋଜି ଦ୍ୱାରା ଚାଳିତ ଭାରତର ସବୁଠାରୁ ସୁରକ୍ଷିତ ଡିଜିଟାଲ୍ ଭୋଟିଂ ପ୍ଲାଟଫର୍ମ",
    features: [
      "100% ଟାମ୍ପର-ପ୍ରୁଫ୍",
      "ବହୁ-ଭାଷା ସମର୍ଥନ",
      "ବାୟୋମେଟ୍ରିକ୍ ଯାଞ୍ଚ",
      "ତତକ୍ଷଣାତ୍ ଫଳାଫଳ"
    ]
  },
  as: {
    slogan: "আপোনাৰ কণ্ঠ, আপোনাৰ ভোট, আপোনাৰ ভৱিষ্যৎ",
    beginBtn: "ভোটদান আৰম্ভ কৰক",
    howItWorksBtn: "ই কেনেকৈ কাম কৰে",
    assistant: "এই প্লেটফৰ্মটোৰ বিষয়ে ভীক সুধক",
    welcome: "স্বাগতম",
    description: "ব্লকচেইন প্ৰযুক্তিৰ দ্বাৰা পৰিচালিত ভাৰতৰ আটাইতকৈ সুৰক্ষিত ডিজিটেল ভোটিং প্লেটফৰ্ম",
    features: [
      "100% টেম্পাৰ-প্ৰুফ",
      "বহু-ভাষা সমৰ্থন",
      "বায়মেট্ৰিক পৰীক্ষণ",
      "তাৎক্ষণিক ফলাফল"
    ]
  }
};
  // Fallback to English if language not available
  const currentContent = content[language] || content['en'];

  return (
    <div className="min-h-screen bg-[#FAF1E6] text-gray-800 flex flex-col">
      {/* Header with language selector */}
      <header className="p-4 flex justify-end">
        <div className="relative group">
          <button className="px-4 py-2 bg-white rounded-lg shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-all border border-gray-200">
            <span className="text-sm text-gray-700">{languages.find(l => l.code === language)?.name || 'English'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 rounded-lg text-gray-700 ${language === lang.code ? 'bg-blue-100 text-blue-600' : ''}`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl md:text-2xl font-light text-[#7FA56D] mb-2">{currentContent.welcome}</h2>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            BharatVote
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {currentContent.description}
          </p>
        </motion.div>

        {/* Slogan */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-2xl md:text-3xl font-medium text-gray-800">
            {currentContent.slogan}
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 w-full max-w-4xl"
        >
          {currentContent.features.map((feature, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-xl hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-10 h-10 mb-3 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-center text-sm md:text-base text-gray-700">{feature}</p>
            </div>
          ))}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-[#99BC85] hover:bg-[#7FA56D] cursor-pointer shadow-xl text-white rounded-lg font-medium text-lg shadow-sm  hover:shadow-md transition-all"
          >
            {currentContent.beginBtn}
          </button>
          <button
            onClick={() => setShowInfo(true)}
            className="px-8 py-3 bg-[#E4EFE7] cursor-pointer shadow-xl text-[#7FA56D] rounded-lg font-medium text-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all border border-gray-200"
          >
            {currentContent.howItWorksBtn}
          </button>
        </motion.div>

        {/* Voice assistant */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-all border border-gray-200"
        >
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700">{currentContent.assistant}</span>
        </motion.button>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} BharatVote - Secure Digital Voting Platform</p>
      </footer>

      {/* How it works modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full relative shadow-xl"
          >
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">How BharatVote Works</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">Secure Authentication</h3>
                  <p className="text-gray-600">Verify your identity using Aadhaar biometrics, OTP, or voter ID to ensure only eligible citizens can vote.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">Blockchain Security</h3>
                  <p className="text-gray-600">Each vote is encrypted and recorded on a decentralized blockchain network, making it tamper-proof and verifiable.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">Transparent Results</h3>
                  <p className="text-gray-600">Real-time vote counting with cryptographic proofs ensures complete transparency in the electoral process.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">Voter Privacy</h3>
                  <p className="text-gray-600">Your vote remains completely anonymous while still being verifiable through zero-knowledge proofs.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                {currentContent.beginBtn}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Welcome;