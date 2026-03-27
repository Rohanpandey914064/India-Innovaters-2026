import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { UI_LANGUAGES } from '@/context/translations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  User, Mail, Shield, Globe, Bell, Lock, Eye, Moon, Sun,
  Check, Camera, Smartphone, LogOut, Trophy, Zap, Medal, Target, Star, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';

const SectionHeader = ({ icon: Icon, title, description }) => (
  <CardHeader className="pb-4">
    <CardTitle className="flex items-center gap-2 text-base font-semibold">
      <span className="p-1.5 rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
      {title}
    </CardTitle>
    {description && <CardDescription className="text-xs">{description}</CardDescription>}
  </CardHeader>
);

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  </div>
);

const Profile = () => {
  const { user, logout } = useAuth();
  const { userStats } = useApp();
  const { theme, setTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const stats = userStats[user?.id] || { points: 0, badges: [] };
  
  // Calculate progress to next badge
  const nextMilestone = stats.points < 100 ? 100 : stats.points < 500 ? 500 : stats.points < 1000 ? 1000 : 2500;
  const progressPercent = Math.min((stats.points / nextMilestone) * 100, 100);
  const badgesRemaining = 3 - stats.badges.length;

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    newReport: true,
    statusUpdate: true,
    comments: false,
    newsletter: false,
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showReports: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const themeOptions = [
    { value: 'light', label: t('Light'), icon: Sun },
    { value: 'dark', label: t('Dark'), icon: Moon },
    { value: 'eye-comfort', label: t('Eye Comfort'), icon: Eye },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 border-b border-border/50 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">{t('Profile & Settings')}</h1>
        <p className="text-muted-foreground text-lg">{t('Manage your account, preferences, and security settings.')}</p>
      </div>

      <div className="space-y-6">
        {/* Civic Rewards Dashboard */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Trophy className="w-32 h-32 text-primary" />
            </div>
            <CardContent className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary/20 text-primary">
                      <Zap className="h-5 w-5 fill-current" />
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight">{t('Civic Rewards')}</h2>
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    {t('You earn points for every report, vote, and helpful comment.')}
                  </p>
                </div>
                
                <div className="text-right">
                   <div className="text-4xl font-black text-primary flex items-center gap-2 justify-end">
                     {stats.points} <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{t('pts')}</span>
                   </div>
                   <p className="text-[11px] font-bold text-muted-foreground uppercase mt-1">{t('Citizen Reputation Score')}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('Next Rank Milestone')}</span>
                  <span className="text-xs font-bold text-primary">{stats.points} / {nextMilestone}</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden shadow-inner p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-primary rounded-full shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-center text-muted-foreground italic">
                   {badgesRemaining > 0 
                     ? `${t('Just')} ${nextMilestone - stats.points} ${t('more points to earn your next badge!')}` 
                     : t('You are a legendary City Hero!')}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { id: 'watcher', name: 'Watcher', icon: '👁️', req: 100 },
                  { id: 'guardian', name: 'Guardian', icon: '🛡️', req: 500 },
                  { id: 'hero', name: 'Hero', icon: '🦸', req: 1000 },
                ].map(b => {
                  const isEarned = stats.badges.some(u => u.id === b.id);
                  return (
                    <div 
                      key={b.id} 
                      className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all ${
                        isEarned 
                          ? 'border-primary/30 bg-background shadow-sm scale-100 opacity-100' 
                          : 'border-border/40 bg-muted/20 opacity-40 grayscale'
                      }`}
                    >
                      <div className="text-3xl mb-2">{b.icon}</div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{t(b.name)}</span>
                      {!isEarned && (
                        <div className="mt-1 text-[9px] font-bold text-muted-foreground">
                          {b.req} pts
                        </div>
                      )}
                      {isEarned && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Personal Details */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-sm border-border/60">
            <SectionHeader icon={User} title={t('Personal Information')} description={t('Update your display name and contact details.')} />
            <CardContent className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg ring-4 ring-primary/10">
                    {name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center shadow-md hover:bg-muted transition-colors">
                    <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div>
                  <p className="font-bold text-lg">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
                    {t(user?.role || 'Citizen')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('Full Name')}</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder={t('Enter your full name')} className="h-11 shadow-sm" voice />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('Phone Number')}</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 00000 00000" className="pl-10 h-11 shadow-sm" voice />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t('Email Address')}</Label>
                <div className="relative max-w-md">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input defaultValue={user?.email} className="pl-10 h-11 bg-muted/40 font-medium" disabled />
                </div>
                <p className="text-[11px] text-muted-foreground ml-1 italic">{t('Email address cannot be changed after registration.')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Permanent Location */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-sm border-border/60">
            <SectionHeader icon={MapPin} title={t('Permanent Location')} description={t('Your registered civic zone coordinates.')} />
            <CardContent className="space-y-4">
               <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-primary/10 rounded-full text-primary shadow-inner">
                        <MapPin className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="font-semibold text-sm">{user?.address || t('Location Verified')}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                           {user?.lat ? `${user.lat.toFixed(6)}, ${user.lng.toFixed(6)}` : t('Coordinates not bound')}
                        </p>
                     </div>
                  </div>
                  <div className="md:text-right">
                     <span className="inline-block px-2.5 py-1 text-[10px] rounded-lg bg-emerald-500/10 text-emerald-600 font-bold uppercase tracking-wider border border-emerald-500/20 shadow-sm">
                       <Shield className="w-3 h-3 inline-block mr-1 mb-0.5"/> {t('GPS Locked')}
                     </span>
                  </div>
               </div>
               <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-background border border-border/50 shadow-sm">
                  <Globe className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                  <p className="leading-relaxed">
                    {t('To change your location, contact support:')} <a href="mailto:support@cityspark.com" className="text-primary hover:underline font-bold ml-1">support@cityspark.com</a>
                  </p>
               </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interface Language */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="shadow-sm border-border/60 overflow-hidden">
            <SectionHeader icon={Globe} title={t('Interface Language')} description={t('Choose your preferred language for the entire platform.')} />
            <CardContent className="bg-muted/10 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {UI_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-bold transition-all text-left ${
                      language === lang.code
                        ? 'border-primary bg-background text-primary shadow-antigravity ring-2 ring-primary/20 scale-[1.02]'
                        : 'border-border/50 bg-background/50 hover:border-primary/40 hover:bg-background text-muted-foreground'
                    }`}
                  >
                    <span className="text-2xl drop-shadow-sm">{lang.flag}</span>
                    <span className="flex-1">{lang.name}</span>
                    {language === lang.code && <Check className="w-5 h-5 shrink-0" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Visual Appearance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-sm border-border/60">
            <SectionHeader icon={Eye} title={t('Visual Appearance')} description={t('Customize the interface theme to suit your preference.')} />
            <CardContent>
              <div className="flex gap-4">
                {themeOptions.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(opt.value)}
                      className={`flex-1 flex flex-col items-center gap-3 py-5 rounded-2xl border text-sm font-bold transition-all ${
                        theme === opt.value
                          ? 'border-primary bg-primary/10 text-primary shadow-sm scale-[1.03]'
                          : 'border-border/50 hover:border-primary/40 hover:bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="shadow-sm border-border/60">
            <SectionHeader icon={Bell} title={t('Notifications')} description={t('Select which updates you want to receive.')} />
            <CardContent className="divide-y divide-border/50 space-y-1">
              <Toggle label={t('New Reports Nearby')} description={t('Get notified when neighbors report issues in your zone.')} checked={notifications.newReport} onChange={v => setNotifications(p => ({ ...p, newReport: v }))} />
              <Toggle label={t('Status Updates')} description={t('Receive alerts when your reported issues change status.')} checked={notifications.statusUpdate} onChange={v => setNotifications(p => ({ ...p, statusUpdate: v }))} />
              <Toggle label={t('Community Interaction')} description={t('Get notified when someone upvotes or comments on your reports.')} checked={notifications.comments} onChange={v => setNotifications(p => ({ ...p, comments: v }))} />
              <Toggle label={t('Newsletter & Insights')} description={t('Receive weekly civic insights and city-wide improvements data.')} checked={notifications.newsletter} onChange={v => setNotifications(p => ({ ...p, newsletter: v }))} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Security / Password */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="shadow-sm border-border/60">
            <SectionHeader icon={Shield} title={t('Security')} description={t('Secure your account by updating your password periodically.')} />
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('Current Password')}</Label>
                  <Input type="password" placeholder="••••••••" className="h-11 shadow-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('New Password')}</Label>
                  <Input type="password" placeholder="••••••••" className="h-11 shadow-sm" />
                </div>
              </div>
              <Button variant="outline" className="h-10 px-6 font-bold">{t('Update Password')}</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 pb-12">
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-destructive hover:underline group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> {t('Sign Out of Account')}
          </button>
          <Button onClick={handleSave} size="lg" className="px-12 h-14 rounded-2xl shadow-antigravity text-lg font-bold" disabled={saved}>
            {saved ? (<><Check className="w-6 h-6 mr-3" />{t('Changes Saved')}</>) : t('Save All Changes')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
