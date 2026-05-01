import { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  error = false,
  className = '',
}: CustomSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className={`csel-wrap ${open ? 'open' : ''} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''} ${className}`}
    >
      <button
        type="button"
        className="csel-trigger"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
      >
        <span className={`csel-value ${!selected ? 'placeholder' : ''}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className="csel-chevron"
          width="14" height="14"
          viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="csel-dropdown">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`csel-option ${String(opt.value) === String(value) ? 'selected' : ''}`}
              onMouseDown={() => handleSelect(opt)}
            >
              {opt.label}
              {String(opt.value) === String(value) && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
