import * as React from "react";
import { forwardRef, useState, useEffect } from "react";
import { VoiceButton } from "./VoiceButton";
import { cn } from "@/lib/utils";

// Simple Textarea component compatible with shadcn/ui styling
export const Textarea = forwardRef(({ className = "", voice, onTranscript, ...props }, ref) => {
  const [internalValue, setInternalValue] = useState(props.value || props.defaultValue || "");

  const handleTranscript = (transcript) => {
    const newValue = (internalValue ? internalValue + "\n" : "") + transcript;
    setInternalValue(newValue);
    if (onTranscript) onTranscript(newValue);
    if (props.onChange) {
      const event = {
        target: { value: newValue, name: props.name },
        currentTarget: { value: newValue, name: props.name }
      };
      props.onChange(event);
    }
  };

  useEffect(() => {
    if (props.value !== undefined) {
      setInternalValue(props.value);
    }
  }, [props.value]);

  return (
    <div className="relative w-full group">
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          voice && "pr-10",
          className
        )}
        {...props}
        value={props.value !== undefined ? props.value : internalValue}
        onChange={(e) => {
          setInternalValue(e.target.value);
          if (props.onChange) props.onChange(e);
        }}
      />
      {voice && (
        <div className="absolute right-2 top-2 z-10">
          <VoiceButton onTranscript={handleTranscript} />
        </div>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";
