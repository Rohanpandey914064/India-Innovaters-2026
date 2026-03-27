import * as React from "react"
import { cn } from "@/lib/utils"
import { VoiceButton } from "./VoiceButton"

const Input = React.forwardRef(({ className, type, voice, onTranscript, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(props.value || props.defaultValue || "");

  const handleTranscript = (transcript) => {
    const newValue = (internalValue ? internalValue + " " : "") + transcript;
    setInternalValue(newValue);
    if (onTranscript) onTranscript(newValue);
    // If there's an onChange, we should try to trigger it
    if (props.onChange) {
      const event = {
        target: { value: newValue, name: props.name },
        currentTarget: { value: newValue, name: props.name }
      };
      props.onChange(event);
    }
  };

  React.useEffect(() => {
    if (props.value !== undefined) {
      setInternalValue(props.value);
    }
  }, [props.value]);

  const { defaultValue, value: propValue, onChange: propOnChange, ...rest } = props;

  return (
    <div className="relative w-full group">
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          voice && "pr-10",
          className
        )}
        ref={ref}
        {...rest}
        value={propValue !== undefined ? propValue : internalValue}
        onChange={(e) => {
          setInternalValue(e.target.value);
          if (propOnChange) propOnChange(e);
        }}
      />
      {voice && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10">
          <VoiceButton onTranscript={handleTranscript} />
        </div>
      )}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
