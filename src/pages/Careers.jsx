import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Briefcase, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const roleKeys = [
  { title: 'Senior AI Engineer', dept: 'Engineering', loc: 'Remote (US/EU)' },
  { title: 'Civic Data Analyst', dept: 'Data Science', loc: 'New York / Hybrid' },
  { title: 'Product Manager', dept: 'Product', loc: 'San Francisco' },
  { title: 'Community Liaison', dept: 'Operations', loc: 'London' },
];

const Careers = () => {
  const { t } = useLanguage();
  return (
    <div className="flex-1 py-20 px-4 min-h-screen bg-background text-foreground">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto w-full text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">{t('Join the Future of Civic Tech')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('We are building the digital twin for smarter cities. Help us bridge the gap between citizens and local government using AI.')}
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold mb-6 px-2">{t('Open Positions')}</h2>
        {roleKeys.map((role, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
            <Card className="hover:border-primary/50 hover:shadow-sm transition-colors group cursor-pointer bg-card border-border">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{t(role.title)}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center bg-secondary px-2.5 py-1 rounded-md text-secondary-foreground font-medium">
                      <Briefcase className="w-4 h-4 mr-2" /> {t(role.dept)}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5" /> {t(role.loc)}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" className="shrink-0 hidden md:flex">
                  {t('View Role')} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto mt-16 text-center text-muted-foreground">
        {t('Don\'t see a perfect fit? Send your resume anyway to')} <span className="text-primary font-medium">careers@cityspark.com</span>
      </div>
    </div>
  );
};
export default Careers;
