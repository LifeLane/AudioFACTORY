import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info': default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgClass = () => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-900';
      case 'success': return 'bg-green-50 border-green-200 text-green-900';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'info': default: return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-md min-w-[320px] max-w-md ${getBgClass()}`}
      >
        {getIcon()}
        <div className="flex-1 text-sm font-medium">{message}</div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-black/5 transition-colors">
          <X className="w-4 h-4 opacity-70" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
