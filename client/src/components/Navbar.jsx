import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import sound from '../utils/soundEngine';
import {
  ShieldCheck,
  LayoutDashboard,
  Receipt,
  Settings,
  LogOut,
  Volume2,
  VolumeX,
  Lock,
  Zap,
  ShieldAlert,
  Crown,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());

  const handleLogout = () => {
    sound.playClick();
    logout();
    navigate('/login');
  };

  const toggleSound = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Security & Keys', path: '/settings', icon: Settings },
    ...(user?.role === 'ADMIN'
      ? [{ name: 'Admin Console', path: '/admin', icon: ShieldAlert }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 bg-[#070A13]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/dashboard"
            onClick={() => sound.playClick()}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-[#090D1A] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white font-display">
                  Fin<span className="text-emerald-400">Track</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                  ASVS 4.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Zero-Trust Financial Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#0C1122]/90 p-1.5 rounded-xl border border-white/10 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => sound.playClick()}
                  onMouseEnter={() => sound.playHover()}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-neon-emerald'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar: Audio FX Toggle & Profile & Logout */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Audio Engine FX Toggle */}
            <button
              onClick={toggleSound}
              onMouseEnter={() => sound.playHover()}
              className={`relative p-2 rounded-xl border transition-all duration-200 btn-interactive ${
                soundEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-neon-emerald'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title={soundEnabled ? 'Sound FX Enabled (Click to Mute)' : 'Sound FX Muted (Click to Unmute)'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* User Session Chip */}
            <div className="hidden lg:flex flex-col text-right px-3 py-1 bg-surface-card rounded-lg border border-white/10">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[160px] flex items-center justify-end gap-1">
                {user?.role === 'ADMIN' && <Crown className="w-3 h-3 text-purple-400" />}
                {user?.email}
              </span>
              <span className={`text-[9px] font-mono flex items-center justify-end gap-1 ${
                user?.role === 'ADMIN' ? 'text-purple-300' : 'text-emerald-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  user?.role === 'ADMIN' ? 'bg-purple-400' : 'bg-emerald-400'
                }`}></span>
                {user?.role === 'ADMIN' ? 'RBAC: ADMIN' : 'Owner-Scoped'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-all btn-interactive"
              title="Terminate authenticated session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-white/10 bg-[#0A0E1D]">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => sound.playClick()}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1.5 px-3 rounded-lg ${
                isActive ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.name.split(' ')[0]}
            </Link>
          );
        })}
      </div>
    </header>
  );
};

export default Navbar;
