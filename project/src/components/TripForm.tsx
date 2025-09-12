import React, { useEffect, useState } from 'react';
import { Truck, Calculator, AlertCircle } from 'lucide-react';
import { AddressAutocomplete } from './AddressAutocomplete';
import { TripRequest, ValidationErrors, Address } from '../types';

interface TripFormProps {
  onSubmit: (request: TripRequest) => void;
  isLoading: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<TripRequest>({
    current_address: '',
    pickup_address: '',
    dropoff_address: '',
    cycle_used_hours: 0
  });
  
  const [addresses, setAddresses] = useState<{
    current?: Address;
    pickup?: Address;
    dropoff?: Address;
  }>({});
  
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Deep-link prefill from query params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const curr = params.get('current') || '';
      const pick = params.get('pickup') || '';
      const drop = params.get('dropoff') || '';
      const cycle = params.get('cycle');
      setFormData(prev => ({
        current_address: curr || prev.current_address,
        pickup_address: pick || prev.pickup_address,
        dropoff_address: drop || prev.dropoff_address,
        cycle_used_hours: cycle ? Math.min(70, Math.max(0, parseFloat(cycle))) : prev.cycle_used_hours,
      }));
    } catch {}
  }, []);

  // Recent trips helpers
  const RECENT_KEY = 'recentTrips';
  const loadRecentTrips = (): TripRequest[] => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw) as TripRequest[];
      return Array.isArray(arr) ? arr.slice(0, 5) : [];
    } catch { return []; }
  };
  const [recentTrips, setRecentTrips] = useState<TripRequest[]>(loadRecentTrips());
  const saveRecentTrip = (req: TripRequest) => {
    try {
      const existing = loadRecentTrips();
      const deduped = [req, ...existing.filter(r => JSON.stringify(r) !== JSON.stringify(req))].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(deduped));
      setRecentTrips(deduped);
    } catch {}
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.current_address.trim()) {
      newErrors.current_address = 'Current location is required';
    }
    
    if (!formData.pickup_address.trim()) {
      newErrors.pickup_address = 'Pickup location is required';
    }
    
    if (!formData.dropoff_address.trim()) {
      newErrors.dropoff_address = 'Drop-off location is required';
    }
    
    if (formData.cycle_used_hours < 0 || formData.cycle_used_hours > 70) {
      newErrors.cycle_used_hours = 'Cycle hours must be between 0 and 70';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      saveRecentTrip(formData);
    }
  };

  const updateAddress = (field: keyof typeof formData, value: string, address?: Address) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (address) {
      const addressField = field.replace('_address', '') as 'current' | 'pickup' | 'dropoff';
      setAddresses(prev => ({ ...prev, [addressField]: address }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-royal-200 p-6 backdrop-blur-sm bg-white/95">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-royal-500 to-royal-600 rounded-xl text-white">
          <Truck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-royal-900">Plan Your Trip</h2>
          <p className="text-sm text-royal-600">Calculate route, ELD logs, and compliance</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AddressAutocomplete
          label="Current Location"
          value={formData.current_address}
          onChange={(value, address) => updateAddress('current_address', value, address)}
          error={errors.current_address}
          placeholder="Enter your current location..."
          required
        />

        <AddressAutocomplete
          label="Pickup Location"
          value={formData.pickup_address}
          onChange={(value, address) => updateAddress('pickup_address', value, address)}
          error={errors.pickup_address}
          placeholder="Enter pickup location..."
          required
        />

        <AddressAutocomplete
          label="Drop-off Location"
          value={formData.dropoff_address}
          onChange={(value, address) => updateAddress('dropoff_address', value, address)}
          error={errors.dropoff_address}
          placeholder="Enter drop-off location..."
          required
        />

        <div>
          <label className="block text-sm font-medium text-royal-700 mb-2">
            Current Cycle Hours Used <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="70"
              step="0.5"
              value={formData.cycle_used_hours}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setFormData(prev => ({ ...prev, cycle_used_hours: value }));
                if (errors.cycle_used_hours) {
                  setErrors(prev => ({ ...prev, cycle_used_hours: undefined }));
                }
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl bg-white/90 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500 ${
                errors.cycle_used_hours ? 'border-red-300' : 'border-royal-200 hover:border-royal-300'
              }`}
              placeholder="0.0"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-royal-500 text-sm font-medium">hrs</span>
            </div>
          </div>
          {errors.cycle_used_hours && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.cycle_used_hours}
            </p>
          )}
          <p className="mt-1 text-xs text-royal-500">
            Maximum 70 hours in an 8-day period
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Calculating Route...</span>
            </>
          ) : (
            <>
              <Calculator className="h-5 w-5" />
              <span>Calculate Trip & ELD Logs</span>
            </>
          )}
        </button>
      </form>

      {recentTrips.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-royal-700 mb-2">Recent trips</h4>
          <div className="space-y-2">
            {recentTrips.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData(t)}
                className="w-full text-left text-sm p-3 rounded-xl border-2 border-royal-200 hover:border-royal-300 bg-white/90 transition"
                title={`${t.current_address} → ${t.pickup_address} → ${t.dropoff_address}`}
              >
                <div className="truncate text-royal-800">{t.current_address} → {t.pickup_address} → {t.dropoff_address}</div>
                <div className="text-royal-500 text-xs">Cycle used: {t.cycle_used_hours}h</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};