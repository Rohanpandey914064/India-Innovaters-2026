import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { BookOpen, Code, Database, Globe, Server, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const sectionKeys = [
  { title: 'Getting Started', icon: BookOpen, desc: 'A comprehensive guide to setting up your CitySpark account and reporting your first issue.' },
  { title: 'API Reference', icon: Code, desc: 'Detailed documentation for our public APIs, including civic data and predictive maintenance endpoints.' },
  { title: 'Data Architecture', icon: Database, desc: 'Learn how we store, verify, and secure city-wide civic data while maintaining user privacy.' },
  { title: 'Account Verification', icon: UserCheck, desc: 'How to verify your identity as a citizen or government official to access advanced features.' },
  { title: 'Multilingual Support', icon: Globe, desc: 'Details on our dynamic translation engine powered by Sarvam AI for 22 Indian languages.' },
  { title: 'Server Infrastructure', icon: Server, desc: 'Information on platform uptime, security standards, and our reliable cloud infrastructure.' },
];

const Documentation = () => {
  const { t } = useLanguage();
  return (
    <div className="flex-1 py-20 px-4 min-h-screen bg-background">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto w-full text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t('Documentation & Guides')}</h1>
        <p className="text-xl text-muted-foreground">{t('Everything you need to know about using and integrating with the CitySpark platform.')}</p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectionKeys.map((sec, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="h-full border border-border hover:border-primary/50 hover:shadow-antigravity transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <sec.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">{t(sec.title)}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{t(sec.desc)}</p>
                <div className="mt-4 font-semibold text-primary text-sm flex items-center group-hover:underline">
                  {t('View Documentation')}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Documentation;

