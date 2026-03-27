import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const About = () => {
  const { t } = useLanguage();
  const stats = [
    { val: '150+', label: 'Cities Integrated' },
    { val: '2M+', label: 'Civic Issues Resolved' },
    { val: '99.9%', label: 'Platform Uptime' },
  ];

  return (
    <div className="flex-1 py-20 px-4 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
            {t('Our Story')}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">{t('Pioneering the Digital Twin for Smarter Cities')}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t('CitySpark was born out of a simple idea: that every citizen should have a direct, transparent, and AI-powered voice in their city\'s development.')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 mb-20 text-center">
          {stats.map((s, i) => (
             <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }} className="p-8 rounded-2xl bg-card border border-border shadow-sm">
                <div className="text-5xl font-black text-primary mb-2 drop-shadow-sm">{s.val}</div>
                <div className="text-muted-foreground font-medium uppercase tracking-widest text-xs">{t(s.label)}</div>
             </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="prose prose-lg dark:prose-invert mx-auto bg-card p-8 md:p-12 rounded-3xl border border-border shadow-sm">
          <h2 className="text-3xl font-bold mb-6">{t('Our Mission')}</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {t('We aim to democratize civic data and empower local governments with predictive maintenance tools. By turning every citizen\'s report into a data point for a smarter city, we help prioritize infrastructure fixes where they are needed most.')}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t('Our platform bridges the critical communication gap between municipal authorities and the people they serve, ensuring no pothole, broken streetlight, or sanitation issue goes unnoticed.')}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
export default About;

