import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import sound from '../utils/soundEngine';
import {
  Sparkles,
  AlertCircle,
  KeyRound,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Cpu,
} from 'lucide-react';

export const AiAssistant = ({ hasAiKey = true, onRefreshData }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);
  const [dataSnapshot, setDataSnapshot] = useState(null);

  const handleGenerateInsight = async () => {
    sound.playAiChirp();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/generate');
      setInsight(response.data.insight);
      setDataSnapshot(response.data.dataSnapshot);
      sound.playSuccess();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      sound.playError();
      const serverError = err.response?.data?.error;
      const errorCode = err.response?.data?.code;

      if (errorCode === 'AI_KEY_NOT_CONFIGURED') {
        setError('No AI API key configured. Securely encrypt your API key in Settings & Security.');
      } else {
        setError(serverError || 'Failed to synthesize AI insights. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative glass-panel-glow rounded-3xl p-6 sm:p-7 overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-[#0E1529]/90 via-[#101A33]/85 to-[#0A0E1D]/90 shadow-2xl">
      {/* Background Animated Gradient Orbs */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur opacity-40 animate-pulse"></div>
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight font-display">
                  FinTrack AI Financial Intelligence
                </h3>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                  AES-256-GCM
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Autonomous spending hygiene, risk assessment & budget recommendations
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateInsight}
            disabled={loading}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold tracking-wide shadow-neon-emerald transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-interactive cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Synthesizing Telemetry...' : 'Generate New Insights'}</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-200">{error}</p>
              {error.includes('Settings') && (
                <Link
                  to="/settings"
                  onClick={() => sound.playClick()}
                  className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 font-medium transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Configure BYO AI Key in Settings
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Insights Content */}
        {insight ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#090E1E]/90 border border-white/10 shadow-inner space-y-3">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-bold tracking-wide">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Synthesized Analysis</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Zero Plaintext Key Exposure</span>
              </div>
              <div className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                {insight}
              </div>
            </div>

            {dataSnapshot && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center hover:border-emerald-500/30 transition-colors">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Income</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">${dataSnapshot.totalIncome?.toFixed(2)}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center hover:border-rose-500/30 transition-colors">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Expenses</span>
                  <span className="text-sm font-extrabold text-rose-400 font-mono">${dataSnapshot.totalExpenses?.toFixed(2)}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center hover:border-cyan-500/30 transition-colors">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Savings Rate</span>
                  <span className="text-sm font-extrabold text-cyan-400 font-mono">{dataSnapshot.savingsRate}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center hover:border-purple-500/30 transition-colors">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Transactions</span>
                  <span className="text-sm font-extrabold text-slate-200 font-mono">{dataSnapshot.transactionCount} entries</span>
                </div>
              </div>
            )}
          </div>
        ) : !loading && (
          <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-white/15 bg-slate-950/40">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1 font-display">
              Activate Autonomous Financial Synthesis
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
              Click below to trigger an owner-scoped audit of your income, expenditure concentration, and savings rate.
            </p>
            <button
              onClick={handleGenerateInsight}
              onMouseEnter={() => sound.playHover()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold tracking-wide transition-all btn-interactive"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              Analyze Financial Telemetry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3 py-6 animate-pulse">
            <div className="h-4 bg-slate-800/80 rounded-lg w-3/4"></div>
            <div className="h-4 bg-slate-800/80 rounded-lg w-full"></div>
            <div className="h-4 bg-slate-800/80 rounded-lg w-5/6"></div>
            <div className="h-3 bg-slate-800/50 rounded-lg w-1/2 pt-2"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAssistant;
