import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { MapPin, Zap, Smartphone, Vote, LayoutDashboard, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const Landing = () => {
  const { t } = useLanguage();

  const features = useMemo(() => [
    { icon: MapPin, title: t('Interactive Civic Map'), desc: t('Visualize issues in your neighborhood with real-time geographic data and heatmaps.') },
    { icon: Zap, title: t('AI Service Guidance'), desc: t('Describe what you need, and our AI instantly points you to the right department.') },
    { icon: Vote, title: t('Community Voting'), desc: t('Upvote critical issues to bring them to the immediate attention of local authorities.') },
    { icon: LayoutDashboard, title: t('Civic Dashboard'), desc: t('Track the status of your reported issues and monitor city-wide resolution metrics.') },
    { icon: Smartphone, title: t('Mobile First Design'), desc: t('Report potholes, broken lights, or graffiti instantly from your smartphone.') },
  ], [t]);

  const howItWorks = useMemo(() => [
    { step: '01', title: t('Spot an Issue'), desc: t('Notice something that needs fixing in your city, like a pothole or a broken streetlight.') },
    { step: '02', title: t('Report & Pin'), desc: t('Snap a photo, add a brief description, and pin the exact location on our interactive map.') },
    { step: '03', title: t('Community Support'), desc: t('Neighbors can upvote your issue, increasing its priority for city maintenance crews.') },
    { step: '04', title: t('Track Resolution'), desc: t('Get notified when the issue is acknowledged, in progress, and finally resolved.') },
  ], [t]);

  const problems = useMemo(() => [
    { problem: t('Long wait times on phone lines to report basic civic issues.'), solution: t('Instant, 24/7 digital reporting with precise GPS location mapping.') },
    { problem: t('Uncertainty about which government department handles what.'), solution: t('AI-driven routing automatically directs your report to the right desk.') },
    { problem: t('Lack of transparency on repair status or community priorities.'), solution: t('Public dashboards and community voting ensure critical issues are fixed first.') },
  ], [t]);

  const benefits = useMemo(() => [
    { icon: Zap, title: t('Faster Resolutions'), desc: t('Direct routing to maintenance crews cuts out the administrative middleman.') },
    { icon: ShieldCheck, title: t('Verified Updates'), desc: t('Official status changes directly from city officials, eliminating guesswork.') },
    { icon: AlertTriangle, title: t('Predictive Maintenance'), desc: t('Our AI analyzes report patterns to fix infrastructure before it totally fails.') },
  ], [t]);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative flex flex-col items-center justify-center pt-32 pb-24 px-4 text-center overflow-hidden bg-background">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary rounded-full mix-blend-multiply blur-3xl opacity-70 animate-pulse animation-delay-200"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="z-10 max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-ping"></span>
            {t('CitySpark is now live in public beta')}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            {t('The Digital Twin for')} <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent">{t('Your Smarter City')}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('Report issues, navigate civic services with AI, and build a better community together through predictive maintenance and transparent data.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-8 text-base shadow-antigravity w-full group">
                {t('Start Building Your City')} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base w-full shadow-sm">
                {t('Sign In to Dashboard')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="py-24 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('How CitySpark Works')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('From spotting a pothole to a paved street, we streamline the entire civic resolution process.')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-black text-primary/5 absolute -top-8 -left-4 z-0 pointer-events-none select-none">{item.step}</div>
                <div className="relative z-10 pt-4">
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                {idx !== howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-[2.5rem] right-[-2rem] text-muted-foreground/30">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-background scroll-mt-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('Powerful tools for citizens')}</h2>
              <p className="text-muted-foreground text-lg">{t('CitySpark empowers you to take charge of your civic environment while helping governments prioritize what matters most.')}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={idx === features.length - 1 ? 'lg:col-span-1' : ''}
              >
                <Card className="h-full border border-border/60 bg-card hover:border-primary/50 hover:shadow-antigravity transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-8 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm relative z-10">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 relative z-10">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed relative z-10">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-zinc-950 text-zinc-50 rounded-t-[3rem] sm:rounded-t-[5rem] overflow-hidden relative">
        <div className="absolute inset-0 bg-transparent opacity-20"></div>
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-16 shadow-sm">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">{t('The Old Way vs. The CitySpark Way')}</h2>
          </div>
          <div className="space-y-6">
            {problems.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="grid md:grid-cols-2 gap-4"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-red-200 mb-1">{t('The Problem')}</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">{item.problem}</p>
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-emerald-200 mb-1">{t('The Solution')}</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">{item.solution}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-card/40 border-b border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('Why CitySpark?')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('Designed for both citizens and city officials to bridge the communication gap.')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm ring-1 ring-primary/20">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 mix-blend-multiply"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('Ready to transform your city?')}</h2>
          <p className="text-xl text-muted-foreground mb-10">
            {t('Join thousands of citizens making a tangible difference in their neighborhoods every single day.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-10 text-lg w-full shadow-antigravity">{t('Create Free Account')}</Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg w-full bg-background/50 backdrop-blur-sm">{t('Log In')}</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

