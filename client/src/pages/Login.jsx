import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import sound from '../utils/soundEngine';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Zap,
  Key,
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    location.search.includes('expired=true') ? 'Your session has expired. Please authenticate again.' : ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    sound.playClick();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      sound.playSuccess();
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      sound.playError();
      const msg = err.response?.data?.error || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDemo = () => {
    sound.playSuccess();
    setFormData({
      email: 'demo@novanexus.com',
      password: 'SecurePass!123',
    });
  };

  return (
    <div className="min-h-screen bg-[#070A13] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-cyber-grid">
      {/* Dynamic Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="relative inline-flex mb-4">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-40 animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-2xl">
            <div className="w-full h-full bg-[#090D1A] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-9 h-9 text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-white tracking-tight font-display">
          Authenticate <span className="text-gradient-emerald">FinTrack</span>
        </h2>
        <p className="mt-2 text-xs text-slate-400 font-mono">
          NIST SP 800-63B & OWASP ASVS v4.0 Zero-Trust Vault
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase font-mono tracking-wider mb-2">
                User Principal Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input block w-full pl-10 pr-4 py-3 sm:text-sm rounded-xl"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
                  Password
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">Bcrypt (Salt Rounds ≥ 12)</span>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="glass-input block w-full pl-10 pr-4 py-3 sm:text-sm rounded-xl font-mono"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Quick Demo Autofill Shortcut */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAutofillDemo}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all btn-interactive cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Autofill Hackathon Demo Account</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-neon-emerald disabled:opacity-50 transition-all btn-interactive cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400">
              Don't have a secure identity?{' '}
              <Link to="/register" onClick={() => sound.playClick()} className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                Register Principal
              </Link>
            </p>
          </div>
        </div>

        {/* Security Assurance Badge */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            15-Minute Ephemeral JWT & Zero Memory Leakage
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
