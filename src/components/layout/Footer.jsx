import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-muted/30 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-antigravity ring-1 ring-primary/25"><Zap className="h-4.5 w-4.5 fill-current" /></div>
              <span className="text-xl font-bold tracking-tight">CitySpark</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6">{t('Bridging the communication gap between citizens and local government using predictive AI.')}</p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-5 h-5"/></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Github className="w-5 h-5"/></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="w-5 h-5"/></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('Product')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/#features" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('Features')}</a></li>
              <li><Link to="/map" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('Interactive Map')}</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('AI Services')}</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('Pricing')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('Resources')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/docs" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('Documentation')}</Link></li>
              <li><Link to="/help" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('Help Center')}</Link></li>
              <li><Link to="/feed" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('Community')}</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('Blog')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('Company')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('About Us')}</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('Careers')}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('Privacy Policy')}</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors hover:underline underline-offset-4">{t('Terms of Service')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CitySpark Inc. {t('All rights reserved.')}</p>
          <p className="mt-2 md:mt-0">{t('Building smarter cities, one report at a time.')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

