import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SmartInput } from '@/components/ui/SmartInput';
import { SmartTextarea } from '@/components/ui/SmartTextarea';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Image as ImageIcon, MapPin, Loader2, Zap, ShieldCheck, Sparkles, Camera } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const CATEGORY_VALUES = ['Infrastructure', 'Electricity', 'Water', 'Sanitation', 'Public Transport', 'Other'];

function categoryLabel(value, t) {
  if (value === 'Public Transport') return t('public transport');
  if (value === 'Other') return t('other');
  return t(value.toLowerCase());
}

const ReportIssue = () => {
  const navigate = useNavigate();
  const { addIssue, addNotification } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
    locationText: '',
    address: '',
  });
  const [coords, setCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle');
  const [geoError, setGeoError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageName, setUploadedImageName] = useState('');
  const [isAddressFetching, setIsAddressFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const categoryOptions = useMemo(
    () => CATEGORY_VALUES.map((value) => ({ value, label: categoryLabel(value, t) })),
    [t]
  );

  const reverseGeocodeAddress = useCallback(async (lat, lng) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    if (!response.ok) throw new Error('reverse-geocode-failed');
    const data = await response.json();
    return data?.display_name || '';
  }, []);

  const fetchLocation = useCallback(() => {
    setGeoError('');
    setGeoStatus('loading');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setFormData((prev) => ({
            ...prev,
            locationText: `${t('detectedPrefix')}: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          }));
          setGeoStatus('success');
        },
        () => {
          setGeoStatus('error');
          setGeoError(t('Could not fetch location. Please allow location permission and try again.'));
        },
        { timeout: 10000 }
      );
    } else {
      setGeoStatus('error');
      setGeoError(t('Geolocation is not available in this browser.'));
    }
  }, [t]);

  const fetchAddress = useCallback(async () => {
    setGeoError('');
    setIsAddressFetching(true);
    try {
      let lat = coords?.lat;
      let lng = coords?.lng;

      if (lat == null || lng == null) {
        if (!('geolocation' in navigator)) {
          throw new Error('no-geolocation');
        }

        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });

        lat = pos.coords.latitude;
        lng = pos.coords.longitude;

        setCoords({ lat, lng });
        setFormData((prev) => ({
          ...prev,
          locationText: `${t('detectedPrefix')}: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        }));
        setGeoStatus('success');
      }

      const fetchedAddress = await reverseGeocodeAddress(lat, lng);
      if (fetchedAddress) {
        setFormData((prev) => ({ ...prev, address: fetchedAddress }));
      } else {
        setGeoError(t('Address not found for current location. Please type manually.'));
      }
    } catch (error) {
      if (error?.message === 'no-geolocation') {
        setGeoError(t('Geolocation is not available in this browser.'));
      } else {
        setGeoError(t('Could not fetch address. Please allow location permission and try again.'));
      }
    } finally {
      setIsAddressFetching(false);
    }
  }, [coords?.lat, coords?.lng, reverseGeocodeAddress, t]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await addIssue({
        ...formData,
        lat: coords?.lat,
        lng: coords?.lng,
        authorId: user?.id,
        img: imagePreview || 'https://images.unsplash.com/photo-1542482324-4f05cd43cbeb?auto=format&fit=crop&q=80&w=800',
      });

      if (result?.duplicate) {
        setSubmitStatus('duplicate');
        addNotification(t('duplicateDetected'), 'info');
      } else {
        setSubmitStatus('success');
      }

      setTimeout(() => navigate('/feed'), 5000);
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-card/50 to-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply opacity-35"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl mix-blend-multiply opacity-25"></div>
      </div>

      <div className="container mx-auto px-4 py-5 lg:py-7 max-w-4xl relative z-10">
        <Motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-[linear-gradient(140deg,hsl(var(--card)),hsl(var(--card)/0.92))] p-4 md:p-5 shadow-[0_10px_28px_hsl(var(--foreground)/0.08)]">
            <div className="absolute -top-12 -right-10 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />
            <div className="relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] tracking-wide font-bold uppercase text-primary">{t('Smart Report')}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">{t('Report Issue')}</h1>
                <p className="text-muted-foreground text-sm font-medium max-w-lg leading-relaxed">
                  {t('Share clear details and evidence so the right team can act faster.')}
                </p>
              </div>
            </div>
          </section>

          <Card className="overflow-hidden relative border-primary/25 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_45%),hsl(var(--card)/0.96)] shadow-[0_18px_40px_hsl(var(--foreground)/0.12)]">
            <form onSubmit={handleSubmit}>
              <CardContent className="p-4 md:p-5">
                <div className="space-y-4">
                  <div
                    className="group rounded-xl border-2 border-dashed border-border/70 bg-background/70 p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/45 transition-all relative overflow-hidden min-h-[130px]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center px-2">
                      <ImageIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="font-bold text-xs uppercase tracking-widest">{t('Upload Proof')}</p>
                      {uploadedImageName ? (
                        <p className="text-[11px] mt-2 font-semibold text-foreground break-all">{uploadedImageName}</p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {t('Upload photo evidence to improve routing quality')}
                        </p>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageChange} />
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background/70 p-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('Issue Title')}</Label>
                        <SmartInput
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          onVoiceUpdate={(text) => setFormData({ ...formData, title: formData.title ? `${formData.title} ${text}` : text })}
                          placeholder={t('eg: Water leakage on Main St')}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('Category')}</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          {categoryOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background/70 p-3.5 space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('Description')}</Label>
                      <SmartTextarea
                        required
                        className="min-h-[105px]"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        onVoiceUpdate={(text) => setFormData({ ...formData, description: formData.description ? `${formData.description} ${text}` : text })}
                        placeholder={t('Provide details for analysis and assignment...')}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('Address')}</Label>
                      <div className="relative">
                        <Input
                          required
                          value={formData.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="pr-10"
                          placeholder={t('e.g., 123 Main St, Near Central Park')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 text-primary"
                          onClick={fetchAddress}
                          disabled={isAddressFetching}
                          title={t('Fetch address from GPS')}
                        >
                          {isAddressFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end mb-1">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('Location')}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] font-bold text-primary px-2"
                          onClick={fetchLocation}
                          disabled={geoStatus === 'loading'}
                        >
                          {geoStatus === 'loading' ? <Loader2 className="w-3 h-3 animate-spin mr-1 inline" /> : null}
                          {geoStatus === 'loading' ? t('FETCHING...') : t('REFRESH GPS')}
                        </Button>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 z-10 text-muted-foreground" />
                        <Input
                          readOnly
                          disabled
                          className="pl-9 bg-muted/40 cursor-not-allowed text-xs font-mono opacity-100"
                          value={formData.locationText || (geoStatus === 'loading' ? t('Fetching coordinates...') : '')}
                          placeholder={t('Auto-detecting location...')}
                        />
                      </div>
                      {geoError && <p className="text-[11px] text-destructive font-medium">{geoError}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 md:p-5 bg-muted/20 border-t flex justify-center gap-2.5">
                <Button type="button" variant="outline" onClick={() => navigate('/feed')} className="rounded-xl px-8 h-11 font-bold">
                  {t('CANCEL')}
                </Button>
                <Button type="submit" className="rounded-xl px-12 h-11 font-bold shadow-antigravity bg-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('SUBMIT REPORT')}
                </Button>
              </CardFooter>

              <AnimatePresence>
                {submitStatus && (
                  <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-50 bg-background/98 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                  >
                    {submitStatus === 'error' ? (
                      <div className="max-w-md space-y-6">
                        <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mx-auto shadow-inner">
                          <Zap className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-red-600 uppercase">{t('Submission Failed')}</h2>
                      </div>
                    ) : (
                      <div className="max-w-md space-y-6">
                        <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto shadow-inner">
                          <ShieldCheck className="h-12 w-12 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-emerald-600 uppercase">{t('Report Submitted')}</h2>
                      </div>
                    )}
                    <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
                      {t('Redirecting to feed...')}
                    </p>
                  </Motion.div>
                )}
              </AnimatePresence>
            </form>
          </Card>
        </Motion.div>
      </div>
    </div>
  );
};

export default ReportIssue;
