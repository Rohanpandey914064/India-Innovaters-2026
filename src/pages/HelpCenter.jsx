import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Book, LifeBuoy, MapPin, Settings, AlertCircle, MessageCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const topicKeys = [
  { icon: MapPin, title: 'Interactive Civic Map', desc: 'Learn how to use the map and read heatmap data for your neighborhood.' },
  { icon: AlertCircle, title: 'Reporting Issues', desc: 'A guide on how to report potholes, streetlights, and other civic problems.' },
  { icon: Settings, title: 'Account Settings', desc: 'Manage your profile, notification preferences, and security settings.' },
  { icon: MessageCircle, title: 'Community Guidelines', desc: 'Rules for voting, commenting, and interacting with other citizens.' },
  { icon: Book, title: 'AI Assistant Guide', desc: 'How to get the most out of our AI civic guidance and scheme finders.' },
  { icon: LifeBuoy, title: 'Contact Support', desc: 'Can\'t find what you\'re looking for? Reach out to our 24/7 support team.' },
];

const HelpCenter = () => {
  const { t } = useLanguage();
  return (
    <div className="flex-1 flex flex-col py-20 px-4 min-h-screen bg-background">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto w-full text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t('How can we help you today?')}</h1>
        <p className="text-xl text-muted-foreground mb-8">{t('Search our knowledge base or browse categories below.')}</p>
        <div className="flex max-w-xl mx-auto gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t('Search help articles...')} 
              className="w-full pl-10 h-12 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
            />
          </div>
          <Button className="h-12 px-6 shadow-sm">{t('Search')}</Button>
        </div>
      </motion.div>
      
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topicKeys.map((topic, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
            <Card className="h-full border border-border hover:border-primary/50 hover:shadow-antigravity transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <topic.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t(topic.title)}</h3>
                <p className="text-muted-foreground leading-relaxed">{t(topic.desc)}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default HelpCenter;
