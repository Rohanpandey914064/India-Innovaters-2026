import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export function SmartPasswordInput({ className, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10 w-full", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 hidden sm:flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
        title={t(showPassword ? 'Hide password' : 'Show password')}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
      {/* Mobile visible fallback */}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 flex sm:hidden items-center justify-center text-muted-foreground focus:outline-none"
      >
         {showPassword ? (
          <EyeOff className="h-[18px] w-[18px]" />
        ) : (
          <Eye className="h-[18px] w-[18px]" />
        )}
      </button>
    </div>
  );
}
