import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, AlertCircle, LogIn, Disc } from 'lucide-react';
import { useFirebase } from '../services/firebaseContext';
import { AdManager } from '../src/monetization/AdManager';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginGoogle, loginGuest, user } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    AdManager.getInstance().suppressAds('login');
    try {
      await loginGoogle();
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
      AdManager.getInstance().resumeAds('login');
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError(null);
    AdManager.getInstance().suppressAds('login');
    try {
      await loginGuest();
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error("Guest sign in error:", err);
      setError(err.message || "Failed to continue as guest.");
    } finally {
      setIsLoading(false);
      AdManager.getInstance().resumeAds('login');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#FDFCFB] border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 overflow-hidden"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Disc className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold font-mono tracking-tight text-black mb-2">Join AudioFACTORY</h2>
            <p className="text-gray-600 font-sans text-sm">Create an account to save your generated audio, access custom voices, and unlock unlimited history.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-black text-white font-mono font-bold uppercase tracking-wider rounded-xl border-2 border-transparent hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign In with Google
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 font-mono text-xs uppercase">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              onClick={handleGuestSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white text-black font-mono font-bold uppercase tracking-wider rounded-xl border-2 border-gray-200 hover:border-black hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User className="w-5 h-5" />
              Continue as Guest
            </button>
          </div>
          
          <div className="mt-8 text-center">
             <p className="text-xs text-gray-400 font-sans">
               By continuing, you agree to our Terms of Service and Privacy Policy.
             </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
