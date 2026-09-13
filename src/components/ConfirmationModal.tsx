import React, { useEffect } from 'react';
import { Contest } from '../types';
import confetti from 'canvas-confetti';
import { CheckCircle2, Calendar, Award, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConfirmationModalProps {
  contest: Contest;
  isOpen: boolean;
  onClose: () => void;
  customMessage?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  contest,
  isOpen,
  onClose,
  customMessage,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger festive celebration confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content text-center max-w-lg p-8 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-indigo-500 to-cyan-400" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
          Submission Received
        </span>

        <h2 className="text-2xl font-bold text-white mb-3">
          Thank You for Testing!
        </h2>

        <p className="text-gray-300 text-sm leading-relaxed mb-6 bg-slate-900/60 p-4 rounded-xl border border-white/5">
          {customMessage || contest.custom_confirmation_message || 
            `Thank you for your submission to The Test Troop. Your testing feedback for "${contest.title}" has been recorded.`}
        </p>

        {/* METRICS CARD */}
        <div className="grid grid-cols-2 gap-3 text-left mb-6 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-gray-400 font-medium block">Contest Name</span>
            <span className="text-white font-semibold truncate block">{contest.title}</span>
          </div>
          
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Result Date
            </span>
            <span className="text-indigo-300 font-bold block">{formatDate(contest.result_date)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="btn btn-secondary flex-1"
          >
            Close
          </button>
          <Link 
            to="/dashboard" 
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            onClick={onClose}
          >
            <span>My Contests</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
