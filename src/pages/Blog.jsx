import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const postKeys = [
  { title: 'The Future of AI in Municipal Governance', date: 'March 15, 2026', readMin: 5, img: 'bg-blue-500/10' },
  { title: 'How Predictive Maintenance is Saving City Budgets', date: 'February 28, 2026', readMin: 8, img: 'bg-emerald-500/10' },
  { title: 'Bridging the Gap: Connecting Citizens to City Hall', date: 'January 10, 2026', readMin: 4, img: 'bg-purple-500/10' },
  { title: 'Open Data: Empowering Communities Through Transparency', date: 'November 22, 2025', readMin: 6, img: 'bg-orange-500/10' },
  { title: 'Case Study: Solving Sanitation Issues in Zone 4', date: 'October 05, 2025', readMin: 7, img: 'bg-cyan-500/10' },
  { title: 'Getting Started with CitySpark: A Quick Guide', date: 'September 14, 2025', readMin: 3, img: 'bg-rose-500/10' },
];

const Blog = () => {
  const { t } = useLanguage();
  return (
    <div className="flex-1 flex flex-col py-20 px-4 min-h-screen bg-background">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto w-full text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t('CitySpark Blog')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('Insights, updates, and stories from the pioneers of civic technology.')}</p>
      </motion.div>
      
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {postKeys.map((post, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
            <Card className="h-full overflow-hidden border border-border hover:border-primary/50 hover:shadow-antigravity transition-all cursor-pointer group flex flex-col">
              <div className={`h-48 w-full ${post.img} flex items-center justify-center transition-transform group-hover:scale-105 duration-500`}>
                 <span className="text-4xl opacity-50 filter drop-shadow-sm">ðŸ“°</span>
              </div>
              <CardContent className="p-6 relative bg-card flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                  <Calendar className="h-3 w-3" /> {t(post.date)} â€¢ {post.readMin} {t('min read')}
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors flex-1">{t(post.title)}</h3>
                <div className="mt-4 flex items-center text-primary font-medium text-sm">
                  {t('Read Article')} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Blog;

