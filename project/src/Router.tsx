import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './pages/Landing';
import Planner from './pages/Planner';

const RouteTransitions: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-royal-200"><h1 className="text-2xl font-bold text-royal-900 mb-2">Page not found</h1><p className="text-royal-600">The page you are looking for doesn’t exist.</p></div></div>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <RouteTransitions />
  </BrowserRouter>
);

export default AppRouter;


