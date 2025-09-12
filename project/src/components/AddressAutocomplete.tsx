import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import { searchAddresses } from '../services/geocoding';
import { Address } from '../types';

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string, address?: Address) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false
}) => {
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (inputValue: string) => {
    onChange(inputValue);
    
    if (inputValue.length >= 3) {
      setIsLoading(true);
      try {
        const results = await searchAddresses(inputValue);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching addresses:', error);
        setSuggestions([]);
      }
      setIsLoading(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (address: Address) => {
    onChange(address.display_name, address);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-royal-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-royal-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl bg-white/90 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500 ${
            error ? 'border-red-300' : 'border-royal-200 hover:border-royal-300'
          }`}
        />
        
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-royal-500"></div>
          </div>
        )}
        
        {!isLoading && value && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-royal-400" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-royal-200 max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-royal-50 focus:bg-royal-50 focus:outline-none border-b border-royal-100 last:border-b-0 transition-all duration-150 hover:shadow-sm hover:scale-[1.01]"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-royal-400 flex-shrink-0" />
                <span className="text-sm text-royal-700 truncate">
                  {suggestion.display_name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};