import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  Sparkles,
  AlertCircle,
  KeyRound,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AiAssistant = ({ hasAiKey = true, onRefreshData }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);
  const [dataSnapshot, setDataSnapshot] = useState(null);

  const handleGenerateInsight = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/generate');
      setInsight(response.data.insight);
      setDataSnapshot(response.data.dataSnapshot);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      const serverError = err.response?.data?.error;
      const errorCode = err.response?.data?.code;

      if (errorCode === 'AI_KEY_NOT_CONFIGURED') {
        setError('No AI API key found. Please save your API key in Security Settings first.');
      } else {
        setError(serverError || 'Failed to generate AI insights. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-[#111827] to-[#141E33] shadow-xl">
      {/* Background Decorative Glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">FinTrack AI Advisor</h3>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AES-256-GCM In-Memory
              </span>
            </div>
            <p className="text-xs text-slate-400">Owner-scoped monthly financial synthesis & budget hygiene</p>
          </div>
        </div>

        <button
          onClick={handleGenerateInsight}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synthesizing Data...' : 'Generate New Insights'}</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            {error.includes('Settings') && (
              <Link
                to="/settings"
                className="inline-flex items-center gap-1 mt-2 text-emerald-400 hover:text-emerald-300 font-medium underline"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Go to Settings & add BYO AI Key
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Insights Content Container */}
      {insight ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Current Month Analysis</span>
            </div>
            <div className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
              {insight}
            </div>
          </div>

          {dataSnapshot && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Income</span>
                <span className="text-xs font-bold text-emerald-400">${dataSnapshot.totalIncome?.toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Expenses</span>
                <span className="text-xs font-bold text-rose-400">${dataSnapshot.totalExpenses?.toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Savings Rate</span>
                <span className="text-xs font-bold text-cyan-400">{dataSnapshot.savingsRate}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Transactions</span>
                <span className="text-xs font-bold text-slate-200">{dataSnapshot.transactionCount}</span>
              </div>
            </div>
          )}
        </div>
      ) : !loading && (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-white/10 bg-slate-900/30">
          <TrendingUp className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-200 mb-1">Unlock Autonomous Spending Intelligence</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Click "Generate New Insights" to run an owner-scoped financial audit using your encrypted AI key.
          </p>
          <button
            onClick={handleGenerateInsight}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analyze Financial Trends
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3 py-4 animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          <div className="h-3 bg-slate-800/60 rounded w-1/2 pt-2"></div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
