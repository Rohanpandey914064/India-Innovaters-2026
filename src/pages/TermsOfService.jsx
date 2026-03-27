import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const TermsOfService = () => {
  const { t } = useLanguage();
  return (
    <div className="flex-1 py-20 px-4 min-h-screen bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t('Terms of Service')}</h1>
        <p className="text-muted-foreground mb-12">{t('Last Updated')}: {new Date().toLocaleDateString()}</p>
        
        <h2>{t('1. Acceptance of Terms')}</h2>
        <p>{t('By accessing and using CitySpark, you agree to be bound by these Terms of Service and all applicable laws and regulations.')}</p>
        
        <h2>{t('2. User Conduct')}</h2>
        <p>{t('Users are responsible for all content they post on the platform. Any misuse, false reporting, or harassment will lead to immediate account termination.')}</p>
        
        <h2>{t('3. Privacy & Data')}</h2>
        <p>{t('Your privacy is important to us. Our Privacy Policy governs the collection and use of your data on the CitySpark platform.')}</p>
        
        <h2>{t('4. Content Ownership')}</h2>
        <p>{t('You retain ownership of the content you post, but grant CitySpark a worldwide license to use, host, and share your civic reports for resolution purposes.')}</p>

        <h2>{t('5. Limitation of Liability')}</h2>
        <p>{t('CitySpark is provided "as is". We are not liable for any damages arising from your use of the civic platform or its AI guidance.')}</p>

        <h2>{t('6. Changes to Terms')}</h2>
        <p>{t('We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the new terms.')}</p>
      </motion.div>
    </div>
  );
};
export default TermsOfService;

