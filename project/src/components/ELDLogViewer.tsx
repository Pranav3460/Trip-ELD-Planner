import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Truck, Moon, AlertTriangle } from 'lucide-react';
import { DailyLog } from '../types';

interface ELDLogViewerProps {
  logs: DailyLog[];
}

export const ELDLogViewer: React.FC<ELDLogViewerProps> = ({ logs }) => {
  const getStatusColor = (log: DailyLog) => {
    if (log.is_rest_day) return 'from-amber-500 to-amber-600';
    if (log.drive_hours >= 10) return 'from-red-500 to-red-600';
    if (log.drive_hours >= 8) return 'from-orange-500 to-orange-600';
    return 'from-green-500 to-green-600';
  };

  const getTimelineBarWidth = (hours: number) => (hours / 24) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-royal-200 p-6 backdrop-blur-sm bg-white/95">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-royal-500 to-royal-600 rounded-xl text-white">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-royal-900">ELD Daily Logs</h3>
          <p className="text-sm text-royal-600">Hours of Service compliance breakdown</p>
        </div>
      </div>

      <div className="space-y-4">
        {logs.map((log, index) => (
          <motion.div
            key={log.day}
            className={`rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-lg ${
              log.is_rest_day
                ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100'
                : 'border-royal-200 bg-gradient-to-r from-royal-50 to-white'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.25 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
              <div className="flex items-center space-x-4 mb-3 lg:mb-0">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${getStatusColor(log)} text-white`}>
                  {log.is_rest_day ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Truck className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-royal-900 break-words">
                    Day {log.day} - {log.date}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-royal-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{log.drive_hours}h driving</span>
                    </span>
                    {!log.is_rest_day && (
                      <span className="truncate">{log.miles} miles</span>
                    )}
                  </div>
                </div>
              </div>

              {log.is_rest_day && (
                <div className="flex items-center space-x-2 bg-amber-200 px-3 py-1 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-amber-700" />
                  <span className="text-sm font-medium text-amber-700">34-Hour Restart</span>
                </div>
              )}
            </div>

            {/* Timeline visualization */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-royal-500 mb-2">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>11 PM</span>
              </div>
              
              <div className="relative h-8 bg-royal-100 rounded-lg overflow-hidden">
                {/* Driving hours */}
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${getTimelineBarWidth(log.drive_hours)}%` }}
                >
                  {log.drive_hours > 0 && `${log.drive_hours}h Drive`}
                </div>
                
                {/* On-duty non-driving hours */}
                <div
                  className="absolute h-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    left: `${getTimelineBarWidth(log.drive_hours)}%`,
                    width: `${getTimelineBarWidth(log.on_duty_hours - log.drive_hours)}%`
                  }}
                >
                  {log.on_duty_hours - log.drive_hours > 0 && `${(log.on_duty_hours - log.drive_hours).toFixed(1)}h On-Duty`}
                </div>
                
                {/* Off-duty hours */}
                <div
                  className="absolute right-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${getTimelineBarWidth(log.off_duty_hours)}%` }}
                >
                  {log.off_duty_hours > 0 && `${log.off_duty_hours}h Off-Duty`}
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 border border-royal-200">
                <p className="text-xs font-medium text-blue-600">Driving</p>
                <p className="text-lg font-bold text-blue-900">{log.drive_hours}h</p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-royal-200">
                <p className="text-xs font-medium text-yellow-600">On-Duty</p>
                <p className="text-lg font-bold text-yellow-900">{log.on_duty_hours}h</p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-royal-200">
                <p className="text-xs font-medium text-green-600">Off-Duty</p>
                <p className="text-lg font-bold text-green-900">{log.off_duty_hours}h</p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-royal-200">
                <p className="text-xs font-medium text-royal-600">Miles</p>
                <p className="text-lg font-bold text-royal-900">{log.miles}</p>
              </div>
            </div>

            {/* Notes */}
            {log.notes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {log.notes.map((note, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-royal-200 text-royal-700"
                  >
                    {note}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-royal-50 rounded-xl border border-royal-200">
        <h4 className="text-sm font-semibold text-royal-700 mb-3">Timeline Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
            <span className="text-royal-600">Driving Time</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded"></div>
            <span className="text-royal-600">On-Duty (Non-Driving)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
            <span className="text-royal-600">Off-Duty/Sleeper</span>
          </div>
        </div>
      </div>
    </div>
  );
};