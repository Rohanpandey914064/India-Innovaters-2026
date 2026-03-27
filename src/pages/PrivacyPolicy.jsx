import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const PrivacyPolicy = () => {
  const { t } = useLanguage();
  return (
    <div className="flex-1 py-20 px-4 min-h-screen bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t('Privacy Policy')}</h1>
        <p className="text-muted-foreground mb-12">{t('Last Updated')}: {new Date().toLocaleDateString()}</p>
        
        <h2>{t('1. Data Collection')}</h2>
        <p>{t('We collect information such as your name, email, and geographic location only when you explicitly provide it for reporting issues or creating an account.')}</p>
        
        <h2>{t('2. How We Use Data')}</h2>
        <p>{t('Your data is used to verify civic reports, facilitate communication between citizens and city officials, and improve our predictive maintenance AI.')}</p>
        
        <h2>{t('3. Data Sharing')}</h2>
        <p>{t('We do not sell your personal data. Public reports (excluding your name/email) are shared with municipal agencies to resolve city-wide infrastructure issues.')}</p>
        
        <h2>{t('4. Cookie Policy')}</h2>
        <p>{t('We use minimal local storage and cookies strictly to manage your preferences and active session.')}</p>

        <h2>{t('5. Contact Us')}</h2>
        <p>{t('If you have questions about your privacy on CitySpark, reach out to us at')} <strong>privacy@cityspark.com</strong>.</p>
      </motion.div>
    </div>
  );
};
export default PrivacyPolicy;

