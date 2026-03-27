import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { validatePassword } from '@/lib/passwordPolicy';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, RefreshCw, LocateFixed } from 'lucide-react';
import { parseAadhaar } from '@/lib/ocr';
import { SmartInput } from '@/components/ui/SmartInput';
import { SmartPasswordInput } from '@/components/ui/SmartPasswordInput';
import './Auth.css';

const Auth = ({ isLogin: initialIsLogin = true }) => {
  const navigate = useNavigate();
  const { user, login, signup, sendOtp, verifyOtp, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  
  const [activeView, setActiveView] = useState(initialIsLogin ? 'login' : 'register');
  const [step, setStep] = useState('auth'); // auth, otp
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', address: '', zip: '', lat: null, lng: null });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [geoError, setGeoError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/feed";

  useEffect(() => {
    if (!(activeView === 'register' && step === 'auth')) {
      setGeoError('');
    }
  }, [activeView, step]);

  const handleFetchLocation = () => {
    setGeoError('');
    if (!('geolocation' in navigator)) {
      setGeoError(t('Geolocation is not available in this browser.'));
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setFormData(prev => ({ ...prev, lat, lng }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          if (response.ok) {
            const data = await response.json();
            const fetchedAddress = data?.display_name || '';
            const fetchedZip = data?.address?.postcode || '';
            setFormData(prev => ({
              ...prev,
              address: fetchedAddress || prev.address,
              zip: fetchedZip || prev.zip,
            }));
          }
        } catch (reverseErr) {
          console.warn('Reverse geocoding failed', reverseErr);
          setGeoError(t('Location found but address lookup failed. Please enter address manually.'));
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation blocked', err);
        setGeoError(t('Could not fetch location. Please allow location permission and try again.'));
        setLocationLoading(false);
      }
    );
  };

  useEffect(() => {
    if (user && !user.isVerified && activeView === 'register' && (user.phone || formData.phone)) {
      setStep('otp');
    } else if (user && user.isVerified) {
      navigate(from, { replace: true });
    } else if (user && activeView === 'register') {
      navigate(from, { replace: true });
    }
  }, [user, activeView, navigate, from, formData.phone]);

  // Sync state if routing changed (e.g., direct /login vs /signup URL)
  useEffect(() => {
    setActiveView(initialIsLogin ? 'login' : 'register');
  }, [initialIsLogin]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      const msg = err?.message || 'Something went wrong';
      setError(msg.length > 200 ? msg.substring(0, 200) + '...' : t(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const pwdErr = validatePassword(formData.password);
      if (pwdErr) {
        setError(t(pwdErr));
        setLoading(false);
        return;
      }
      await signup(formData.name, formData.email, formData.password, formData.phone, formData.address, formData.zip, formData.lat, formData.lng);
      if (formData.phone?.trim()) {
        const otpSent = await sendOtp();
        if (otpSent) {
          setStep('otp');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err?.message || 'Something went wrong';
      setError(msg.length > 200 ? msg.substring(0, 200) + '...' : t(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (context) => {
    setError('');
    const authUser = await loginWithGoogle();
    if (authUser) {
      setFormData(prev => ({
        ...prev,
        name: authUser.displayName || prev.name,
        email: authUser.email || prev.email,
      }));
      if (context === 'login' || activeView === 'login') {
        await login(authUser.email, 'google-auth');
      }
    } else {
      setError(t('Google Sign-In failed or was cancelled.'));
    }
  };

  const handleAadhaarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    setError('');
    try {
      const data = await parseAadhaar(file);
      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        address: data.address || prev.address,
        zip: data.zip || prev.zip,
        phone: data.phone || prev.phone,
      }));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? `OCR Error: ${err.message}` : t('Failed to parse Aadhaar card. Please enter details manually.'));
    } finally {
      setOcrLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await verifyOtp(otpCode);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError(t('Invalid or expired OTP'));
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-card/10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="shadow-antigravity border-orange-500/20 bg-background/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white font-bold text-3xl shadow-lg">!</div>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">{t('Verify Mobile')}</CardTitle>
              <CardDescription>
                {t('We\'ve sent a 6-digit code to')} <span className="font-bold text-foreground">{formData.phone || user?.phone}</span>.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleVerifyOtp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-center block">{t('Enter Code')}</Label>
                  <Input 
                    id="otp" placeholder="123456" required maxLength={6}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-12"
                    value={otpCode} onChange={(e) => setOtpCode(e.target.value)} autoFocus
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pt-4">
                {error && <p className="text-sm text-destructive text-center w-full font-medium" role="alert">{error}</p>}
                <Button type="submit" className="w-full h-11 shadow-lg bg-orange-500 hover:bg-orange-600 transition-all font-bold" disabled={loading}>
                  {loading ? t('Verifying...') : t('Verify & Continue')}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {t('Didn\'t receive the code?')} <button type="button" onClick={() => sendOtp()} className="text-primary font-bold underline ml-1">{t('Resend')}</button>
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  const GoogleIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className={`auth-wrapper ${activeView === 'register' ? 'active' : ''}`}>
        
        {/* LOGIN FORM */}
        <div className="auth-form-box login">
          <form onSubmit={handleLoginSubmit} className="flex flex-col items-center justify-center w-full h-full sm:px-[15%]">
            <h1 className="text-3xl font-black mb-6">{t('Login')}</h1>

            <div className="w-full space-y-4 text-left font-medium">
              <Input placeholder={t("Email address")} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-11" />
              <Input type="password" placeholder={t("Password")} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="h-11" />
              <div className="flex w-full justify-between items-center mt-2 px-1">
                 <div className="text-xs text-muted-foreground"></div>
                 <button type="button" className="text-xs text-primary font-bold hover:underline">{t('Forgot password?')}</button>
              </div>
            </div>
            
            {error && activeView === 'login' && <p className="text-sm text-destructive mt-4 font-bold">{error}</p>}
            
            <Button type="submit" className="w-full mt-6 h-11 shadow-md font-bold text-base" disabled={loading}>
              {loading ? t('Processing...') : t('Sign In')}
            </Button>

            <div className="relative w-full my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase text-muted-foreground"><span className="bg-card px-2">{t('Or continue with')}</span></div>
            </div>

            <Button type="button" variant="outline" className="w-full font-medium" onClick={() => handleGoogleAuth('login')}>
              <GoogleIcon /> {t('Continue with Google')}
            </Button>
          </form>
        </div>

        {/* REGISTRATION FORM */}
        <div className="auth-form-box register">
          <form onSubmit={handleRegisterSubmit} className="flex flex-col items-center justify-start w-full h-full sm:px-[12%] py-8 overflow-y-auto no-scrollbar pb-16">
            <h1 className="text-2xl font-black mb-4">{t('Create Account')}</h1>

            {/* Aadhaar Scanner */}
            <div className="w-full rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-center cursor-pointer mb-4 hover:bg-primary/10 transition-colors" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, application/pdf" onChange={handleAadhaarUpload} />
              {ocrLoading ? (
                <div className="text-primary text-xs flex justify-center items-center font-bold"><RefreshCw className="w-4 h-4 animate-spin mr-2"/>{t('Scanning Aadhaar...')}</div>
              ) : formData.name && formData.address ? (
                <div className="text-emerald-600 text-xs flex justify-center items-center font-bold"><CheckCircle2 className="w-4 h-4 mr-2"/>{t('Data Extracted. Edit below.')}</div>
              ) : (
                <div className="text-primary text-xs flex justify-center items-center font-bold"><UploadCloud className="w-4 h-4 mr-2" />{t('Upload Aadhaar for quick auto-fill')}</div>
              )}
            </div>

            <div className="w-full space-y-3 text-left">
              <SmartInput placeholder={t('Full Name')} className="h-10" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <div className="relative">
                <Input
                  placeholder={t('Area/Address')}
                  className="h-10 pr-12"
                  required
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-sm bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-60"
                  disabled={locationLoading}
                  title={t('Fetch location')}
                  aria-label={t('Fetch location')}
                >
                  {locationLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                </button>
              </div>
              <SmartInput type="email" placeholder={t('Email Address')} className="h-10" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />

              <SmartPasswordInput placeholder={t('Password')} className="h-10" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            {error && activeView === 'register' && <p className="text-sm text-destructive mt-4 font-bold w-full text-center">{error}</p>}
            {geoError && <p className="text-xs text-destructive mt-2 font-bold w-full text-center">{geoError}</p>}
            
            <Button type="submit" className="w-full mt-5 h-11 font-bold shadow-md text-base" disabled={loading || ocrLoading}>
               {loading ? t('Processing...') : t('Create Account')}
            </Button>

            <div className="relative w-full my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-[10px] uppercase text-muted-foreground"><span className="bg-card px-2">{t('Or continue with')}</span></div>
            </div>

            <Button type="button" variant="outline" className="w-full font-medium" onClick={() => handleGoogleAuth('register')}>
              <GoogleIcon /> {t('Continue with Google')}
            </Button>
          </form>
        </div>

        {/* TOGGLE OVERLAY */}
        <div className="auth-toggle-box">
          <div className="auth-toggle-panel auth-toggle-left">
            <h1 className="text-4xl font-black mb-4 tracking-tight drop-shadow-md">{t('New Here?')}</h1>
            <p className="text-sm px-8 mb-8 font-medium leading-relaxed drop-shadow-sm">
              {t('Sign up to report civic issues, track fixes in real-time, and make your city a better place.')}
            </p>
            <button type="button" className="bg-transparent border-2 border-primary-foreground text-primary-foreground font-bold px-10 py-2.5 rounded-xl hover:bg-primary-foreground hover:text-primary transition-colors text-sm" onClick={() => setActiveView('register')}>
              {t('Register Now')}
            </button>
          </div>
          <div className="auth-toggle-panel auth-toggle-right">
            <h1 className="text-4xl font-black mb-4 tracking-tight drop-shadow-md">{t('Welcome Back!')}</h1>
            <p className="text-sm px-8 mb-8 font-medium leading-relaxed drop-shadow-sm">
              {t('Log in to access your civic dashboard, view your reported issues, and check community progress.')}
            </p>
            <button type="button" className="bg-transparent border-2 border-primary-foreground text-primary-foreground font-bold px-10 py-2.5 rounded-xl hover:bg-primary-foreground hover:text-primary transition-colors text-sm" onClick={() => setActiveView('login')}>
              {t('Log In')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
