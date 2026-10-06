import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Cpu,
  FileSpreadsheet,
  FileJson,
  Fingerprint,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Server,
  ShieldAlert,
} from 'lucide-react';
import {
  playHover,
  playClick,
  playSuccess,
  playError,
  playAiChirp,
  playSecurityArm,
  isAudioMuted,
  setAudioMuted,
} from '../utils/soundEngine';

export const Settings = () => {
  const { user } = useAuth();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasAiKey, setHasAiKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [deletingKey, setDeletingKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [muted, setMutedState] = useState(isAudioMuted());
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchKeyStatus = async () => {
    try {
      const res = await api.get('/ai/key/status');
      setHasAiKey(res.data.hasAiKey);
    } catch (err) {
      console.error('Failed to fetch AI key status:', err);
    }
  };

  useEffect(() => {
    fetchKeyStatus();
  }, []);

  const handleToggleMute = () => {
    const nextState = !muted;
    setAudioMuted(nextState);
    setMutedState(nextState);
    if (!nextState) {
      playSuccess();
    }
  };

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    playClick();
    setSavingKey(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await api.post('/ai/key', { apiKey: apiKeyInput.trim() });
      playSecurityArm();
      playSuccess();
      setHasAiKey(true);
      setApiKeyInput('');
      setStatusMsg({
        type: 'success',
        text: 'AI API Key securely encrypted at rest using AES-256-GCM (Isolated IV & GCM Auth Tag).',
      });
    } catch (err) {
      playError();
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to encrypt and store API key.',
      });
    } finally {
      setSavingKey(false);
    }
  };

  const handleDeleteKey = async () => {
    playClick();
    if (!window.confirm('Are you sure you want to delete your stored AI API key?')) return;

    setDeletingKey(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await api.delete('/ai/key');
      playSecurityArm();
      setHasAiKey(false);
      setStatusMsg({ type: 'success', text: 'Stored encrypted AI key deleted securely from database.' });
    } catch (err) {
      playError();
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to remove API key.',
      });
    } finally {
      setDeletingKey(false);
    }
  };

  const handleTestSynthesis = async () => {
    playClick();
    setTestingKey(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await api.post('/ai/chat', { message: 'Ping! Test cryptographic pipeline.' });
      playAiChirp();
      playSuccess();
      setStatusMsg({
        type: 'success',
        text: `AI Core Verification Success: ${res.data.reply.slice(0, 80)}...`,
      });
    } catch (err) {
      playError();
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.error || 'AI synthesis failed. Verify your key validity.',
      });
    } finally {
      setTestingKey(false);
    }
  };

  const handleExportData = async (format) => {
    playClick();
    setExporting(true);
    try {
      const res = await api.get('/transactions?limit=1000');
      const transactions = res.data.transactions || [];

      if (format === 'json') {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `novanexus_vault_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        playSuccess();
      } else if (format === 'csv') {
        const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount'];
        const rows = transactions.map((t) => [
          t.id,
          t.date,
          t.type,
          `"${(t.category || '').replace(/"/g, '""')}"`,
          `"${(t.description || '').replace(/"/g, '""')}"`,
          t.amount,
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `novanexus_vault_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        playSuccess();
      }
    } catch (err) {
      playError();
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:32px_32px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-space">
                Security Center & Vault Config
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              AES-256-GCM Key Encryption • Zero-Trust Database Isolation • ASVS 4.0 Certified
            </p>
          </div>

          {/* Sound Toggle Status */}
          <button
            onClick={handleToggleMute}
            onMouseEnter={() => playHover()}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold font-mono transition-all ${
              !muted
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/20'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            {!muted ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>Procedural Audio: {!muted ? 'ACTIVE' : 'MUTED'}</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMsg.text && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="font-mono">{statusMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main BYO AI Key Management Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* BYO AI Key Section */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-[#0F172A]/90 to-[#111827]/90 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-space">Bring Your Own AI Key (BYO-AI)</h3>
                    <p className="text-xs text-slate-400 font-mono">Google Gemini 2.5 Flash / OpenAI Compatible</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold font-mono ${
                    hasAiKey
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/20'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${hasAiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {hasAiKey ? 'Vault Active (AES-256-GCM)' : 'No Custom Key'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Your API key is encrypted using <strong className="text-emerald-400">AES-256-GCM</strong> with an isolated 96-bit random IV and 128-bit authentication tag before database persistence. Decryption occurs strictly in-memory during server-to-server synthesis requests and is never exposed to the frontend.
              </p>

              <form onSubmit={handleSaveKey} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                    Enter Gemini or OpenAI API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      required
                      placeholder="e.g. AIzaSy... or sk-proj-..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="glass-input pl-4 pr-12 py-2.5 text-xs rounded-xl w-full font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {hasAiKey && (
                      <button
                        type="button"
                        onClick={handleDeleteKey}
                        disabled={deletingKey}
                        onMouseEnter={() => playHover()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingKey ? 'Purging...' : 'Delete Key'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleTestSynthesis}
                      disabled={testingKey}
                      onMouseEnter={() => playHover()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{testingKey ? 'Testing Pipeline...' : 'Test AI Pipeline'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={savingKey}
                    onMouseEnter={() => playHover()}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{savingKey ? 'Encrypting & Saving...' : 'Save & Encrypt Key'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Data Export & Sovereignty */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-space">Owner Data Export & Sovereignty</h3>
                  <p className="text-xs text-slate-400 font-mono">Export your owner-scoped transactions for offline cold-storage auditing</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleExportData('json')}
                  disabled={exporting}
                  onMouseEnter={() => playHover()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium transition-colors cursor-pointer"
                >
                  <FileJson className="w-4 h-4 text-emerald-400" />
                  <span>Export JSON Archive</span>
                </button>
                <button
                  onClick={() => handleExportData('csv')}
                  disabled={exporting}
                  onMouseEnter={() => playHover()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span>Export CSV Spreadsheet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Security Auditing & Compliance Card */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                <Fingerprint className="w-4 h-4" />
                <span>Security Assurance Checklist</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold">User Session Storage</span>
                  <span className="font-semibold text-slate-200 font-mono">sessionStorage (Isolated Tab Scope)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold">Token Lifespan</span>
                  <span className="font-semibold text-slate-200 font-mono">15-Minute Short-Lived JWT</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold">Password Hashing</span>
                  <span className="font-semibold text-slate-200 font-mono">Bcrypt with Salt Rounds = 12</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold">Database Isolation</span>
                  <span className="font-semibold text-slate-200 font-mono">Owner-Scoped (where: &#123; id, userId &#125;)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono font-semibold">Cryptographic Standard</span>
                  <span className="font-semibold text-slate-200 font-mono">AES-256-GCM (IV + Auth Tag)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
