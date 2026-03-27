import React, { createContext, useContext } from 'react';

// Simple context to share selected value
const SelectContext = createContext({ value: '', onValueChange: () => {} });

/**
 * Select – container that provides value & onValueChange to its children.
 * It does not render any UI itself; the UI is built by the sub‑components.
 */
export const Select = ({ value, onValueChange, children }) => (
  <SelectContext.Provider value={{ value, onValueChange }}>
    <div className="inline-block min-w-[200px]" role="combobox">
      {children}
    </div>
  </SelectContext.Provider>
);

/**
 * SelectTrigger – clickable area that shows the current value.
 * In this minimal implementation it just renders its children.
 */
export const SelectTrigger = ({ children, className = '' }) => (
  <div className={`border border-input rounded-md px-3 py-2 bg-background ${className}`}>
    {children}
  </div>
);

/**
 * SelectValue – displays the selected value or a placeholder.
 */
export const SelectValue = ({ placeholder = 'Select…' }) => {
  const { value } = useContext(SelectContext);
  return <span>{value || placeholder}</span>;
};

/**
 * SelectContent – container for the list of options.
 */
export const SelectContent = ({ children, className = '' }) => (
  <div className={`border border-input rounded-md mt-1 bg-background ${className}`}>
    {children}
  </div>
);

/**
 * SelectItem – an individual option. When clicked it calls onValueChange.
 */
export const SelectItem = ({ value, children, className = '' }) => {
  const { onValueChange } = useContext(SelectContext);
  const handleClick = () => {
    if (onValueChange) onValueChange(value);
  };
  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer px-3 py-2 hover:bg-muted ${className}`}
    >
      {children}
    </div>
  );
};
