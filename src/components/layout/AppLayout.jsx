import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { UI_LANGUAGES } from '@/context/translations';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { Bell, Map, List, User, Settings, LogOut, Moon, Sun, Eye, Briefcase, X, CheckCheck, Info, AlertCircle, CheckCircle2, Globe, LayoutDashboard, PlusCircle, Home, Circle, Zap } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
    case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
    default: return <Info className="w-4 h-4 text-primary shrink-0" />;
  }
};

const formatRelativeTime = (isoLike) => {
  if (!isoLike) return 'Now';
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) return 'Now';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationPanel = ({ onClose }) => {
  const { notifications, markNotificationRead, markAllRead, clearNotification } = useApp();
  const { t } = useLanguage();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasNotifications = notifications.length > 0;
  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    }),
    [notifications]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="fixed left-3 right-3 top-16 z-50 bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden md:absolute md:left-auto md:right-0 md:top-12 md:w-[24rem]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
        <div>
          <div className="font-semibold text-sm">{t('Notifications')}</div>
          <div className="text-[11px] text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} ${t('unread')}` : t('All caught up!')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 rounded-md px-2 py-1 hover:bg-primary/10"
            >
              <CheckCheck className="w-3.5 h-3.5" /> {t('Mark all as read')}
            </button>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground rounded-md p-1 hover:bg-muted" aria-label={t('Close notifications')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/30 md:max-h-80">
        {!hasNotifications ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t('All caught up!')}
          </div>
        ) : (
          sortedNotifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
            >
              <NotificationIcon type={n.type} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {t(n.message)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">{formatRelativeTime(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.read && (
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="text-[11px] text-primary hover:text-primary/80 px-2 py-1 rounded-md hover:bg-primary/10"
                  >
                    {t('Mark read')}
                  </button>
                )}
                <button
                  onClick={() => clearNotification(n.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors rounded-md p-1 hover:bg-destructive/10"
                  aria-label={t('Delete notification')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {hasNotifications && (
        <div className="px-4 py-2 border-t border-border/40 text-center">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="text-xs text-primary hover:underline"
          >
            {t('View Dashboard')}
          </Link>
        </div>
      )}
    </motion.div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications } = useApp();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
      { name: t('Home'), path: '/home', icon: Home },
    { name: t('Feed'), path: '/feed', icon: List },
    { name: t('Map'), path: '/map', icon: Map },
    { name: t('Services'), path: '/services', icon: Briefcase },
  ];

  const mobileLinks = [
      { name: t('Home'), path: '/home', icon: Home },
    { name: t('Feed'), path: '/feed', icon: List },
    { name: t('Map'), path: '/map', icon: Map },
    { name: t('Dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('Report'), path: '/report', icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to={user ? '/home' : '/'} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl shadow-antigravity ring-1 ring-primary/25">
              <Zap className="h-4.5 w-4.5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
              CitySpark
            </span>
          </Link>

          {user && (
            <nav className="hidden md:flex gap-1 items-center rounded-full border border-border/60 bg-card/80 p-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
              <Button asChild size="sm" className="rounded-full shadow-sm ml-1">
                <Link to="/report">{t('Report Issue')}</Link>
              </Button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                {theme === 'light' ? <Sun className="h-4 w-4" /> : theme === 'dark' ? <Moon className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{t('Toggle theme')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>{t('Light')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>{t('Dark')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('eye-comfort')}>{t('Eye Comfort')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" title={t('Language')}>
                <Globe className="h-4 w-4" />
                <span className="sr-only">{t('Language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
              {UI_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={language === lang.code ? 'bg-primary/10 text-primary' : ''}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="relative" ref={notifRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative h-9 w-9 rounded-full border transition-colors ${notifOpen ? 'border-primary/40 bg-primary/10 text-primary' : 'border-transparent'}`}
                  onClick={() => setNotifOpen(prev => !prev)}
                  aria-label={t('Notifications')}
                >
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-destructive text-[9px] text-white font-bold flex items-center justify-center px-1">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                  {unread > 0 && (
                    <Circle className="absolute bottom-1 right-1 h-1.5 w-1.5 fill-primary text-primary" />
                  )}
                </Button>

                <AnimatePresence>
                  {notifOpen && (
                    <NotificationPanel onClose={() => setNotifOpen(false)} />
                  )}
                </AnimatePresence>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 rounded-full pl-2 pr-4 flex gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('Dashboard')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t('Profile Settings')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('Log out')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost">{t('Log in')}</Button>
              </Link>
              <Link to="/signup">
                <Button>{t('Sign up')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {user && (
        <div className="md:hidden border-t border-border/50 bg-card/90">
          <div className="container mx-auto px-2 py-2 grid grid-cols-5 gap-1">
            {mobileLinks.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.1),transparent_36%),radial-gradient(circle_at_top_right,hsl(var(--secondary-foreground)/0.06),transparent_30%),hsl(var(--background))] flex flex-col font-sans relative overflow-x-hidden w-full max-w-[100vw]">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col pb-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
