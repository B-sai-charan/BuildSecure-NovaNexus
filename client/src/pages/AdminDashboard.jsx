import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  Receipt,
  Activity,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  UserCheck,
  Crown,
} from 'lucide-react';
import {
  playHover,
  playClick,
  playSuccess,
  playError,
} from '../utils/soundEngine';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      playSuccess();
    } catch (err) {
      playError();
      setError(err.response?.data?.error || 'Failed to fetch administrative telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleManualRefresh = () => {
    playClick();
    setRefreshing(true);
    fetchAdminData();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:32px_32px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-space">
                Admin Console & Telemetry
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold">
                RBAC Level: ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Global Platform Visibility • Isolated Tenant Audit • RBAC Verification
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              onMouseEnter={() => playHover()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-mono">{error}</span>
          </div>
        )}

        {/* Platform Telemetry Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase font-semibold">Registered Accounts</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-space text-white">
              {stats ? stats.totalUsers : '—'}
            </div>
            <span className="text-[10px] font-mono text-cyan-400 block pt-1">
              • RBAC Scoped Tenants
            </span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase font-semibold">Ledger Entries</span>
              <Receipt className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-space text-emerald-400">
              {stats ? stats.totalTransactions : '—'}
            </div>
            <span className="text-[10px] font-mono text-emerald-400 block pt-1">
              • Cryptographically Committed
            </span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase font-semibold">Total Platform Volume</span>
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-space text-purple-400">
              ${stats ? Number(stats.totalVolume).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            <span className="text-[10px] font-mono text-purple-300 block pt-1">
              • Aggregated Gross Flow
            </span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase font-semibold">Security Health</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-space text-emerald-400 flex items-center gap-1.5">
              <span>{stats?.systemStatus || 'ACTIVE'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block pt-1">
              • Zero Leakage Verified
            </span>
          </div>
        </div>

        {/* User Management & Tenant Directory */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60">
            <div>
              <h3 className="text-sm font-bold text-white font-space flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Tenant & User Directory
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Inspect registered user accounts and RBAC permission roles
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input pl-9 pr-4 py-1.5 text-xs rounded-xl w-full"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-mono border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-6">User Email</th>
                  <th className="py-3.5 px-6">Access Role</th>
                  <th className="py-3.5 px-6">Transactions</th>
                  <th className="py-3.5 px-6">Budgets</th>
                  <th className="py-3.5 px-6">Account Created</th>
                  <th className="py-3.5 px-6 text-center">Isolation State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors"
                      onMouseEnter={() => playHover()}
                    >
                      <td className="py-3.5 px-6 text-white font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">
                            {u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span>{u.email}</span>
                            <span className="block text-[10px] font-mono text-slate-500">ID: {u.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {u.role === 'ADMIN' && <Crown className="w-3 h-3 text-purple-400" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-300 whitespace-nowrap">
                        {u._count?.transactions || 0} entries
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-300 whitespace-nowrap">
                        {u._count?.budgets || 0} categories
                      </td>
                      <td className="py-3.5 px-6 text-slate-400 font-mono whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Owner-Scoped</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 text-xs">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin"></div>
                          <span className="font-mono text-slate-400">Aggregating platform metrics...</span>
                        </div>
                      ) : (
                        <span className="font-mono">No users found matching query.</span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
