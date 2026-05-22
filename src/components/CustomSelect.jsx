import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ 
  name, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Seleccione...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalize options to [{ value, label }]
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return opt;
    }
    return { value: opt, label: opt };
  });

  const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));

  const handleSelect = (val) => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: val
        }
      });
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none transition-all duration-200 flex items-center justify-between text-left focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 h-[42px]"
      >
        <span className={selectedOption ? 'text-gray-100' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-2 bg-dark-700/95 border border-dark-500 rounded-xl shadow-2xl max-h-60 overflow-y-auto py-1 backdrop-blur-md animate-fade-up">
          {normalizedOptions.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-gray-500">No hay opciones disponibles</li>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between hover:bg-brand-600/20 ${
                    isSelected ? 'text-brand-400 font-medium bg-brand-600/10' : 'text-gray-200'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
