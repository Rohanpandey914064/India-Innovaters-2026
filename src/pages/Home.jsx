import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import {
  Plus, MapPin, BarChart3, AlertTriangle, CheckCircle, TrendingUp, Zap,
  Sparkles, ArrowRight, FileText
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const getColorClasses = (color) => {
  const colors = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: 'bg-blue-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: 'bg-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: 'bg-amber-500/20' },
    red: { bg: 'bg-red-500/10', text: 'text-red-600', icon: 'bg-red-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', icon: 'bg-purple-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-600', icon: 'bg-orange-500/20' },
  };
  return colors[color] || colors.blue;
};

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
  const classes = getColorClasses(color);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/50 p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${classes.icon} ${classes.text}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tight">{value}</p>
    </motion.div>
  );
};

// eslint-disable-next-line no-unused-vars
const ActionCard = ({ icon: Icon, title, desc, link, color = 'blue' }) => {
  const classes = getColorClasses(color);
  return (
    <motion.div whileHover={{ scale: 1.02, y: -5 }}>
      <Link to={link}>
        <div className={`rounded-2xl border border-border/60 bg-gradient-to-br ${classes.bg} p-6 cursor-pointer hover:shadow-lg transition-all h-full`}>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${classes.icon} ${classes.text}`}>
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{desc}</p>
          <div className={`inline-flex items-center text-sm font-semibold gap-1 ${classes.text}`}>
            {title} <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const { issues } = useApp();
  const { t } = useLanguage();

  const stats = useMemo(() => {
    const userIssues = issues.filter((i) => i.authorId === user?.id);
    const reported = issues.length;
    const inProgress = issues.filter((i) => i.progress === 'In Progress').length;
    const resolved = issues.filter((i) => i.progress === 'Resolved').length;
    return { userIssues: userIssues.length, reported, inProgress, resolved };
  }, [issues, user?.id]);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-card/50 to-background pt-12 pb-20">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply opacity-40"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl mix-blend-multiply opacity-30"></div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <Sparkles className="w-4 h-4" />
                {t('Welcome to CitySpark')}
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                {t('Hi')}, <span className="text-primary">{user?.name || t('Civic Hero')}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {t('Your community needs you. Report issues, vote on priorities, and help build a better city together.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
              <ActionCard icon={Plus} title={t('Report Issue')} desc={t('Spot something that needs fixing? Report it now.')} link="/report" color="emerald" />
              <ActionCard icon={MapPin} title={t('View Map')} desc={t('See all reported issues geo-mapped.')} link="/map" color="blue" />
              <ActionCard icon={BarChart3} title={t('Dashboard')} desc={t('Track your reports & community impact.')} link="/dashboard" color="purple" />
              <ActionCard icon={Zap} title={t('Citizen Services')} desc={t('Get step-by-step guidance for civic documents and services.')} link="/services" color="orange" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-7xl py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">{t('Your Impact')}</h2>
          <p className="text-muted-foreground">{t('This is what your community is working on together.')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FileText} label={t('Total Reports')} value={stats.reported} color="blue" />
          <StatCard icon={AlertTriangle} label={t('In Progress')} value={stats.inProgress} color="amber" />
          <StatCard icon={CheckCircle} label={t('Resolved')} value={stats.resolved} color="emerald" />
          <StatCard icon={TrendingUp} label={t('My Reports')} value={stats.userIssues} color="purple" />
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-7xl py-16 mt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-12 text-center"
        >
          <h3 className="text-3xl font-bold mb-4">{t('See Something That Needs Fixing?')}</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('Your report is the first step towards a better city. Quick, easy, and impactful.')}
          </p>
          <Button size="lg" asChild className="rounded-full shadow-lg h-12 px-8 text-base">
            <Link to="/report">
              <Plus className="w-5 h-5 mr-2" />
              {t('Report an Issue Now')}
            </Link>
          </Button>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;
