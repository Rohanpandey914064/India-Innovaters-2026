import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const Pricing = () => {
  const { t } = useLanguage();

  const tiers = [
    { 
      name: 'Starter', price: '$0', desc: 'Free forever for citizens to report and track issues.',
      features: ['Unlimited Issue Reporting', 'Interactive Map Access', 'Community Voting', 'Mobile App Support']
    },
    { 
      name: 'Pro', price: '$49', desc: 'For community leaders and active neighborhood watch groups.',
      features: ['Advanced Heatmaps', 'Priority Support', 'Custom Notifications', 'Data Export (CSV/PDF)', 'AI Insight Reports'],
      highlighted: true
    },
    { 
      name: 'Enterprise', price: 'Custom', desc: 'Full-scale solutions for municipal governments and large cities.',
      features: ['Predictive Maintenance API', 'Administrative Dashboard', 'Department Routing', 'SLA Tracking', 'Public Data API']
    }
  ];

  return (
    <div className="flex-1 py-20 px-4 min-h-screen bg-background pb-32">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto w-full text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t('Simple, Transparent Pricing')}</h1>
        <p className="text-xl text-muted-foreground">{t('Choose the plan that best fits your community\'s needs.')}</p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {tiers.map((tier, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }} className="flex">
            <Card className={`w-full flex flex-col border ${tier.highlighted ? 'border-primary ring-2 ring-primary/20 shadow-antigravity' : 'border-border'} hover:border-primary/50 transition-all`}>
              {tier.highlighted && (
                 <div className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest text-center py-1.5 rounded-t-lg">
                   {t('Most Popular')}
                 </div>
              )}
              <CardContent className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">{t(tier.name)}</h3>
                <p className="text-muted-foreground text-sm mb-6 h-10">{t(tier.desc)}</p>
                <div className="text-4xl font-extrabold mb-8">{t(tier.price)}<span className="text-lg text-muted-foreground font-normal tracking-normal">{tier.price !== 'Custom' && '/mo'}</span></div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-primary mr-3 shrink-0" />
                      <span className="text-sm font-medium">{t(f)}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={tier.highlighted ? "default" : "outline"}>
                  {tier.price === 'Custom' ? t('Contact Sales') : t('Get Started')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Pricing;
