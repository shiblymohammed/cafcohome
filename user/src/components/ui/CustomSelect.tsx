"use client";

import { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  id: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: { target: { name: string; value: string } }) => void;
  className?: string;
  label?: string;
}

export default function CustomSelect({
  id,
  name,
  value,
  options,
  onChange,
  className = "",
  label
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected Value Display */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left bg-transparent border-b border-alpha/20 focus:border-alpha py-2 pr-8 text-sm font-primary text-alpha focus:outline-none transition-colors duration-300 cursor-pointer hover:border-alpha/40 ${className}`}
      >
        {value || "Select..."}
      </button>

      {/* Dropdown Arrow */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className={`w-3 h-3 text-alpha/60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-creme border border-alpha/20 shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-4 py-2.5 text-sm font-primary transition-colors duration-150 ${
                value === option
                  ? "bg-alpha/15 text-alpha font-medium"
                  : "text-alpha/80 hover:bg-alpha/10 hover:text-alpha"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
