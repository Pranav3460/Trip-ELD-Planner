import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { TripForm } from './components/TripForm';
import { TripMap } from './components/TripMap';
import { TripSummary } from './components/TripSummary';
import { ELDLogViewer } from './components/ELDLogViewer';
import { TripRequest, TripResponse } from './types';
import { computeTrip } from './services/tripPlanning';

function App() {
  const [tripData, setTripData] = useState<TripResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  } as const;

  const handleTripSubmit = async (request: TripRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await computeTrip(request);
      setTripData(response);
    } catch (err) {
      setError('Failed to compute trip. Please try again.');
      console.error('Trip computation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-50 via-white to-gold-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Sidebar - Trip Form */}
          <div className="xl:col-span-1">
            <TripForm onSubmit={handleTripSubmit} isLoading={isLoading} />
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-8">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Map Section */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {!tripData && isLoading ? (
                <div className="h-[500px] bg-white rounded-2xl shadow-xl border border-royal-200 overflow-hidden animate-pulse" />
              ) : (
                <TripMap tripData={tripData} />
              )}
            </motion.div>

            {/* Trip Summary above ELD Logs */}
            {tripData && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <TripSummary tripData={tripData} />
              </motion.div>
            )}

            {/* ELD Logs Section */}
            {tripData && tripData.daily_logs.length > 0 && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <ELDLogViewer logs={tripData.daily_logs} />
              </motion.div>
            )}

            {/* Welcome Message */}
            {!tripData && !isLoading && (
              <div className="bg-white rounded-2xl shadow-xl border border-royal-200 p-8 text-center backdrop-blur-sm bg-white/95">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-br from-royal-500 to-royal-600 rounded-2xl text-white inline-block mb-6">
                    <Truck className="h-12 w-12" />
                  </div>
                  <h2 className="text-2xl font-bold text-royal-900 mb-4">
                    Welcome to Trip & ELD Planner
                  </h2>
                  <p className="text-royal-600 leading-relaxed">
                    Plan your routes with precision and ensure DOT compliance. Calculate driving hours, 
                    manage your HOS cycles, and visualize your trip with fuel stops and rest periods.
                  </p>
                  <div className="mt-6 text-sm text-royal-500">
                    <p>✓ Route optimization</p>
                    <p>✓ ELD log generation</p>
                    <p>✓ Fuel stop planning</p>
                    <p>✓ DOT compliance tracking</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;