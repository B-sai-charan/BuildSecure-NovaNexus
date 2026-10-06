import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import AiAssistant from '../components/AiAssistant';
import sound from '../utils/soundEngine';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  PlusCircle,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Calendar,
  Lock,
  Zap,
  Activity,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#10B981', '#06B6D4', '#8B5CF6', '#F43F5E', '#F59E0B', '#3B82F6', '#EC4899'];

export const Dashboard = () => {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, txRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions?limit=10'),
      ]);

      setSummary(summaryRes.data.summary || { totalIncome: 0, totalExpenses: 0, netBalance: 0 });
      const txList = txRes.data.transactions || [];
      setRecentTransactions(txList);

      // Process Category Breakdown for Recharts Pie
      const catMap = {};
      const dateMap = {};

      txList.forEach((tx) => {
        if (tx.type === 'EXPENSE') {
          catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
        }

        const dateKey = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { date: dateKey, income: 0, expense: 0 };
        }
        if (tx.type === 'INCOME') {
          dateMap[dateKey].income += tx.amount;
        } else {
          dateMap[dateKey].expense += tx.amount;
        }
      });

      const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
      setCategoryData(pieData);

      const areaData = Object.values(dateMap).reverse();
      setTimelineData(areaData.length > 0 ? areaData : [
        { date: 'Active', income: summaryRes.data.summary?.totalIncome || 0, expense: summaryRes.data.summary?.totalExpenses || 0 }
      ]);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const savingsRate = summary.totalIncome > 0
    ? ((summary.netBalance / summary.totalIncome) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col bg-cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner with Security Badge */}
        <div className="relative glass-panel rounded-3xl p-6 sm:p-8 overflow-hidden border border-white/10 bg-gradient-to-r from-[#0C1226]/90 via-[#0E1730]/85 to-[#0A0F20]/90 shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>SYSTEM ACTIVE • OWASP ASVS LEVEL 2</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
                Zero-Trust Financial Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Real-time cryptographic ledger with owner-scoped data isolation and in-memory AES-256-GCM AI synthesis.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/transactions"
                onClick={() => sound.playClick()}
                onMouseEnter={() => sound.playHover()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-neon-emerald transition-all btn-interactive cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>New Transaction</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => sound.playClick()}
                onMouseEnter={() => sound.playHover()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all btn-interactive cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security Audit</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Net Balance Card */}
          <div
            onMouseEnter={() => sound.playHover()}
            className="glass-panel-interactive p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Net Balance</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${summary.netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                ${summary.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-3 text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Cryptographic Ledger</span>
            </div>
          </div>

          {/* Total Income */}
          <div
            onMouseEnter={() => sound.playHover()}
            className="glass-panel-interactive p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Total Inflow</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                +${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Direct Deposits</span>
            </div>
          </div>

          {/* Total Expenses */}
          <div
            onMouseEnter={() => sound.playHover()}
            className="glass-panel-interactive p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Total Outflow</span>
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
                -${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Discretionary & Fixed Costs</span>
            </div>
          </div>

          {/* Savings Rate */}
          <div
            onMouseEnter={() => sound.playHover()}
            className="glass-panel-interactive p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Savings Rate</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <PieIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
                {savingsRate}%
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">
              Target benchmark: &gt;20.0%
            </div>
          </div>
        </div>

        {/* AI Financial Assistant Widget */}
        <AiAssistant onRefreshData={fetchDashboardData} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income vs Expense Timeline */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white font-display">Cashflow Trajectory</h3>
                <p className="text-xs text-slate-400">Inflow vs. Outflow Temporal Distribution</p>
              </div>
              <span className="text-xs text-emerald-300 font-mono bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Telemetry
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1C2540" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B1020', borderColor: '#1F2937', borderRadius: '12px', fontSize: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" name="Income ($)" />
                  <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" name="Expense ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense by Category Pie Chart */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-display">Expense Allocation</h3>
              <p className="text-xs text-slate-400">Category Concentration & Exposure</p>
            </div>

            <div className="h-56 w-full my-auto">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => `$${Number(val).toFixed(2)}`}
                      contentStyle={{ backgroundColor: '#0B1020', borderColor: '#1F2937', borderRadius: '12px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                  No expense distribution logged yet
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {categoryData.slice(0, 4).map((c, idx) => (
                <span key={c.name} className="text-[10px] font-mono text-slate-300 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  {c.name}: ${c.value.toFixed(0)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white font-display">Recent Activity Feed</h3>
              <p className="text-xs text-slate-400">Owner-Scoped Cryptographic Ledger Entries</p>
            </div>
            <Link
              to="/transactions"
              onClick={() => sound.playClick()}
              onMouseEnter={() => sound.playHover()}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1020] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTransactions.slice(0, 6).map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  return (
                    <tr
                      key={tx.id}
                      onMouseEnter={() => sound.playHover()}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-200">
                        {tx.category}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 truncate max-w-xs">
                        {tx.description || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isIncome
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 text-right font-mono font-bold ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isIncome ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
