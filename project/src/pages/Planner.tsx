import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import App from '../App';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

export const Planner: React.FC = () => {
  return (
    <AnimatePresence mode="wait">
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <App />
      </motion.div>
    </AnimatePresence>
  );
};

export default Planner;


