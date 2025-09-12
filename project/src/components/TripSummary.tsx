import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Route, Calendar, Gauge, Download } from 'lucide-react';
import { TripResponse } from '../types';
import { exportELDLogsToPDF } from '../services/pdfExport';

interface TripSummaryProps {
  tripData: TripResponse;
}

export const TripSummary: React.FC<TripSummaryProps> = ({ tripData }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const handleExportPDF = async () => {
    try {
      await exportELDLogsToPDF(tripData.daily_logs, tripData.id);
      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 1600);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const cycleUtilization = ((70 - tripData.cycle_hours_remaining) / 70) * 100;

  return (
    <motion.div
      className="relative bg-white rounded-2xl shadow-xl border border-royal-200 p-6 backdrop-blur-sm bg-white/95"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute -top-3 right-4 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow"
        >
          Download ready
        </motion.div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-royal-900">Trip Summary</h3>
          <p className="text-xs sm:text-sm text-royal-600">Overview and compliance status</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center space-x-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
        >
          <Download className="h-4 w-4" />
          <span className="text-sm font-medium">Export PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-royal-50 to-royal-100 rounded-xl p-4 border border-royal-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-royal-500 rounded-lg">
              <Route className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-royal-600">Total Distance</p>
              <p className="text-xl sm:text-2xl font-bold text-royal-900 leading-tight">{tripData.total_miles.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-royal-500">miles</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-600">Driving Time</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900 leading-tight">{tripData.total_hours}</p>
              <p className="text-[10px] sm:text-xs text-blue-500">hours</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-green-600">Trip Duration</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900 leading-tight">{tripData.total_days}</p>
              <p className="text-[10px] sm:text-xs text-green-500">days</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Gauge className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-amber-600">Cycle Hours Left</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-900 leading-tight">{tripData.cycle_hours_remaining}</p>
              <p className="text-[10px] sm:text-xs text-amber-500">of 70 hours</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-royal-700">Cycle Utilization</h4>
          <span className="text-sm text-royal-600">{cycleUtilization.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-royal-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              cycleUtilization > 90
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : cycleUtilization > 70
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : 'bg-gradient-to-r from-green-500 to-green-600'
            }`}
            style={{ width: `${Math.min(cycleUtilization, 100)}%` }}
          ></div>
        </div>
      </div>

      {tripData.fuel_stops.length > 0 && (
        <div className="bg-royal-50 rounded-xl p-4 border border-royal-200">
          <h4 className="text-sm font-semibold text-royal-700 mb-2">Fuel Stops Required</h4>
          <div className="space-y-2">
            {tripData.fuel_stops.slice(0, 3).map((stop, index) => (
              <div key={stop.id} className="flex items-center justify-between text-sm">
                <span className="text-royal-600">Stop {index + 1}</span>
                <span className="text-royal-800 font-medium">Mile {stop.distance_from_start}</span>
              </div>
            ))}
            {tripData.fuel_stops.length > 3 && (
              <p className="text-xs text-royal-500">
                +{tripData.fuel_stops.length - 3} more stops
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};