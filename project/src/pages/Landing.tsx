import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// Fallback illustration in case landing-bg.png is missing
import TruckSvg from '../undraw_delivery-truck_mjui.svg';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { when: 'beforeChildren', staggerChildren: 0.15 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const;

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-royal-50 via-white to-gold-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Subtle animated gradient shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="floating-blob blob-blue" />
        <div className="floating-blob blob-gold" />
      </div>

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-10" variants={cardVariants}>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-royal-900 tracking-tight">
            Trip & ELD Planner
          </h1>
          <p className="mt-3 text-royal-600 max-w-2xl mx-auto">
            Plan compliant routes with precision. Visualize maps, fuel stops, and ELD logs.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto rounded-3xl border border-royal-200 shadow-xl bg-white/80 backdrop-blur-md overflow-hidden"
          variants={cardVariants}
        >
          <div className="aspect-[16/9] sm:aspect-[21/9] w-full">
            {/* Prefer PNG in assets if present; fallback to inline SVG illustration */}
            <div
              className="h-full w-full bg-center bg-cover"
              style={{ backgroundImage: `url(${TruckSvg})` }}
            >
              <div className="h-full w-full bg-gradient-to-t from-white/40 via-transparent to-transparent" />
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <img src={TruckSvg} alt="Truck Illustration" className="hidden" />
            <p className="text-center text-royal-600">
              Smart routing • Fuel planning • ELD visualization
            </p>
          </div>
        </motion.div>

        <motion.div className="mt-10 flex justify-center" variants={cardVariants}>
          <button
            onClick={() => navigate('/planner')}
            className="px-8 py-3 rounded-2xl text-white text-lg font-semibold bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-royal-300 active:scale-95"
          >
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              Get Started
            </motion.span>
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Landing;


