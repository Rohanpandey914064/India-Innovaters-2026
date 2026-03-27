import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { X, Image as ImageIcon, MapPin } from 'lucide-react';

const CATEGORY_VALUES = ['Infrastructure', 'Electricity', 'Water', 'Sanitation', 'Public Transport', 'Other'];

const IssueSubmissionForm = ({ location, onClose }) => {
  const { addIssue } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();

  const categoryOptions = useMemo(
    () => CATEGORY_VALUES.map((value) => ({ value, label: t(value) })),
    [t]
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
    locationText: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '',
    address: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addIssue({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.locationText,
      address: formData.address,
      lat: location?.lat,
      lng: location?.lng,
      authorId: user?.id,
      img: 'https://images.unsplash.com/photo-1584483756303-a1fb1db1f308?auto=format&fit=crop&q=80&w=800',
    });
    onClose();
  };

  return (
    <Card className="h-full flex flex-col shadow-antigravity bg-background/95 backdrop-blur-md border border-border animate-in slide-in-from-right-8 duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle>{t('Report a Civic Issue')}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="space-y-5 flex-1 overflow-y-auto py-6">
          <div className="space-y-1.5">
            <Label htmlFor="title">{t('Issue Title')}</Label>
            <Input
              id="title"
              placeholder={t('e.g., Broken streetlight on MG Road')}
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">{t('Category')}</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categoryOptions.map(({ value, label }) => (
                <option key={value} value={value} className="bg-background">
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">{t('Description (Optional)')}</Label>
            <textarea
              id="description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              placeholder={t('Give a brief description of the issue...')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="locationText">{t('Location')}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="locationText" className="pl-9" value={formData.locationText} readOnly />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('Location automatically detected from map pin.')}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">{t('Address')}</Label>
            <Input
              id="address"
              placeholder={t('e.g., 123 Main St, Near Central Park')}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/50 transition-colors mt-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium">{t('Tap to upload a photo')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('A clear photo helps city officials resolve issues faster.')}</p>
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t bg-muted/20">
          <Button type="submit" className="w-full h-11 text-base shadow-antigravity">
            {t('Submit Report')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default IssueSubmissionForm;
